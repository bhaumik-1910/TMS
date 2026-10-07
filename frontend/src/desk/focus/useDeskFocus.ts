import { ref } from 'vue';
import { getFocusableElements } from './trap';

const savedFocusElement = ref<HTMLElement | null>(null);

/**
 * Checks whether an element is truly visible in the DOM.
 * Standardizes visibility check without using offsetParent (which fails on position:fixed dialogs and menus).
 */
export function isElementVisible(el: HTMLElement | null): boolean {
  if (!el || !el.isConnected) return false;
  if (el.classList.contains('q-menu--hidden')) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Checks whether text matches common dummy placeholder labels that should be skipped.
 */
export function isPlaceholderText(text: string): boolean {
  const t = (text || '').trim().toLowerCase();
  return (
    t === '— select —' ||
    t === '– select –' ||
    t === '- select -' ||
    t === 'select...' ||
    t === 'select…' ||
    t === '-- select --' ||
    t === 'select' ||
    t === 'choose...' ||
    t === 'none' ||
    t === ''
  );
}

/**
 * Finds any currently open Quasar dropdown popup menu in the document.
 */
export function getOpenMenu(): HTMLElement | null {
  const menus = Array.from(document.querySelectorAll<HTMLElement>('.q-menu'));
  return (
    menus.find((m) => isElementVisible(m)) || null
  );
}

export function getFormInputs(container: HTMLElement = document.body): HTMLElement[] {
  const selector =
    'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), ' +
    'select:not([disabled]), ' +
    'textarea:not([disabled]), ' +
    '.q-field__native[tabindex="0"], ' +
    '.q-field__control[tabindex="0"], ' +
    '[role="combobox"]';

  const candidates = Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(isElementVisible);
  const result: HTMLElement[] = [];
  const seenFields = new Set<HTMLElement>();

  for (const el of candidates) {
    const parentField = el.closest<HTMLElement>('.q-field');
    if (parentField) {
      if (seenFields.has(parentField)) {
        continue;
      }
      seenFields.add(parentField);
      result.push(el);
    } else {
      result.push(el);
    }
  }

  return result;
}

export function useDeskFocus() {
  function saveFocus(el?: HTMLElement | null) {
    savedFocusElement.value = el || (document.activeElement as HTMLElement | null);
  }

  function restoreFocus() {
    if (savedFocusElement.value && typeof savedFocusElement.value.focus === 'function') {
      savedFocusElement.value.focus();
      savedFocusElement.value = null;
    }
  }

  function focusFirst(container: HTMLElement = document.body) {
    const focusables = getFocusableElements(container);
    if (focusables[0]) {
      focusables[0].focus();
      return true;
    }
    return false;
  }

  function focusNext(container: HTMLElement = document.body): boolean {
    const focusables = getFocusableElements(container);
    const currentIndex = focusables.findIndex((el) => el === document.activeElement);
    if (currentIndex >= 0 && currentIndex < focusables.length - 1) {
      focusables[currentIndex + 1].focus();
      return true;
    }
    return false;
  }

  function focusPrevious(container: HTMLElement = document.body): boolean {
    const focusables = getFocusableElements(container);
    const currentIndex = focusables.findIndex((el) => el === document.activeElement);
    if (currentIndex > 0) {
      focusables[currentIndex - 1].focus();
      return true;
    }
    return false;
  }

  function focusNextInput(container: HTMLElement = document.body, fromElement?: HTMLElement | null): boolean {
    const inputs = getFormInputs(container);
    if (inputs.length === 0) return false;

    const active = fromElement || (document.activeElement as HTMLElement | null);
    const activeField = active?.closest('.q-field');

    let currentIndex = -1;
    if (active) {
      currentIndex = inputs.findIndex(
        (el) =>
          el === active ||
          el.contains(active) ||
          (activeField && (el === activeField || el.closest('.q-field') === activeField))
      );
    }

    // Fallback if exact match wasn't found: find first input following active in DOM order
    if (currentIndex === -1 && active) {
      for (let i = 0; i < inputs.length; i++) {
        if (active.compareDocumentPosition(inputs[i]) & Node.DOCUMENT_POSITION_FOLLOWING) {
          currentIndex = i - 1;
          break;
        }
      }
    }

    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      const next = inputs[currentIndex + 1];
      next.scrollIntoView?.({ block: 'nearest' });
      next.focus();
      if ('select' in next && typeof (next as any).select === 'function') {
        (next as any).select();
      }
      return true;
    }
    return false;
  }

  function focusPreviousInput(container: HTMLElement = document.body, fromElement?: HTMLElement | null): boolean {
    const inputs = getFormInputs(container);
    if (inputs.length === 0) return false;

    const active = fromElement || (document.activeElement as HTMLElement | null);
    const activeField = active?.closest('.q-field');

    let currentIndex = -1;
    if (active) {
      currentIndex = inputs.findIndex(
        (el) =>
          el === active ||
          el.contains(active) ||
          (activeField && (el === activeField || el.closest('.q-field') === activeField))
      );
    }

    if (currentIndex > 0) {
      const prev = inputs[currentIndex - 1];
      prev.scrollIntoView?.({ block: 'nearest' });
      prev.focus();
      if ('select' in prev && typeof (prev as any).select === 'function') {
        (prev as any).select();
      }
      return true;
    }
    return false;
  }

  function focusFirstInvalid(formElement: HTMLElement): boolean {
    const invalidSelector =
      '.q-field--error input, .q-field--error select, .q-field--error textarea, [aria-invalid="true"], :invalid';
    const firstInvalid = formElement.querySelector<HTMLElement>(invalidSelector);
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
      return true;
    }
    return false;
  }

  return {
    saveFocus,
    restoreFocus,
    focusFirst,
    focusNext,
    focusPrevious,
    focusNextInput,
    focusPreviousInput,
    getFormInputs,
    focusFirstInvalid,
  };
}

