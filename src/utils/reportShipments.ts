// utils/reportShipments.ts
import { Shipment, Client, Product } from '@/types';
import { generatePrintWindow } from './reportUtils';

interface GenerateShipmentsReportParams {
  shipments: Shipment[];
  clients: Client[];
  products: Product[];
  filters: {
    searchQuery?: string;
    clientFilter?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function generateShipmentsReport({
  shipments,
  clients,
  products,
  filters,
}: GenerateShipmentsReportParams) {
  const filtersParts: string[] = [];
  if (filters.searchQuery) filtersParts.push(`Поиск: "${filters.searchQuery}"`);
  if (filters.clientFilter) {
    const client = clients.find(c => c.id === Number(filters.clientFilter));
    if (client) filtersParts.push(`Клиент: ${client.name}`);
  }
  if (filters.dateFrom) filtersParts.push(`Дата от: ${filters.dateFrom}`);
  if (filters.dateTo) filtersParts.push(`Дата до: ${filters.dateTo}`);
  const filtersText = filtersParts.join(', ');

  if (shipments.length === 0) {
    generatePrintWindow('Отчет по отгрузкам', '<p style="text-align:center; color:#666;">Нет данных, соответствующих фильтрам.</p>', filtersText);
    return;
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || `ID: ${clientId}`;
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || `ID: ${productId}`;
  };

  const getProductUnit = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.unit || '';
  };

  let tableHtml = '';

  for (const shipment of shipments) {
    tableHtml += `
      <h3 style="margin-top: 20px; margin-bottom: 6px; font-size: 1.1rem; border-bottom: 1px solid #ccc; padding-bottom: 4px;">
        ${new Date(shipment.date).toLocaleDateString('ru-RU')} — ${escapeHtml(getClientName(shipment.clientId))}
        ${shipment.notes ? ` (${escapeHtml(shipment.notes)})` : ''}
      </h3>
      <table style="width:100%; border-collapse: collapse; font-size: 0.7rem; margin-bottom: 10px;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:4px 6px; background:#f2f2f2;">Товар</th>
            <th style="border:1px solid #ddd; padding:4px 6px; background:#f2f2f2;">Кол-во</th>
            <th style="border:1px solid #ddd; padding:4px 6px; background:#f2f2f2;">Возврат</th>
            <th style="border:1px solid #ddd; padding:4px 6px; background:#f2f2f2;">Цена за ед.</th>
            <th style="border:1px solid #ddd; padding:4px 6px; background:#f2f2f2;">Сумма</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalSum = 0;
    for (const item of shipment.items) {
      const qty = Number(item.quantity) || 0;
      const returnQty = Number(item.returnQuantity) || 0;
      const netQty = qty - returnQty;
      const price = Number(item.pricePerUnit) || 0;
      const sum = netQty * price;
      totalSum += sum;
      tableHtml += `
        <tr>
          <td style="border:1px solid #ddd; padding:4px 6px;">${escapeHtml(getProductName(item.productId))}</td>
          <td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">${qty}</td>
          <td style="border:1px solid #ddd; padding:4px 6px; text-align:center;">${returnQty > 0 ? returnQty : '—'}</td>
          <td style="border:1px solid #ddd; padding:4px 6px; text-align:right;">${price.toFixed(2)}</td>
          <td style="border:1px solid #ddd; padding:4px 6px; text-align:right;">${sum.toFixed(2)}</td>
        </tr>
      `;
    }

    tableHtml += `
        <tr style="font-weight:bold; background:#f9f9f9;">
          <td colspan="4" style="border:1px solid #ddd; padding:4px 6px; text-align:right;">Итого по отгрузке:</td>
          <td style="border:1px solid #ddd; padding:4px 6px; text-align:right;">${totalSum.toFixed(2)}</td>
        </tr>
      </tbody></table>
    `;
  }

  // Общая итоговая строка по всем отгрузкам
  let grandTotal = 0;
  for (const shipment of shipments) {
    for (const item of shipment.items) {
      const qty = Number(item.quantity) || 0;
      const returnQty = Number(item.returnQuantity) || 0;
      const netQty = qty - returnQty;
      const price = Number(item.pricePerUnit) || 0;
      grandTotal += netQty * price;
    }
  }

  tableHtml += `
    <div style="text-align:right; font-weight:bold; font-size:1.1rem; margin-top:20px; border-top:2px solid #333; padding-top:8px;">
      ОБЩАЯ СУММА: ${grandTotal.toFixed(2)} BYN
    </div>
  `;

  generatePrintWindow('Отчет по отгрузкам', tableHtml, filtersText);
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