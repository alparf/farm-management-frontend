// utils/reportTreatments.ts
import { ChemicalTreatment, ProductInventory } from '@/types';
import { generatePrintWindow } from './reportUtils';

interface GenerateTreatmentsReportParams {
  treatments: ChemicalTreatment[];
  inventory: ProductInventory[];
  filters: {
    searchQuery?: string;
    cultureFilter?: string;
    productTypeFilter?: string;
    showCompleted?: boolean;
    sortBy?: string;
  };
}

export function generateTreatmentsReport({
  treatments,
  inventory,
  filters,
}: GenerateTreatmentsReportParams) {
  // Формируем строку фильтров
  const filtersParts = [];
  if (filters.searchQuery) filtersParts.push(`Поиск: "${filters.searchQuery}"`);
  if (filters.cultureFilter) filtersParts.push(`Культура: ${filters.cultureFilter}`);
  if (filters.productTypeFilter) filtersParts.push(`Тип СЗР: ${filters.productTypeFilter}`);
  if (filters.showCompleted === false) filtersParts.push('Скрыты выполненные');
  
  const sortMap: Record<string, string> = {
    dueDate: 'по дате обработки (раньше → позже)',
    dueDateDesc: 'по дате обработки (позже → раньше)',
    createdAt: 'по дате создания (новые → старые)',
    createdAtAsc: 'по дате создания (старые → новые)',
    culture: 'по культуре (А → Я)',
    area: 'по площади (больше → меньше)',
    areaAsc: 'по площади (меньше → больше)',
    status: 'по статусу (ожидающие → выполненные)',
    statusDesc: 'по статусу (выполненные → ожидающие)',
  };
  if (filters.sortBy) {
    filtersParts.push(`Сортировка: ${sortMap[filters.sortBy] || filters.sortBy}`);
  }
  const filtersText = filtersParts.join(', ');

  if (treatments.length === 0) {
    generatePrintWindow('Отчет по обработкам', '<p style="text-align:center; color:#666;">Нет данных, соответствующих фильтрам.</p>', filtersText);
    return;
  }

  // Маппинг ID препарата -> название
  const productNameMap = new Map<number, string>();
  inventory.forEach(p => productNameMap.set(p.id, p.name));

  // Формируем полную HTML-таблицу
  let tableHtml = `
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Культура</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Площадь (га)</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Статус</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Плановая дата</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Фактическая дата</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Препараты (норма)</th>
          <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Примечания</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const t of treatments) {
    const statusText = t.completed ? 'Выполнено' : 'Ожидает';
    const statusClass = t.completed ? 'status-normal' : 'status-expiring';
    const plannedDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString('ru-RU') : '—';
    const actualDate = t.actualDate ? new Date(t.actualDate).toLocaleDateString('ru-RU') : (t.completed ? '—' : 'не выполнена');
    const productsList = t.chemicalProducts.map(p => {
      const productName = productNameMap.get(p.productId) || `ID:${p.productId}`;
      return `${productName} (${p.ratePerHa} ${p.unit})`;
    }).join('; ');

    tableHtml += `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(t.culture)}</td>
        <td style="border:1px solid #ddd; padding:8px; text-align:right;">${t.area}</td>
        <td style="border:1px solid #ddd; padding:8px;"><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td style="border:1px solid #ddd; padding:8px;">${plannedDate}</td>
        <td style="border:1px solid #ddd; padding:8px;">${actualDate}</td>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(productsList)}</td>
        <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(t.notes || '')}</td>
      </tr>
    `;
  }

  tableHtml += `
      </tbody>
    </table>
  `;

  generatePrintWindow('Отчет по обработкам', tableHtml, filtersText);
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