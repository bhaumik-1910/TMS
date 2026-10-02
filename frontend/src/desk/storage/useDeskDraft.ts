import { ref, watch } from 'vue';
import { deskGet, deskSet, deskRemove } from './deskStorage';

export function useDeskDraft<T extends Record<string, any>>(draftKey: string, initialData: T) {
  const draftData = ref<T>({ ...initialData });

  // Load saved draft if present
  const saved = deskGet<T>(`draft_${draftKey}`);
  if (saved) {
    Object.assign(draftData.value, saved);
  }

  // Auto-save debounced watcher
  let timer: any = null;
  watch(
    draftData,
    (newVal) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        deskSet(`draft_${draftKey}`, newVal);
      }, 400);
    },
    { deep: true }
  );

  function clearDraft() {
    deskRemove(`draft_${draftKey}`);
    draftData.value = { ...initialData };
  }

  return {
    draftData,
    clearDraft,
  };
}
