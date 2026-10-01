export interface PdfColumn<T = any> {
  label: string;
  field: keyof T | ((row: T) => any);
  align?: 'left' | 'center' | 'right';
}

export interface PdfExportOptions<T = any> {
  title: string;
  subtitle?: string;
  organization?: string;
  columns: PdfColumn<T>[];
  rows: T[];
}

/**
 * Universal client-side Printable PDF export utility.
 * Renders an enterprise TMS document with clean layout, company header,
 * summary counts, and triggers instant browser print-to-PDF.
 */
export function exportToPdf<T = any>(options: PdfExportOptions<T>): void {
  const { title, subtitle, organization = 'Ankpal Gati Shakti TMS', columns, rows } = options;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'warning',
        message: 'Popup Blocked',
        caption: 'Please allow popups in your browser to view and print the PDF report.',
      });
    });
    return;
  }

  const currentDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const tableHeaderHtml = columns
    .map(
      (col) =>
        `<th style="text-align: ${col.align || 'left'}; padding: 6px 10px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase;">${col.label}</th>`,
    )
    .join('');

  const tableRowsHtml = rows
    .map((row, idx) => {
      const cells = columns
        .map((col) => {
          let val: any;
          if (typeof col.field === 'function') {
            val = col.field(row);
          } else {
            val = row[col.field];
          }
          if (val === null || val === undefined) val = '-';
          return `<td style="text-align: ${col.align || 'left'}; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${val}</td>`;
        })
        .join('');
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      return `<tr style="background: ${bg};">${cells}</tr>`;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${organization}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .org-title {
            font-size: 20px;
            font-weight: 700;
            color: #0284c7;
          }
          .doc-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-top: 4px;
          }
          .meta {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .footer {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="org-title">🚚 ${organization}</div>
            <div class="doc-title">${title}</div>
            ${subtitle ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${subtitle}</div>` : ''}
          </div>
          <div class="meta">
            <div><strong>Generated:</strong> ${currentDate}</div>
            <div><strong>Total Records:</strong> ${rows.length}</div>
            <div><strong>Status:</strong> Official Report</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <span>Enterprise Transport Management System &bull; Confidential</span>
          <span>Page 1 of 1</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
