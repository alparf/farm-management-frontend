// utils/reportMaintenance.ts
import { MaintenanceRecord, Vehicle } from '@/types';
import { generatePrintWindow } from './reportUtils';

interface GenerateMaintenanceReportParams {
  records: MaintenanceRecord[];
  vehiclesMap: Map<number, Vehicle>;
  filters: {
    searchQuery?: string;
    vehicleId?: string;
    statusFilter?: string;
    sortBy?: string;
  };
}

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Все заявки',
  completed: 'Выполненные',
  pending: 'Не выполненные',
};

const SORT_LABELS: Record<string, string> = {
  dateDesc: 'по дате (новые сначала)',
  dateAsc: 'по дате (старые сначала)',
  vehicle: 'по технике',
  status: 'по статусу (невыполненные сначала)',
};

export function generateMaintenanceReport({
  records,
  vehiclesMap,
  filters,
}: GenerateMaintenanceReportParams) {
  const filtersParts: string[] = [];
  if (filters.searchQuery) filtersParts.push(`Поиск: "${filters.searchQuery}"`);
  if (filters.vehicleId && filters.vehicleId !== 'all') {
    const vehicle = vehiclesMap.get(parseInt(filters.vehicleId));
    if (vehicle) {
      filtersParts.push(
        `Техника: ${vehicle.name}${vehicle.vin ? ` (${vehicle.vin})` : ''}`,
      );
    }
  }
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    filtersParts.push(
      `Статус: ${STATUS_FILTER_LABELS[filters.statusFilter] || filters.statusFilter}`,
    );
  }
  if (filters.sortBy) {
    filtersParts.push(`Сортировка: ${SORT_LABELS[filters.sortBy] || filters.sortBy}`);
  }
  const filtersText = filtersParts.join(', ');

  if (records.length === 0) {
    generatePrintWindow(
      'Отчет по обслуживанию техники',
      '<p style="text-align:center; color:#666;">Нет данных, соответствующих фильтрам.</p>',
      filtersText,
    );
    return;
  }

  // Сводка
  const completed = records.filter((r) => r.completed).length;
  const pending = records.length - completed;

  const summaryHtml = `
    <div style="display:flex; gap:16px; margin: 8px 0 12px; flex-wrap: wrap;">
      <div style="padding:6px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px;">
        Всего заявок: <b>${records.length}</b>
      </div>
      <div style="padding:6px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px;">
        Выполнено: <b>${completed}</b>
      </div>
      <div style="padding:6px 12px; background:${pending > 0 ? '#fff7ed' : '#f0fdf4'}; border:1px solid ${pending > 0 ? '#fed7aa' : '#bbf7d0'}; border-radius:6px;">
        Не выполнено: <b>${pending}</b>
      </div>
    </div>
  `;

  let tableHtml = `
    ${summaryHtml}
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Техника</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Дата заявки</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Статус</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Дата выполнения</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Наработка</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Описание</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Примечания</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const record of records) {
    const vehicle = vehiclesMap.get(record.vehicleId);
    const vehicleName = vehicle?.name || record.vehicleName || `ID: ${record.vehicleId}`;
    const hours = record.hours != null ? `${record.hours} ч` : '—';
    const statusText = record.completed ? 'Выполнена' : 'Не выполнена';
    const statusCls = record.completed ? 'status-normal' : 'status-expiring';
    const actualDate = record.actualDate
      ? new Date(record.actualDate).toLocaleDateString('ru-RU')
      : '—';

    tableHtml += `
      <tr>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(vehicleName)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${new Date(record.date).toLocaleDateString('ru-RU')}</td>
        <td style="border:1px solid #ddd; padding:6px;">
          <span class="status-badge ${statusCls}">${statusText}</span>
        </td>
        <td style="border:1px solid #ddd; padding:6px;">${actualDate}</td>
        <td style="border:1px solid #ddd; padding:6px; text-align:right;">${escapeHtml(hours)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(record.description)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(record.notes || '')}</td>
      </tr>
    `;
  }

  tableHtml += `</tbody></table>`;
  generatePrintWindow('Отчет по обслуживанию техники', tableHtml, filtersText);
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}