import { ref, Ref } from 'vue';
import { useQuasar } from 'quasar';

export function useFormDialog<TFormData, TEntity = TFormData>(
  submitFn: (payload: TFormData, id?: string) => Promise<TEntity>,
  options?: {
    successMessage?: string;
    onSuccess?: (result: TEntity) => void;
  },
) {
  const $q = useQuasar();
  const isOpen = ref<boolean>(false);
  const isEditing = ref<boolean>(false);
  const currentId = ref<string | null>(null);
  const formData = ref<TFormData>({} as TFormData) as Ref<TFormData>;
  const submitting = ref<boolean>(false);

  function openCreate(defaultValues: TFormData) {
    isEditing.value = false;
    currentId.value = null;
    formData.value = JSON.parse(JSON.stringify(defaultValues));
    isOpen.value = true;
  }

  function openEdit(id: string, initialValues: TFormData) {
    isEditing.value = true;
    currentId.value = id;
    formData.value = JSON.parse(JSON.stringify(initialValues));
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    submitting.value = false;
  }

  async function submit() {
    submitting.value = true;
    try {
      const result = await submitFn(formData.value, currentId.value || undefined);
      if (options?.successMessage) {
        $q.notify({
          type: 'positive',
          message: options.successMessage,
          position: 'top-right',
        });
      }
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      close();
      return result;
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err?.response?.data?.message || err?.message || 'Operation failed',
        position: 'top-right',
      });
      throw err;
    } finally {
      submitting.value = false;
    }
  }

  return {
    isOpen,
    isEditing,
    currentId,
    formData,
    submitting,
    openCreate,
    openEdit,
    close,
    submit,
  };
}
