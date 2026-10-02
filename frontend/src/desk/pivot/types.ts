export type PivotAggregationType = 'sum' | 'count' | 'avg' | 'min' | 'max';

export interface PivotDimension {
  field: string;
  label: string;
  width?: string;
}

export interface PivotMeasure {
  field: string;
  label: string;
  agg: PivotAggregationType;
  formatter?: (val: number) => string;
}

export interface PivotConfig {
  rows: PivotDimension[];
  columns: PivotDimension[];
  measures: PivotMeasure[];
  showGrandTotals?: boolean;
}

export interface PivotTableCell {
  value: number | string | null;
  formatted: string;
  isTotal?: boolean;
  isGrandTotal?: boolean;
}

export interface PivotMatrixRow {
  key: string;
  labels: Record<string, string>;
  cells: Record<string, PivotTableCell>;
  isTotal?: boolean;
  isGrandTotal?: boolean;
}
