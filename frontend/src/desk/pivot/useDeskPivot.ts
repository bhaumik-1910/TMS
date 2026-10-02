import { ref, computed } from 'vue';
import type { PivotConfig, PivotMatrixRow, PivotTableCell } from './types';

export function useDeskPivot<T = Record<string, any>>(
  dataRef: { value: T[] } | (() => T[]),
  configRef: { value: PivotConfig } | (() => PivotConfig)
) {
  const selectedRowIndex = ref<number>(0);

  const pivotResult = computed(() => {
    const rawData = typeof dataRef === 'function' ? dataRef() : dataRef.value;
    const config = typeof configRef === 'function' ? configRef() : configRef.value;

    if (!rawData || !rawData.length) {
      return { columnHeaders: [], matrixRows: [] };
    }

    const colDim = config.columns[0];
    const uniqueColValues: string[] = [];
    if (colDim) {
      const set = new Set<string>();
      rawData.forEach((item: any) => {
        const v = String(item[colDim.field] ?? 'Other');
        set.add(v);
      });
      uniqueColValues.push(...Array.from(set).sort());
    } else {
      uniqueColValues.push('Value');
    }

    const rowGroups: Map<string, { labels: Record<string, string>; items: any[] }> = new Map();

    rawData.forEach((item: any) => {
      const rowKeyParts = config.rows.map((r) => String(item[r.field] ?? '-'));
      const groupKey = rowKeyParts.join('__');

      if (!rowGroups.has(groupKey)) {
        const labels: Record<string, string> = {};
        config.rows.forEach((r) => {
          labels[r.field] = String(item[r.field] ?? '-');
        });
        rowGroups.set(groupKey, { labels, items: [] });
      }
      rowGroups.get(groupKey)!.items.push(item);
    });

    const matrixRows: PivotMatrixRow[] = [];

    rowGroups.forEach((group, groupKey) => {
      const cells: Record<string, PivotTableCell> = {};

      uniqueColValues.forEach((colVal) => {
        config.measures.forEach((m) => {
          const cellKey = colDim ? `${colVal}_${m.field}` : m.field;
          const matchingItems = colDim
            ? group.items.filter((it) => String(it[colDim.field] ?? 'Other') === colVal)
            : group.items;

          const numValues = matchingItems
            .map((it) => Number(it[m.field]))
            .filter((v) => !isNaN(v));

          let calculated = 0;
          if (m.agg === 'sum') {
            calculated = numValues.reduce((a, b) => a + b, 0);
          } else if (m.agg === 'count') {
            calculated = matchingItems.length;
          } else if (m.agg === 'avg') {
            calculated = numValues.length ? numValues.reduce((a, b) => a + b, 0) / numValues.length : 0;
          } else if (m.agg === 'min') {
            calculated = numValues.length ? Math.min(...numValues) : 0;
          } else if (m.agg === 'max') {
            calculated = numValues.length ? Math.max(...numValues) : 0;
          }

          cells[cellKey] = {
            value: calculated,
            formatted: m.formatter ? m.formatter(calculated) : calculated.toLocaleString(),
          };
        });
      });

      matrixRows.push({
        key: groupKey,
        labels: group.labels,
        cells,
      });
    });

    return {
      columnHeaders: uniqueColValues,
      matrixRows,
    };
  });

  function selectNextRow() {
    if (selectedRowIndex.value < pivotResult.value.matrixRows.length - 1) {
      selectedRowIndex.value++;
    }
  }

  function selectPrevRow() {
    if (selectedRowIndex.value > 0) {
      selectedRowIndex.value--;
    }
  }

  return {
    pivotResult,
    selectedRowIndex,
    selectNextRow,
    selectPrevRow,
  };
}
