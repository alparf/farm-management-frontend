import { MaintenanceRecord, Vehicle } from '@/types';
import { generatePrintWindow } from './reportUtils';

interface GenerateMaintenanceReportParams {
  records: MaintenanceRecord[];
  vehiclesMap: Map<number, Vehicle>;
  filters: {
    searchQuery?: string;
    vehicleId?: string;
    typeFilter?: string;
    sortBy?: string;
  };
}

export function generateMaintenanceReport({
  records,
  vehiclesMap,
  filters,
}: GenerateMaintenanceReportParams) {
  const filtersParts = [];
  if (filters.searchQuery) filtersParts.push(`Поиск: "${filters.searchQuery}"`);
  if (filters.vehicleId && filters.vehicleId !== 'all') {
    const vehicle = vehiclesMap.get(parseInt(filters.vehicleId));
    if (vehicle) filtersParts.push(`Техника: ${vehicle.name}${vehicle.vin ? ` (${vehicle.vin})` : ''}`);
  }
  if (filters.typeFilter && filters.typeFilter !== 'all') {
    filtersParts.push(`Тип: ${filters.typeFilter}`);
  }
  if (filters.sortBy) {
    const sortMap: Record<string, string> = {
      dateDesc: 'по дате (новые сначала)',
      dateAsc: 'по дате (старые сначала)',
      vehicle: 'по технике',
      type: 'по типу',
    };
    filtersParts.push(`Сортировка: ${sortMap[filters.sortBy] || filters.sortBy}`);
  }
  const filtersText = filtersParts.join(', ');

  if (records.length === 0) {
    generatePrintWindow('Отчет по обслуживанию техники', '<p style="text-align:center; color:#666;">Нет данных, соответствующих фильтрам.</p>', filtersText);
    return;
  }

  let tableHtml = `
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Техника</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Дата</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Тип</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Наработка (моточасов)</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Описание</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Примечания</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const record of records) {
    const vehicle = vehiclesMap.get(record.vehicleId);
    const vehicleName = vehicle ? vehicle.name : `ID: ${record.vehicleId}`;
    const hours = record.hours ? `${record.hours} ч` : '—';

    tableHtml += `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(vehicleName)}</td>
        <td style="border:1px solid #ddd; padding:8px;">${new Date(record.date).toLocaleDateString('ru-RU')}</td>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(record.type)}</td>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(hours)}</td>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(record.description)}</td>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(record.notes || '')}</td>
      </tr>
    `;
  }

  tableHtml += `</tbody></table>`;
  generatePrintWindow('Отчет по обслуживанию техники', tableHtml, filtersText);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}