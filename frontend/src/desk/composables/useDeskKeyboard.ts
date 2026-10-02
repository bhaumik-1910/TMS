import { ref, nextTick } from 'vue';
import type { DeskFieldContext } from '../types';

export function useDeskKeyboard(options?: {
  onSave?: () => void;
  onCancel?: () => void;
  onPromptAccept?: () => void;
}) {
  const fields = ref<DeskFieldContext[]>([]);
  const activeFieldId = ref<string | null>(null);

  function registerField(field: DeskFieldContext) {
    const existingIdx = fields.value.findIndex((f) => f.id === field.id);
    if (existingIdx !== -1) {
      fields.value[existingIdx] = field;
    } else {
      fields.value.push(field);
    }
  }

  function unregisterField(id: string) {
    fields.value = fields.value.filter((f) => f.id !== id);
    if (activeFieldId.value === id) {
      activeFieldId.value = null;
    }
  }

  function sortFieldsByDomOrder() {
    fields.value.sort((a, b) => {
      if (!a.el || !b.el) return 0;
      const pos = a.el.compareDocumentPosition(b.el);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  function focusFirst() {
    nextTick(() => {
      sortFieldsByDomOrder();
      if (fields.value.length > 0) {
        activeFieldId.value = fields.value[0].id;
        fields.value[0].focus();
      }
    });
  }

  function nextField(currentId: string) {
    sortFieldsByDomOrder();
    const idx = fields.value.findIndex((f) => f.id === currentId);
    if (idx !== -1 && idx < fields.value.length - 1) {
      const next = fields.value[idx + 1];
      activeFieldId.value = next.id;
      next.focus();
    } else if (idx === fields.value.length - 1) {
      // Reached the end of form -> Trigger Tally "Accept? Yes / No" prompt
      if (options?.onPromptAccept) {
        options.onPromptAccept();
      } else if (options?.onSave) {
        options.onSave();
      }
    }
  }

  function prevField(currentId: string) {
    sortFieldsByDomOrder();
    const idx = fields.value.findIndex((f) => f.id === currentId);
    if (idx > 0) {
      const prev = fields.value[idx - 1];
      activeFieldId.value = prev.id;
      prev.focus();
    }
  }

  function setActiveFieldId(id: string) {
    activeFieldId.value = id;
  }

  return {
    fields,
    activeFieldId,
    registerField,
    unregisterField,
    sortFieldsByDomOrder,
    focusFirst,
    nextField,
    prevField,
    setActiveFieldId,
  };
}
