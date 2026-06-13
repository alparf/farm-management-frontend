'use client';

import { useState, useMemo } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { InventoryList } from '@/components/inventory/inventory-list';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { InventoryStats } from '@/components/inventory/inventory-stats';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { generatePrintWindow } from '@/utils/reportUtils';

interface InventoryTabProps {
  inventory: ProductInventory[];
  onAddProduct: (product: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onRefresh?: () => Promise<void>; // добавляем опциональный проп
}

export function InventoryTab({
  inventory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefresh,
}: InventoryTabProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [sortBy, setSortBy] = useState('name');
  const [stockFilter, setStockFilter] = useState('all');

  // Фильтрация склада
  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(product => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter && product.type !== typeFilter) return false;
      if (stockFilter === 'low' && product.quantity > 5) return false;
      if (stockFilter === 'out' && product.quantity > 0) return false;
      if (stockFilter === 'normal' && product.quantity <= 5) return false;
      return true;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'quantity': return b.quantity - a.quantity;
        case 'type': return a.type.localeCompare(b.type);
        case 'updatedAt': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default: return 0;
      }
    });
    return filtered;
  }, [inventory, searchQuery, typeFilter, sortBy, stockFilter]);

  const handleAddProduct = async (productData: any) => {
    await onAddProduct(productData);
    setShowForm(false);
    if (onRefresh) await onRefresh(); // обновляем данные после добавления
  };

  // Функция для формирования и печати отчета
  const handleGenerateReport = () => {
    const filtersParts = [];
    if (searchQuery) filtersParts.push(`Поиск: "${searchQuery}"`);
    if (typeFilter) filtersParts.push(`Тип: ${typeFilter}`);
    if (stockFilter === 'low') filtersParts.push('Низкий запас (≤5)');
    else if (stockFilter === 'out') filtersParts.push('Нет в наличии');
    else if (stockFilter === 'normal') filtersParts.push('Нормальный запас');
    if (sortBy) {
      const sortMap: Record<string, string> = {
        name: 'по названию',
        quantity: 'по количеству',
        type: 'по типу',
        updatedAt: 'по дате обновления'
      };
      filtersParts.push(`Сортировка: ${sortMap[sortBy] || sortBy}`);
    }
    const filtersText = filtersParts.join(', ');

    if (filteredInventory.length === 0) {
      generatePrintWindow('Отчет по складу СЗР', '<p style="text-align:center; color:#666;">Нет данных, соответствующих фильтрам.</p>', filtersText);
      return;
    }

    let tableHtml = `
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Название</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Тип</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Количество</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Ед. изм.</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Статус</th>
            <th style="border:1px solid #ddd; padding:8px; background:#f2f2f2;">Примечания</th>
          </tr>
        </thead>
        <tbody>
    `;

    filteredInventory.forEach(product => {
      let statusText = '';
      let statusClass = '';
      if (product.quantity === 0) {
        statusText = 'Нет в наличии';
        statusClass = 'status-out';
      } else if (product.quantity <= 5) {
        statusText = 'Низкий запас';
        statusClass = 'status-low';
      } else {
        statusText = 'Норма';
        statusClass = 'status-normal';
      }

      tableHtml += `
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(product.name)}</td>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(product.type)}</td>
          <td style="border:1px solid #ddd; padding:8px; text-align:right;">${product.quantity}</td>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(product.unit)}</td>
          <td style="border:1px solid #ddd; padding:8px;"><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td style="border:1px solid #ddd; padding:8px;">${escapeHtml(product.notes || '')}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    generatePrintWindow('Отчет по складу СЗР', tableHtml, filtersText);
  };

  function escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return (
    <div className="space-y-6">
      <InventoryStats inventory={inventory} />
      <InventoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        onGenerateReport={handleGenerateReport}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Склад СЗР ({filteredInventory.length} из {inventory.length})</h2>
        <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> Добавить продукт</Button>
      </div>
      {showForm && <InventoryForm onSubmit={handleAddProduct} onCancel={() => setShowForm(false)} />}
      <InventoryList
        inventory={filteredInventory}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
        typeFilter={typeFilter}
        onRefresh={onRefresh || (() => Promise.resolve())}
      />
    </div>
  );
}