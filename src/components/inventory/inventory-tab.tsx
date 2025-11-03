'use client';

import { useState, useMemo } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { InventoryList } from '@/components/inventory/inventory-list';
import { InventoryForm } from '@/components/inventory/inventory-form';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { InventoryStats } from '@/components/inventory/inventory-stats';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InventoryTabProps {
  inventory: ProductInventory[];
  onAddProduct: (product: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
}

export function InventoryTab({
  inventory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
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
      // Фильтр по поиску
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
      if (stockFilter === 'out' && product.quantity > 0) {
        return false;
      }
      if (stockFilter === 'normal' && product.quantity <= 5) {
        return false;
      }
      
      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });
    return filtered;
  }, [inventory, searchQuery, typeFilter, sortBy, stockFilter]);

  const handleAddProduct = async (productData: any) => {
    await onAddProduct(productData);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <InventoryStats inventory={inventory} />

      {/* Фильтры */}
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

      {/* Заголовок и кнопка */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Склад СЗР ({filteredInventory.length} из {inventory.length})
        </h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить продукт
        </Button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <InventoryForm 
          onSubmit={handleAddProduct}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Список продуктов */}
      <InventoryList 
        inventory={filteredInventory}
        onUpdateProduct={onUpdateProduct}
        onDeleteProduct={onDeleteProduct}
        typeFilter={typeFilter}
      />
    </div>
  );
}