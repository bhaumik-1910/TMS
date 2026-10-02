import { ref, computed, Ref } from 'vue';

export interface GridKeyboardOptions {
  rowCount: Ref<number>;
  colCount: Ref<number>;
  pageSize?: Ref<number>;
  onEdit?: (rowIndex: number, colIndex: number) => void;
  onSelect?: (rowIndex: number) => void;
  onEnter?: (rowIndex: number, colIndex: number) => void;
  onDelete?: (rowIndex: number) => void;
}

export function useGridKeyboard(options: GridKeyboardOptions) {
  const activeRow = ref(0);
  const activeCol = ref(0);
  const isEditing = ref(false);

  const maxRow = computed(() => Math.max(0, options.rowCount.value - 1));
  const maxCol = computed(() => Math.max(0, options.colCount.value - 1));

  function setFocus(row: number, col: number) {
    activeRow.value = Math.max(0, Math.min(row, maxRow.value));
    activeCol.value = Math.max(0, Math.min(col, maxCol.value));
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

  function handleKeyDown(event: KeyboardEvent): boolean {
    const activeEl = document.activeElement as HTMLElement | null;
    const isInsideInput =
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable);

    // If currently editing inside a text field, let native cursor movements happen
    if (isEditing.value) {
      if (event.key === 'Enter') {
        event.preventDefault();
        isEditing.value = false;
        options.onEnter?.(activeRow.value, activeCol.value);
        moveDown();
        return true;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        isEditing.value = false;
        if (event.shiftKey) {
          moveLeft();
        } else {
          moveRight();
        }
        return true;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        isEditing.value = false;
        return true;
      }
      // Allow arrows, typing, home/end inside input
      return false;
    }

    // Grid Navigation Mode (Not editing text)
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveUp();
        return true;

      case 'ArrowDown':
        event.preventDefault();
        moveDown();
        return true;

      case 'ArrowLeft':
        if (!isInsideInput) {
          event.preventDefault();
          moveLeft();
          return true;
        }
        break;

      case 'ArrowRight':
        if (!isInsideInput) {
          event.preventDefault();
          moveRight();
          return true;
        }
        break;

      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          moveLeft();
        } else {
          moveRight();
        }
        return true;

      case 'Enter':
        event.preventDefault();
        if (options.onEnter) {
          options.onEnter(activeRow.value, activeCol.value);
        } else {
          moveDown();
        }
        return true;

      case 'F2':
        event.preventDefault();
        isEditing.value = true;
        options.onEdit?.(activeRow.value, activeCol.value);
        return true;

      case ' ': // Spacebar selects row
        if (!isInsideInput) {
          event.preventDefault();
          options.onSelect?.(activeRow.value);
          return true;
        }
        break;

      case 'Home':
        if (!isInsideInput) {
          event.preventDefault();
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
        moveUp(options.pageSize?.value || 10);
        return true;

      case 'PageDown':
        event.preventDefault();
        moveDown(options.pageSize?.value || 10);
        return true;

      case 'Delete':
        if (!isInsideInput && options.onDelete) {
          event.preventDefault();
          options.onDelete(activeRow.value);
          return true;
        }
        break;
    }

    return false;
  }

  return {
    activeRow,
    activeCol,
    isEditing,
    setFocus,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    handleKeyDown,
  };
}
