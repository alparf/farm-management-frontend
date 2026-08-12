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
import { Plus, Package, History } from 'lucide-react';
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
    // ... существующий код отчёта
  };

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