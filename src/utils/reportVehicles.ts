// utils/reportVehicles.ts
import { Vehicle } from '@/types';
import { generatePrintWindow } from './reportUtils';

interface GenerateVehiclesReportParams {
  vehicles: Vehicle[];
  filters: {
    searchQuery?: string;
    typeFilter?: string;
    insuranceFilter?: string;
    roadLegalFilter?: string;
    sortBy?: string;
  };
}

const TYPE_LABELS: Record<string, string> = {
  'трактор': 'Трактор',
  'комбайн': 'Комбайн',
  'грузовой автомобиль': 'Грузовой автомобиль',
  'легковой автомобиль': 'Легковой автомобиль',
  'прицеп': 'Прицеп',
  'сельхозорудие': 'Сельхозорудие',
  'другая техника': 'Другая техника',
};

const INSURANCE_FILTER_LABELS: Record<string, string> = {
  'with-insurance': 'Со страховкой',
  'without-insurance': 'Без страховки',
  'expiring-soon': 'Страховка истекает',
  'expired': 'Страховка просрочена',
};

const ROAD_LEGAL_FILTER_LABELS: Record<string, string> = {
  'with-road-legal': 'С допуском',
  'without-road-legal': 'Без допуска',
  'expiring-soon': 'Допуск истекает',
  'expired': 'Допуск просрочен',
};

const SORT_LABELS: Record<string, string> = {
  name: 'по названию',
  type: 'по типу',
  year: 'по году выпуска',
  insurance: 'по дате страховки',
  roadLegal: 'по дате допуска',
  createdAt: 'по дате добавления',
};

const formatDate = (date?: Date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ru-RU');
};

const getDateStatus = (date?: Date): { text: string; cls: string } => {
  if (!date) return { text: '—', cls: '' };
  const today = new Date();
  const d = new Date(date);
  if (d < today) return { text: formatDate(date), cls: 'status-out' };
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 30) return { text: formatDate(date), cls: 'status-expiring' };
  return { text: formatDate(date), cls: 'status-normal' };
};

export function generateVehiclesReport({
  vehicles,
  filters,
}: GenerateVehiclesReportParams) {
  const filtersParts: string[] = [];
  if (filters.searchQuery) filtersParts.push(`Поиск: "${filters.searchQuery}"`);
  if (filters.typeFilter && filters.typeFilter !== '') {
    filtersParts.push(`Тип: ${TYPE_LABELS[filters.typeFilter] || filters.typeFilter}`);
  }
  if (filters.insuranceFilter) {
    filtersParts.push(
      `Страховка: ${INSURANCE_FILTER_LABELS[filters.insuranceFilter] || filters.insuranceFilter}`,
    );
  }
  if (filters.roadLegalFilter) {
    filtersParts.push(
      `Допуск: ${ROAD_LEGAL_FILTER_LABELS[filters.roadLegalFilter] || filters.roadLegalFilter}`,
    );
  }
  if (filters.sortBy) {
    filtersParts.push(`Сортировка: ${SORT_LABELS[filters.sortBy] || filters.sortBy}`);
  }
  const filtersText = filtersParts.join(', ');

  if (vehicles.length === 0) {
    generatePrintWindow(
      'Отчет по технике',
      '<p style="text-align:center; color:#666;">Нет данных, соответствующих фильтрам.</p>',
      filtersText,
    );
    return;
  }

  // Сводка
  const totalVehicles = vehicles.length;
  const withoutInsurance = vehicles.filter(
    (v) => !v.insuranceDate || new Date(v.insuranceDate) < new Date(),
  ).length;
  const withoutRoadLegal = vehicles.filter(
    (v) => !v.roadLegalUntil || new Date(v.roadLegalUntil) < new Date(),
  ).length;

  const summaryHtml = `
    <div style="display:flex; gap:16px; margin: 8px 0 12px; flex-wrap: wrap;">
      <div style="padding:6px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px;">
        Всего техники: <b>${totalVehicles}</b>
      </div>
      <div style="padding:6px 12px; background:${withoutInsurance > 0 ? '#fef2f2' : '#f0fdf4'}; border:1px solid ${withoutInsurance > 0 ? '#fecaca' : '#bbf7d0'}; border-radius:6px;">
        Без страховки: <b>${withoutInsurance}</b>
      </div>
      <div style="padding:6px 12px; background:${withoutRoadLegal > 0 ? '#fef2f2' : '#f0fdf4'}; border:1px solid ${withoutRoadLegal > 0 ? '#fecaca' : '#bbf7d0'}; border-radius:6px;">
        Без допуска: <b>${withoutRoadLegal}</b>
      </div>
    </div>
  `;

  let tableHtml = `
    ${summaryHtml}
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Название</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Тип</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Модель</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Год</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">VIN</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Страховка до</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Допуск до</th>
          <th style="border:1px solid #ddd; padding:6px; background:#f2f2f2;">Примечания</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const v of vehicles) {
    const insurance = getDateStatus(v.insuranceDate);
    const roadLegal = getDateStatus(v.roadLegalUntil);

    tableHtml += `
      <tr>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(v.name)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(TYPE_LABELS[v.type] || v.type)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(v.model || '—')}</td>
        <td style="border:1px solid #ddd; padding:6px; text-align:center;">${v.year ?? '—'}</td>
        <td style="border:1px solid #ddd; padding:6px; font-family: monospace; font-size:0.65rem;">${escapeHtml(v.vin || '—')}</td>
        <td style="border:1px solid #ddd; padding:6px;">
          <span class="status-badge ${insurance.cls}">${insurance.text}</span>
        </td>
        <td style="border:1px solid #ddd; padding:6px;">
          <span class="status-badge ${roadLegal.cls}">${roadLegal.text}</span>
        </td>
        <td style="border:1px solid #ddd; padding:6px;">${escapeHtml(v.notes || '')}</td>
      </tr>
    `;
  }

  tableHtml += `</tbody></table>`;
  generatePrintWindow('Отчет по технике', tableHtml, filtersText);
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