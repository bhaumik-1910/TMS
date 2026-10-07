import { ref, computed, nextTick, type Ref } from 'vue';

export interface TableNavOptions<T> {
  items: Ref<T[]> | (() => T[]);
  tableRef?: Ref<HTMLElement | null>;
  colCount?: Ref<number> | number | (() => number);
  pageSize?: number;
  onEnter?: (item: T, rowIndex: number, colIndex: number) => void;
  onSpace?: (item: T, rowIndex: number, colIndex: number) => void;
  onDelete?: (item: T, rowIndex: number) => void;
  onPrint?: (item: T, rowIndex: number) => void;
  onNew?: () => void;
  onEscape?: () => void;
  onCellAction?: (item: T, rowIndex: number, colIndex: number) => void;
}

export function useTableNavigation<T = any>(options: TableNavOptions<T>) {
  const focusedRow = ref<number>(0);
  const focusedCol = ref<number>(0);
  const pageSize = options.pageSize ?? 10;

  // Backward compatibility alias for single-dimension row indexing
  const focusedIndex = focusedRow;

  const currentItems = computed<T[]>(() => {
    if (typeof options.items === 'function') {
      return options.items();
    }
    return options.items.value || [];
  });

  const resolvedColCount = computed<number>(() => {
    if (options.colCount === undefined) return 1;
    if (typeof options.colCount === 'function') {
      return Math.max(1, options.colCount());
    }
    if (typeof options.colCount === 'object' && 'value' in options.colCount) {
      return Math.max(1, options.colCount.value);
    }
    return Math.max(1, options.colCount);
  });

  const focusedItem = computed<T | null>(() => {
    const list = currentItems.value;
    if (focusedRow.value >= 0 && focusedRow.value < list.length) {
      return list[focusedRow.value];
    }
    return null;
  });

  const focusedActionIndex = ref<number>(0);

  function getActionButtonsInCurrentCell(): HTMLButtonElement[] {
    if (!options.tableRef?.value) return [];
    const table = options.tableRef.value;
    const rows = table.querySelectorAll<HTMLElement>(
      'tbody tr:not(.empty-state-row)'
    );
    if (rows && rows[focusedRow.value]) {
      const row = rows[focusedRow.value];
      const cells = row.querySelectorAll<HTMLElement>('td');
      if (cells && cells[focusedCol.value]) {
        const cell = cells[focusedCol.value];
        return Array.from(cell.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
      }
    }
    return [];
  }

  function isCellActive(rowIndex: number, colIndex: number): boolean {
    return focusedRow.value === rowIndex && focusedCol.value === colIndex;
  }

  function isActionBtnActive(rowIndex: number, colIndex: number, btnIndex: number): boolean {
    return focusedRow.value === rowIndex && focusedCol.value === colIndex && focusedActionIndex.value === btnIndex;
  }

  function isRowActive(rowIndex: number): boolean {
    return focusedRow.value === rowIndex;
  }

  function scrollToFocusedCell() {
    nextTick(() => {
      if (!options.tableRef?.value) return;
      const table = options.tableRef.value;
      const rows = table.querySelectorAll<HTMLElement>(
        'tbody tr:not(.empty-state-row)'
      );
      if (rows && rows[focusedRow.value]) {
        const row = rows[focusedRow.value];
        const cells = row.querySelectorAll<HTMLElement>('td');
        if (cells && cells[focusedCol.value]) {
          const cell = cells[focusedCol.value];
          const buttons = Array.from(cell.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
          if (buttons.length > 0 && buttons[focusedActionIndex.value]) {
            buttons[focusedActionIndex.value].focus();
            buttons[focusedActionIndex.value].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          } else {
            cell.focus();
            cell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          }
        } else {
          row.focus();
          row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  }

  function scrollToFocused() {
    scrollToFocusedCell();
  }

  function setFocusCell(row: number, col: number) {
    const totalRows = currentItems.value.length;
    const totalCols = resolvedColCount.value;
    if (totalRows === 0) {
      focusedRow.value = -1;
      focusedCol.value = 0;
      focusedActionIndex.value = 0;
      return;
    }
    focusedRow.value = Math.max(0, Math.min(row, totalRows - 1));
    focusedCol.value = Math.max(0, Math.min(col, totalCols - 1));
    focusedActionIndex.value = 0;
    scrollToFocusedCell();
  }

  function setActionFocus(row: number, col: number, btnIndex: number) {
    const totalRows = currentItems.value.length;
    const totalCols = resolvedColCount.value;
    if (totalRows === 0) return;
    focusedRow.value = Math.max(0, Math.min(row, totalRows - 1));
    focusedCol.value = Math.max(0, Math.min(col, totalCols - 1));
    focusedActionIndex.value = Math.max(0, btnIndex);
    scrollToFocusedCell();
  }

  function setFocusIndex(index: number) {
    setFocusCell(index, focusedCol.value);
  }

  // 2D Excel Movement Functions
  function moveUp(delta = 1) {
    const totalRows = currentItems.value.length;
    if (totalRows === 0) return;
    if (focusedRow.value > 0) {
      focusedRow.value = Math.max(0, focusedRow.value - delta);
      scrollToFocusedCell();
    } else {
      options.onEscape?.();
    }
  }

  function moveDown(delta = 1) {
    const totalRows = currentItems.value.length;
    if (totalRows === 0) return;
    if (focusedRow.value < totalRows - 1) {
      focusedRow.value = Math.min(totalRows - 1, focusedRow.value + delta);
      scrollToFocusedCell();
    }
  }

  function moveLeft() {
    const totalRows = currentItems.value.length;
    const totalCols = resolvedColCount.value;
    if (totalRows === 0) return;

    // Check if current cell has multiple action buttons
    const buttons = getActionButtonsInCurrentCell();
    if (buttons.length > 1 && focusedActionIndex.value > 0) {
      focusedActionIndex.value -= 1;
      scrollToFocusedCell();
      return;
    }

    if (focusedCol.value > 0) {
      focusedCol.value -= 1;
      nextTick(() => {
        const prevButtons = getActionButtonsInCurrentCell();
        if (prevButtons.length > 0) {
          focusedActionIndex.value = prevButtons.length - 1;
        } else {
          focusedActionIndex.value = 0;
        }
        scrollToFocusedCell();
      });
    } else if (focusedRow.value > 0) {
      // Wrap to last cell of previous row
      focusedRow.value -= 1;
      focusedCol.value = totalCols - 1;
      nextTick(() => {
        const prevButtons = getActionButtonsInCurrentCell();
        if (prevButtons.length > 0) {
          focusedActionIndex.value = prevButtons.length - 1;
        } else {
          focusedActionIndex.value = 0;
        }
        scrollToFocusedCell();
      });
    }
  }

  function moveRight() {
    const totalRows = currentItems.value.length;
    const totalCols = resolvedColCount.value;
    if (totalRows === 0) return;

    // Check if current cell has multiple action buttons
    const buttons = getActionButtonsInCurrentCell();
    if (buttons.length > 1 && focusedActionIndex.value < buttons.length - 1) {
      focusedActionIndex.value += 1;
      scrollToFocusedCell();
      return;
    }

    focusedActionIndex.value = 0;
    if (focusedCol.value < totalCols - 1) {
      focusedCol.value += 1;
      scrollToFocusedCell();
    } else if (focusedRow.value < totalRows - 1) {
      // Wrap to first cell of next row
      focusedRow.value += 1;
      focusedCol.value = 0;
      scrollToFocusedCell();
    }
  }

  function moveFirstCol() {
    focusedCol.value = 0;
    scrollToFocusedCell();
  }

  function moveLastCol() {
    focusedCol.value = Math.max(0, resolvedColCount.value - 1);
    scrollToFocusedCell();
  }

  function moveFirstRow() {
    if (currentItems.value.length === 0) return;
    focusedRow.value = 0;
    scrollToFocusedCell();
  }

  function moveLastRow() {
    const totalRows = currentItems.value.length;
    if (totalRows === 0) return;
    focusedRow.value = totalRows - 1;
    scrollToFocusedCell();
  }

  function moveFirstCell() {
    if (currentItems.value.length === 0) return;
    focusedRow.value = 0;
    focusedCol.value = 0;
    scrollToFocusedCell();
  }

  function moveLastCell() {
    const totalRows = currentItems.value.length;
    if (totalRows === 0) return;
    focusedRow.value = totalRows - 1;
    focusedCol.value = Math.max(0, resolvedColCount.value - 1);
    scrollToFocusedCell();
  }

  function movePageDown() {
    const totalRows = currentItems.value.length;
    if (totalRows === 0) return;
    focusedRow.value = Math.min(totalRows - 1, focusedRow.value + pageSize);
    scrollToFocusedCell();
  }

  function movePageUp() {
    if (currentItems.value.length === 0) return;
    focusedRow.value = Math.max(0, focusedRow.value - pageSize);
    scrollToFocusedCell();
  }

  function handleKeydown(
    e: KeyboardEvent,
    item?: T,
    rowIndex?: number,
    colIndex?: number
  ) {
    const actualRow = rowIndex !== undefined ? rowIndex : focusedRow.value;
    const actualCol = colIndex !== undefined ? colIndex : focusedCol.value;
    const actualItem = item !== undefined ? item : focusedItem.value;

    switch (e.key) {
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        e.stopPropagation();
        moveDown();
        break;

      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        e.stopPropagation();
        moveUp();
        break;

      case 'ArrowRight':
      case 'Right':
        e.preventDefault();
        e.stopPropagation();
        moveRight();
        break;

      case 'ArrowLeft':
      case 'Left':
        e.preventDefault();
        e.stopPropagation();
        moveLeft();
        break;

      case 'Tab':
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          moveLeft();
        } else {
          moveRight();
        }
        break;

      case 'Home':
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey) {
          moveFirstCell();
        } else {
          moveFirstCol();
        }
        break;

      case 'End':
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey) {
          moveLastCell();
        } else {
          moveLastCol();
        }
        break;

      case 'PageDown':
        e.preventDefault();
        e.stopPropagation();
        movePageDown();
        break;

      case 'PageUp':
        e.preventDefault();
        e.stopPropagation();
        movePageUp();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        // If an action button is currently focused, click it directly!
        const currentButtons = getActionButtonsInCurrentCell();
        if (currentButtons.length > 0 && currentButtons[focusedActionIndex.value]) {
          currentButtons[focusedActionIndex.value].click();
          return;
        }
        if (actualItem) {
          if (options.onEnter) {
            options.onEnter(actualItem, actualRow, actualCol);
          } else {
            // Excel standard: Enter advances to next row
            moveDown();
          }
        }
        break;

      case 'Delete':
        if (actualItem && options.onDelete) {
          e.preventDefault();
          e.stopPropagation();
          options.onDelete(actualItem, actualRow);
        }
        break;

      case 'p':
      case 'P':
        if ((e.ctrlKey || e.altKey) && actualItem && options.onPrint) {
          e.preventDefault();
          e.stopPropagation();
          options.onPrint(actualItem, actualRow);
        }
        break;

      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        options.onEscape?.();
        break;

      default:
        // Alt+D delete shortcut
        if (e.altKey && e.key.toLowerCase() === 'd' && actualItem && options.onDelete) {
          e.preventDefault();
          e.stopPropagation();
          options.onDelete(actualItem, actualRow);
        }
        // Alt+C / Alt+N new record shortcut
        if (e.altKey && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'n') && options.onNew) {
          e.preventDefault();
          e.stopPropagation();
          options.onNew();
        }
        break;
    }
  }

  return {
    focusedRow,
    focusedCol,
    focusedIndex,
    focusedItem,
    focusedActionIndex,
    isCellActive,
    isActionBtnActive,
    isRowActive,
    setFocusCell,
    setActionFocus,
    setFocusIndex,
    scrollToFocused,
    scrollToFocusedCell,
    moveNext: moveDown,
    movePrev: moveUp,
    moveLeft,
    moveRight,
    moveFirst: moveFirstRow,
    moveLast: moveLastRow,
    moveFirstCol,
    moveLastCol,
    moveFirstCell,
    moveLastCell,
    movePageDown,
    movePageUp,
    handleKeydown,
  };
}
