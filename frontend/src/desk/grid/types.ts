export interface GridColumn {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  format?: (val: any, row: any) => any;
  width?: string;
  minWidth?: string;
  style?: string;
  classes?: string;
  editable?: boolean;
}