let globalDropdownNavigationInitialized = false;
let lastFocusedSelect: HTMLElement | null = null;

function advanceFocusFrom(fromEl: HTMLElement | null) {
  if (!fromEl) return;

  // 1. If inside a table filter toolbar (.desk-grid-toolbar or top-level filter group)
  const isInsideDialog = !!fromEl.closest('.desk-dialog, .q-dialog, form, .desk-form, .q-card');
  let toolbar: HTMLElement | null = fromEl.closest('.desk-grid-toolbar');
  if (!toolbar && !isInsideDialog) {
    const parent = fromEl.parentElement;
    if (parent && parent.querySelectorAll('.desk-filter-select, .desk-combo, .q-select').length > 1) {
      toolbar = parent;
    } else if (parent?.parentElement && parent.parentElement.querySelectorAll('.desk-filter-select, .desk-combo, .q-select').length > 1) {
      toolbar = parent.parentElement;
    }
  }
  if (toolbar) {
    const focusableList: HTMLElement[] = [];
    const searchInput = toolbar.querySelector<HTMLElement>(
      '.desk-search-input input, .desk-grid-search input, input[type="search"]'
    );
    if (searchInput && isElementVisible(searchInput)) focusableList.push(searchInput);

    const combos = Array.from(toolbar.querySelectorAll<HTMLElement>('.desk-filter-select, .desk-combo, .q-select'));
    const seen = new Set<HTMLElement>();
    for (const combo of combos) {
      const native =
        combo.querySelector<HTMLElement>('.q-field__native[tabindex="0"]') ||
        combo.querySelector<HTMLElement>('.q-field__control[tabindex="0"]') ||
        combo.querySelector<HTMLElement>('input:not([type="hidden"])') ||
        combo.querySelector<HTMLElement>('[tabindex="0"]') ||
        combo;
      if (native && isElementVisible(native) && !seen.has(native)) {
        seen.add(native);
        focusableList.push(native);
      }
    }

    const currentIdx = focusableList.findIndex(
      (el) => el === fromEl || el.contains(fromEl) || (fromEl && fromEl.contains(el))
    );

    if (currentIdx >= 0 && currentIdx < focusableList.length - 1) {
      const nextTarget = focusableList[currentIdx + 1];
      nextTarget.focus();
      if ('select' in nextTarget && typeof (nextTarget as any).select === 'function') {
        (nextTarget as any).select();
      }
      return;
    } else {
      // Last filter reached: pass focus to table grid for immediate arrow navigation
      const grid = toolbar.closest('.desk-grid') || document.querySelector('.desk-grid, .q-table');
      if (grid instanceof HTMLElement) {
        grid.focus();
        return;
      }
    }
    return;
  }

  // 2. If inside a Modal / Drawer / Form (Add or Edit)
  const container = (
    fromEl.closest('.desk-dialog') ||
    fromEl.closest('.q-dialog') ||
    fromEl.closest('form') ||
    fromEl.closest('.desk-form') ||
    fromEl.closest('.q-card') ||
    document.querySelector('.desk-dialog:not([style*="display: none"])') ||
    document.querySelector('.q-dialog:not([style*="display: none"])') ||
    document.body
  ) as HTMLElement;

  const { focusNextInput } = useDeskFocus();
  const advanced = focusNextInput(container, fromEl);
  if (!advanced && container !== document.body) {
    const confirmBtn = container.querySelector<HTMLButtonElement>(
      '.modal-btn-confirm, button[type="submit"], .btn-save, [data-desk-accept], .btn-primary-cyan'
    );
    if (confirmBtn) {
      confirmBtn.click();
    }
  }
}

