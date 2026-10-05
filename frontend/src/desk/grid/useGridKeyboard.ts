import { ref, computed, watch, nextTick, Ref } from 'vue';

export interface GridKeyboardOptions {
  rowCount: Ref<number>;
  colCount: Ref<number>;
  pageSize?: Ref<number>;
  gridRootRef?: Ref<HTMLElement | null>;
  isCellEditable?: (rowIndex: number, colIndex: number) => boolean;
  onEdit?: (rowIndex: number, colIndex: number, initialChar?: string) => void;
  onCellCommit?: (rowIndex: number, colIndex: number, value: any) => void;
  onSelect?: (rowIndex: number) => void;
  onEnter?: (rowIndex: number, colIndex: number) => void;
  onDelete?: (rowIndex: number) => void;
}

export function useGridKeyboard(options: GridKeyboardOptions) {
  const activeRow = ref(0);
  const activeCol = ref(0);
  const isEditing = ref(false);
  const editInitialChar = ref<string | null>(null);

  // Aliases for explicit requirement: activeRowIndex & activeColIndex
  const activeRowIndex = activeRow;
  const activeColIndex = activeCol;

  const maxRow = computed(() => Math.max(0, options.rowCount.value - 1));
  const maxCol = computed(() => Math.max(0, options.colCount.value - 1));

  function scrollActiveCellIntoView() {
    if (typeof document === 'undefined') return;
    nextTick(() => {
      const root = options.gridRootRef?.value || document;
      const cell = root.querySelector('.desk-cell-active') as HTMLElement | null;
      if (cell) {
        cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    });
  }

  watch([activeRow, activeCol], () => {
    scrollActiveCellIntoView();
  });

  function setFocus(row: number, col: number) {
    activeRow.value = Math.max(0, Math.min(row, maxRow.value));
    activeCol.value = Math.max(0, Math.min(col, maxCol.value));
    scrollActiveCellIntoView();
  }

  function moveUp(delta = 1) {
    if (activeRow.value > 0) {
      activeRow.value = Math.max(0, activeRow.value - delta);
    }
  }

  function moveDown(delta = 1) {
    if (activeRow.value < maxRow.value) {
      activeRow.value = Math.min(maxRow.value, activeRow.value + delta);
    }
  }

  function moveLeft() {
    if (activeCol.value > 0) {
      activeCol.value--;
    } else if (activeRow.value > 0) {
      // Wrap to previous row's last column
      activeRow.value--;
      activeCol.value = maxCol.value;
    }
  }

  function moveRight() {
    if (activeCol.value < maxCol.value) {
      activeCol.value++;
    } else if (activeRow.value < maxRow.value) {
      // Wrap to next row's first column
      activeRow.value++;
      activeCol.value = 0;
    }
  }

  function startEdit(initialChar?: string) {
    const isEditable = options.isCellEditable
      ? options.isCellEditable(activeRow.value, activeCol.value)
      : true;

    if (!isEditable) return;

    isEditing.value = true;
    editInitialChar.value = initialChar || null;
    options.onEdit?.(activeRow.value, activeCol.value, initialChar);
  }

  function stopEdit() {
    isEditing.value = false;
    editInitialChar.value = null;
    // Return focus to grid root
    options.gridRootRef?.value?.focus();
  }

  function handleKeyDown(event: KeyboardEvent): boolean {
    const activeEl = document.activeElement as HTMLElement | null;
    const isInsideInput =
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable);

    // 1. When currently in Inline Edit Mode:
    if (isEditing.value) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        stopEdit();
        moveRight();
        return true;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        stopEdit();
        if (event.shiftKey) {
          moveLeft();
        } else {
          moveRight();
        }
        return true;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        stopEdit();
        return true;
      }
      // Allow user to type inside input
      return false;
    }

    // 2. Deep Grid Cell Navigation Mode (Tally & Excel style):
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        moveUp();
        return true;

      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        moveDown();
        return true;

      case 'ArrowLeft':
        if (!isInsideInput) {
          event.preventDefault();
          event.stopPropagation();
          moveLeft();
          return true;
        }
        break;

      case 'ArrowRight':
        if (!isInsideInput) {
          event.preventDefault();
          event.stopPropagation();
          moveRight();
          return true;
        }
        break;

      case 'Tab':
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          moveLeft();
        } else {
          moveRight();
        }
        return true;

      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          moveLeft();
        } else {
          // If cell is editable, Enter activates edit mode; otherwise advances to next cell!
          const editable = options.isCellEditable ? options.isCellEditable(activeRow.value, activeCol.value) : false;
          if (editable) {
            startEdit();
          } else if (options.onEnter) {
            options.onEnter(activeRow.value, activeCol.value);
            moveRight();
          } else {
            moveRight();
          }
        }
        return true;

      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        if (isEditing.value) {
          stopEdit();
        } else {
          options.gridRootRef?.value?.blur();
        }
        return true;

      case 'F2':
        event.preventDefault();
        event.stopPropagation();
        startEdit();
        return true;

      case ' ': // Spacebar selects row
        if (!isInsideInput) {
          event.preventDefault();
          event.stopPropagation();
          options.onSelect?.(activeRow.value);
          return true;
        }
        break;

      case 'Home':
        if (!isInsideInput) {
          event.preventDefault();
          event.stopPropagation();
          if (event.ctrlKey) {
            setFocus(0, 0);
          } else {
            activeCol.value = 0;
          }
          return true;
        }
        break;

      case 'End':
        if (!isInsideInput) {
          event.preventDefault();
          event.stopPropagation();
          if (event.ctrlKey) {
            setFocus(maxRow.value, maxCol.value);
          } else {
            activeCol.value = maxCol.value;
          }
          return true;
        }
        break;

      case 'PageUp':
        event.preventDefault();
        event.stopPropagation();
        moveUp(options.pageSize?.value || 10);
        return true;

      case 'PageDown':
        event.preventDefault();
        event.stopPropagation();
        moveDown(options.pageSize?.value || 10);
        return true;

      case 'Delete':
        if (!isInsideInput && options.onDelete) {
          event.preventDefault();
          event.stopPropagation();
          options.onDelete(activeRow.value);
          return true;
        }
        break;
    }

    // 3. Alphanumeric Key on Editable Cell -> Instantly activate edit mode!
    if (
      !isInsideInput &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      event.key.length === 1 &&
      /^[a-zA-Z0-9 _.,\-\/@#%&*()+=!?:;'"<>]$/.test(event.key)
    ) {
      const editable = options.isCellEditable
        ? options.isCellEditable(activeRow.value, activeCol.value)
        : true;
      if (editable) {
        event.preventDefault();
        event.stopPropagation();
        startEdit(event.key);
        return true;
      }
    }

    return false;
  }

  return {
    activeRow,
    activeCol,
    activeRowIndex,
    activeColIndex,
    isEditing,
    editInitialChar,
    setFocus,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    startEdit,
    stopEdit,
    handleKeyDown,
    scrollActiveCellIntoView,
  };
}
