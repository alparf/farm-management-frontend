'use client';

import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { ProductInventory, ProductType } from '@/types';
import { InventoryList } from './inventory-list';
import { InventoryForm } from './inventory-form';
import { InventoryFilters } from './inventory-filters';
import { InventoryStats } from './inventory-stats';
import { TransactionHistory } from './transaction-history';
import { Button } from '@/components/ui/button';
import { Package, History } from 'lucide-react';
import { generatePrintWindow } from '@/utils/reportUtils';

type SubTab = 'list' | 'movements';

export function InventoryTab() {
  const { inventory, isLoading, error, addProduct, updateProduct, deleteProduct, refetch } = useInventory();
  
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('list');
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [sortBy, setSortBy] = useState('name');
  const [stockFilter, setStockFilter] = useState('all');

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
    await addProduct(productData);
    setShowForm(false);
    refetch();
  };

  const handleGenerateReport = () => {
    const filtersParts = [];
    if (searchQuery) filtersParts.push(`Поиск: "${searchQuery}"`);
    if (typeFilter) filtersParts.push(`Тип: ${typeFilter}`);
    if (stockFilter === 'low') filtersParts.push('Низкий запас (≤5)');
    else if (stockFilter === 'out') filtersParts.push('Нет в наличии');
    else if (stockFilter === 'normal') filtersParts.push('Нормальный запас');
    const sortMap: Record<string, string> = {
      name: 'по названию',
      quantity: 'по количеству',
      type: 'по типу',
      updatedAt: 'по дате обновления'
    };
    if (sortBy) filtersParts.push(`Сортировка: ${sortMap[sortBy] || sortBy}`);
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
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (isLoading) return <div className="text-center py-8">Загрузка склада...</div>;

  return (
    <div className="space-y-6">
      <InventoryStats inventory={inventory} />
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSubTab === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveSubTab('list')}
        >
          <Package className="h-4 w-4" />
          Список товаров
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{inventory.length}</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSubTab === 'movements'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveSubTab('movements')}
        >
          <History className="h-4 w-4" />
          Движения по складу
        </button>
      </div>

      {activeSubTab === 'list' && (
        <>
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
            <Button onClick={() => setShowForm(true)}>Новое СЗР</Button>
          </div>
          {showForm && <InventoryForm onSubmit={handleAddProduct} onCancel={() => setShowForm(false)} />}
          <InventoryList
            inventory={filteredInventory}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onRefresh={refetch}
          />
        </>
      )}

      {activeSubTab === 'movements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">История движений по складу</h2>
          </div>
          <TransactionHistory refreshKey={inventory.length} />
        </div>
      )}
    </div>
  );
}