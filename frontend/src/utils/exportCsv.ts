export interface CsvColumn<T = any> {
  label: string;
  field: keyof T | ((row: T) => any);
}

/**
 * Universal client-side CSV export utility.
 * Generates an RFC-4180 compliant CSV file with UTF-8 BOM for full Microsoft Excel compatibility.
 */
export function exportToCsv<T = any>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
): void {
  if (!rows || rows.length === 0) {
    console.warn('exportToCsv: No data to export.');
    return;
  }

  // 1. Format Header
  const headerLine = columns
    .map((col) => `"${col.label.replace(/"/g, '""')}"`)
    .join(',');

  // 2. Format Rows
  const rowLines = rows.map((row) => {
    return columns
      .map((col) => {
        let value: any;
        if (typeof col.field === 'function') {
          value = col.field(row);
        } else {
          value = row[col.field];
        }

        if (value === null || value === undefined) {
          return '""';
        }

        if (value instanceof Date) {
          return `"${value.toISOString()}"`;
        }

        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',');
  });

  // 3. Assemble with UTF-8 BOM
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger Native Browser Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${cleanFilename}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
