// utils/reportUtils.ts
export const generatePrintWindow = (title: string, content: string, filters?: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const screenHeader = `
    <div class="screen-only">
      <div class="report-header">
        <div class="report-title">${escapeHtml(title)}</div>
        <div class="report-date">${new Date().toLocaleString('ru-RU')}</div>
      </div>
      ${filters ? `<div class="filters-applied">📋 Фильтры: ${escapeHtml(filters)}</div>` : ''}
    </div>
  `;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <meta charset="utf-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            margin: 0.2in;
            font-size: 10pt;
            line-height: 1.3;
          }
          @media print {
            body {
              margin: 0;
            }
            .screen-only, .no-print, .btn-container {
              display: none !important;
            }
            .print-table {
              display: block !important;
            }
            table {
              page-break-inside: avoid;
              margin: 0;
            }
          }
          .screen-only {
            display: block;
          }
          .report-header {
            text-align: center;
            margin-bottom: 0.3rem;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.2rem;
          }
          .report-title {
            font-size: 1.2rem;
            font-weight: bold;
          }
          .report-date {
            font-size: 0.7rem;
            color: #666;
            margin-top: 0.1rem;
          }
          .filters-applied {
            background: #f5f5f5;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            margin: 0.3rem 0;
            font-size: 0.7rem;
            border-left: 3px solid #3b82f6;
            word-wrap: break-word;
          }
          .print-table {
            width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0.5rem;
            font-size: 0.7rem;
          }
          th, td {
            border: 1px solid #aaa;
            padding: 4px 5px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f2f2f2;
            font-weight: 600;
          }
          .status-badge {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 10px;
            font-size: 0.6rem;
            font-weight: 500;
          }
          .status-low, .status-expiring { background: #fef3c7; color: #92400e; }
          .status-out { background: #fee2e2; color: #b91c1c; }
          .status-normal, .status-active { background: #dcfce7; color: #166534; }
          .btn {
            padding: 8px 16px;
            font-size: 0.9rem;
            border-radius: 6px;
            background: white;
            border: 1px solid #ccc;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-primary {
            background: #2563eb;
            color: white;
            border: none;
          }
          .btn-primary:hover {
            background: #1d4ed8;
          }
          .btn-outline:hover {
            background: #f5f5f5;
          }
        </style>
      </head>
      <body>
        ${screenHeader}
        <div class="print-table">
          ${content}
        </div>
        <div class="no-print btn-container" style="text-align: center; margin-top: 0.8rem;">
          <button class="btn btn-primary" onclick="window.print();">Печать</button>
          <button class="btn btn-outline" onclick="window.close();">Закрыть</button>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}