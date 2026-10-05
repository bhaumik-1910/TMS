import { onMounted, onBeforeUnmount, unref, Ref } from 'vue';
import { useDeskFocus } from '../focus/useDeskFocus';

export interface DeskPageShortcutsOptions {
  /** Reference to DeskDataTable or search input element */
  gridRef?: Ref<any>;
  searchInputRef?: Ref<any>;
  onFocusSearch?: () => void;

  /** Action when Alt+C, Alt+N, Ctrl+N, or Insert is pressed (New Record / Voucher) */
  onNewRecord?: () => void;

  /** List of filter combo refs or focus callbacks: Alt+1, Alt+2, Alt+3, Alt+4 */
  filters?: Array<Ref<any> | (() => void)>;

  /** Whether a modal, drawer, or dialog is currently open */
  isModalOpen?: Ref<boolean> | (() => boolean);

  /** Action when Ctrl+A, Alt+S, or Enter on last field is pressed inside an active modal (Tally Accept) */
  onSave?: () => void;

  /** Action when Escape is pressed */
  onEscape?: () => void;
}

/**
 * Standardized Tally-Style Keyboard Navigation & Action Composable for TMS Pages.
 * Provides unified handling of:
 * - New Record: Alt+C, Alt+N, Ctrl+N, Insert, or desk:new-record event
 * - Search Focus: Alt+F, F3, Ctrl+F, '/' (when outside inputs), or desk:focus-search event
 * - Filter Quick-Jumps: Alt+1, Alt+2, Alt+3, Alt+4
 * - Modal Form Save / Accept: Ctrl+A, Alt+S, Ctrl+S, or Enter on last field
 * - Dismiss / Close: Escape
 */
export function useDeskPageShortcuts(options: DeskPageShortcutsOptions) {
  const { focusNextInput, focusPreviousInput } = useDeskFocus();

  function getIsModalOpen(): boolean {
    if (!options.isModalOpen) return false;
    return typeof options.isModalOpen === 'function'
      ? options.isModalOpen()
      : unref(options.isModalOpen);
  }

  function focusSearchField() {
    if (options.onFocusSearch) {
      options.onFocusSearch();
    } else if (options.gridRef?.value?.focusSearch) {
      options.gridRef.value.focusSearch();
    } else if (options.searchInputRef?.value?.focus) {
      options.searchInputRef.value.focus();
    } else {
      // Fallback: querySelector for input with desk-search-input or search placeholder
      const el = document.querySelector<HTMLInputElement>(
        '.desk-search-input input, .desk-grid-search input, .search-input, input[placeholder*="Search"]'
      );
      el?.focus();
      el?.select?.();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    const activeEl = document.activeElement as HTMLElement | null;
    const inInput =
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable ||
        activeEl.closest('.q-field') !== null);

    const modalOpen = getIsModalOpen();

    // 1. If Modal / Drawer is Open:
    if (modalOpen) {
      // Ctrl+A, Alt+S or Ctrl+S -> Form Save / Tally Accept
      if (
        ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 's')) ||
        (e.altKey && key === 's')
      ) {
        if (options.onSave) {
          e.preventDefault();
          e.stopPropagation();
          options.onSave();
          return;
        }
      }

      // Escape -> Close Modal
      if (key === 'escape') {
        if (options.onEscape) {
          e.preventDefault();
          e.stopPropagation();
          options.onEscape();
          return;
        }
      }

      // Enter key navigation inside open modal
      if (key === 'enter') {
        const modalContainer = (document.querySelector('.desk-dialog, .q-dialog:not(.hidden)') || document.body) as HTMLElement;
        const tag = activeEl?.tagName?.toLowerCase();

        // Shift+Enter goes back
        if (e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          focusPreviousInput(modalContainer);
          return;
        }

        // Allow multiline textareas normal Enter
        if (tag === 'textarea' && !e.ctrlKey) {
          return;
        }

        if (inInput) {
          const advanced = focusNextInput(modalContainer);
          e.preventDefault();
          e.stopPropagation();

          // On last input field -> Submit / Accept!
          if (!advanced && options.onSave) {
            options.onSave();
          }
          return;
        }
      }

      return;
    }

    // 2. Main Page Actions (when modal is NOT open):

    // A. Focus Search: Alt+F, F3, Ctrl+F, or '/' (when not typing in an input)
    if (
      (e.altKey && key === 'f') ||
      e.key === 'F3' ||
      ((e.ctrlKey || e.metaKey) && key === 'f') ||
      (!e.altKey && !e.ctrlKey && !e.metaKey && key === '/' && !inInput)
    ) {
      e.preventDefault();
      e.stopPropagation();
      focusSearchField();
      return;
    }

    // B. New Record: Ctrl+A (when modal is closed), Alt+C, Alt+N, Ctrl+N or Insert
    if (
      ((e.ctrlKey || e.metaKey) && (key === 'a' || key === 'n')) ||
      (e.altKey && (key === 'c' || key === 'n')) ||
      e.key === 'Insert'
    ) {
      if (options.onNewRecord) {
        e.preventDefault();
        e.stopPropagation();
        options.onNewRecord();
        return;
      }
    }

    // C. Filter Combo Jumps: Alt+1, Alt+2, Alt+3, Alt+4
    if (e.altKey && ['1', '2', '3', '4', '5'].includes(key) && options.filters) {
      const idx = parseInt(key, 10) - 1;
      const filterTarget = options.filters[idx];
      if (filterTarget) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof filterTarget === 'function') {
          filterTarget();
        } else {
          const val = unref(filterTarget);
          if (val?.focusAndOpen) {
            val.focusAndOpen();
          } else if (val?.focus) {
            val.focus();
          } else if (val?.showPopup) {
            val.showPopup();
          }
        }
        return;
      }
    }
  }

  // Global DeskKeyStrip event listeners (fired by bottom strip clicks or global dispatcher)
  function onDeskNewRecord() {
    if (!getIsModalOpen() && options.onNewRecord) {
      options.onNewRecord();
    }
  }

  function onDeskFocusSearch() {
    if (!getIsModalOpen()) {
      focusSearchField();
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown, { capture: true });
    window.addEventListener('desk:new-record', onDeskNewRecord);
    window.addEventListener('desk:focus-search', onDeskFocusSearch);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown, { capture: true });
    window.removeEventListener('desk:new-record', onDeskNewRecord);
    window.removeEventListener('desk:focus-search', onDeskFocusSearch);
  });

  return {
    focusSearchField,
  };
}
