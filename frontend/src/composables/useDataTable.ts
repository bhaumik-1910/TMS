import { ref, Ref } from 'vue';

export interface QTablePagination {
  sortBy?: string;
  descending?: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
}

export interface TableQueryParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  [key: string]: any;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export function useDataTable<T>(
  fetchFn: (params: TableQueryParams) => Promise<PaginatedApiResponse<T>>,
  initialSort: { sortBy?: string; descending?: boolean } = { sortBy: 'createdAt', descending: true },
) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const loading = ref<boolean>(false);
  const filter = ref<string>('');
  const selected = ref<T[]>([]) as Ref<T[]>;

  const pagination = ref<QTablePagination>({
    page: 1,
    rowsPerPage: 15,
    rowsNumber: 0,
    sortBy: initialSort.sortBy || 'createdAt',
    descending: initialSort.descending !== false,
  });

  async function onRequest(props?: { pagination?: QTablePagination; filter?: string }) {
    if (props?.pagination) {
      pagination.value = { ...pagination.value, ...props.pagination };
    }
    if (props?.filter !== undefined) {
      filter.value = props.filter;
    }

    loading.value = true;
    try {
      const params: TableQueryParams = {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        sortOrder: pagination.value.descending ? 'DESC' : 'ASC',
        search: filter.value?.trim() || undefined,
      };

      const response = await fetchFn(params);
      items.value = response.data || [];
      pagination.value.rowsNumber = response.total || response.data?.length || 0;
    } catch (err) {
      console.error('Error fetching table data:', err);
    } finally {
      loading.value = false;
    }
  }

  function resetPage() {
    pagination.value.page = 1;
    return onRequest();
  }

  return {
    items,
    loading,
    filter,
    selected,
    pagination,
    onRequest,
    resetPage,
  };
}