export function setupGlobalDropdownNavigation() {
  if (typeof window === 'undefined' || globalDropdownNavigationInitialized) return;
  globalDropdownNavigationInitialized = true;

  // Track the most recently focused select in document
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement | null;
    const sel = target?.closest<HTMLElement>('.q-select, .desk-combo, .desk-filter-select, [role="combobox"]');
    if (sel) {
      lastFocusedSelect = sel;
    }
  });

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      // Only plain Enter key (not Shift, Ctrl, Alt, Meta)
      if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      // Check if any open dropdown popup menu exists in document
      const openMenu = getOpenMenu();
      const active = document.activeElement as HTMLElement | null;

      // Identify if the active element is a dropdown / q-select / desk-combo
      const qSelect = active?.closest<HTMLElement>('.q-select, .desk-combo, .desk-filter-select, [role="combobox"]');

      // ── CASE 1: POPUP MENU IS OPEN ──
      // This is the 2nd Enter (or Enter after selecting with Arrow keys):
      // Select the highlighted / first valid option, close menu, and pass focus to NEXT field.
      if (openMenu) {
        const items = Array.from(openMenu.querySelectorAll<HTMLElement>('.q-item:not(.disabled)'));
        if (items.length > 0) {
          event.preventDefault();
          event.stopPropagation();

          // Locate highlighted item or first non-placeholder option
          let targetItem: HTMLElement | null = null;
          const focusedItem = openMenu.querySelector<HTMLElement>('.q-manual-focus--is-focused, .q-item--active, .desk-option-active');
          if (focusedItem) {
            const text = focusedItem.textContent?.trim() || '';
            if (!isPlaceholderText(text)) {
              targetItem = focusedItem;
            }
          }

          if (!targetItem) {
            targetItem = items.find((it) => !isPlaceholderText(it.textContent?.trim() || '')) || items[0];
          }

          if (targetItem) {
            targetItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            targetItem.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            targetItem.click();
          }

          const relevantSelect = qSelect || lastFocusedSelect;

          const doAdvance = () => {
            advanceFocusFrom(relevantSelect);
          };

          setTimeout(doAdvance, 35);
          setTimeout(doAdvance, 90);
          setTimeout(doAdvance, 170);
          return;
        }
      }

      // ── CASE 2: POPUP MENU IS CLOSED AND DROPDOWN IS FOCUSED ──
      // This is the 1st Enter:
      // OPEN the dropdown menu so options are displayed to the user!
      if (qSelect && !openMenu) {
        event.preventDefault();
        event.stopPropagation();
        lastFocusedSelect = qSelect;
        const clickTarget =
          qSelect.querySelector<HTMLElement>('.q-field__append .q-icon') ||
          qSelect.querySelector<HTMLElement>('.q-field__control') ||
          qSelect.querySelector<HTMLElement>('.q-field__native') ||
          qSelect;
        clickTarget.click();
        clickTarget.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true }));

        // Immediately pre-highlight the first real valid option so it's ready for 2nd Enter!
        setTimeout(() => {
          const menu = getOpenMenu();
          if (menu) {
            const menuItems = Array.from(menu.querySelectorAll<HTMLElement>('.q-item:not(.disabled)'));
            const firstValid = menuItems.find((it) => !isPlaceholderText(it.textContent?.trim() || '')) || menuItems[0];
            if (firstValid) {
              menuItems.forEach((it) => it.classList.remove('q-manual-focus--is-focused', 'desk-option-active'));
              firstValid.classList.add('q-manual-focus--is-focused', 'desk-option-active');
              firstValid.scrollIntoView({ block: 'nearest' });
            }
          }
        }, 50);
      }
    },
    true // Capture phase to run before local listeners
  );
}
