'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { InventoryList } from '@/components/inventory/inventory-list';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { InventoryStats } from '@/components/inventory/inventory-stats';
import { TransactionHistory } from '@/components/inventory/transaction-history';
import { Button } from '@/components/ui/button';
import { Package, History, Plus, RefreshCw } from 'lucide-react';

interface InventoryTabProps {
  inventory: ProductInventory[];
  onAddProduct: (product: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onRefresh: () => void;
}

// Ключи для localStorage
const STORAGE_KEYS = {
  searchQuery: 'inventory_searchQuery',
  typeFilter: 'inventory_typeFilter',
  sortBy: 'inventory_sortBy',
  stockFilter: 'inventory_stockFilter',
};

export function InventoryTab({
  inventory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefresh,
}: InventoryTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'transactions'>('products');
  
  // Состояния для фильтров с загрузкой из localStorage
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.searchQuery) || '';
    }
    return '';
  });
  
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEYS.typeFilter) as ProductType | '') || '';
    }
    return '';
  });
  
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.sortBy) || 'name';
    }
    return 'name';
  });
  
  const [stockFilter, setStockFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.stockFilter) || 'all';
    }
    return 'all';
  });

  // Сохраняем фильтры в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.searchQuery, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.typeFilter, typeFilter);
  }, [typeFilter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sortBy, sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stockFilter, stockFilter);
  }, [stockFilter]);

  // Фильтрация склада
  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(product => {
      // Поиск по названию
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Фильтр по типу
      if (typeFilter && product.type !== typeFilter) {
        return false;
      }
      // Фильтр по запасам
      if (stockFilter === 'low' && product.quantity > 5) {
        return false;
      }
      if (stockFilter === 'out' && product.quantity !== 0) {
        return false;
      }
      if (stockFilter === 'normal' && (product.quantity === 0 || product.quantity <= 5)) {
        return false;
      }
      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ru');
        case 'nameDesc':
          return b.name.localeCompare(a.name, 'ru');
        case 'quantity':
          return b.quantity - a.quantity;
        case 'quantityAsc':
          return a.quantity - b.quantity;
        case 'type':
          return a.type.localeCompare(b.type, 'ru');
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'updatedAtAsc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        default:
          return 0;
      }
    });
    return filtered;
  }, [inventory, searchQuery, typeFilter, sortBy, stockFilter]);

  const handleAddProduct = async (productData: any) => {
    await onAddProduct(productData);
    setShowForm(false);
    onRefresh();
  };

  const refreshTransactions = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <InventoryStats inventory={inventory} />

      {/* Подвкладки */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSubTab === 'products'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="h-4 w-4" />
          СЗР
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {inventory.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSubTab === 'transactions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="h-4 w-4" />
          Журнал движений
        </button>
      </div>

      {/* Контент подвкладки "СЗР" */}
      {activeSubTab === 'products' && (
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
          />

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Склад СЗР ({filteredInventory.length} из {inventory.length})
            </h2>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Новый препарат
            </Button>
          </div>

          {showForm && (
            <InventoryForm 
              onSubmit={handleAddProduct}
              onCancel={() => setShowForm(false)}
            />
          )}

          <InventoryList 
            inventory={filteredInventory}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onRefresh={onRefresh}
            typeFilter={typeFilter}
          />
        </>
      )}

      {/* Контент подвкладки "Журнал движений" */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Журнал движений</h2>
            <Button variant="outline" size="sm" onClick={refreshTransactions}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить
            </Button>
          </div>

          {/* История движений - показывает все транзакции с фильтрацией внутри */}
          <TransactionHistory refreshKey={refreshKey} />
        </div>
      )}
    </div>
  );
}