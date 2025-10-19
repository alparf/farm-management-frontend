'use client';

import { useState, useMemo } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { useInventory } from '@/hooks/useInventory';
import { CompactTreatmentList } from '@/components/compact-treatment-list';
import { InventoryList } from '@/components/inventory-list';
import { InventoryForm } from '@/components/inventory-form';
import { TreatmentForm } from '@/components/treatment-form';
import { Stats } from '@/components/stats';
import { FilterSort } from '@/components/filter-sort';
import { InventoryFilters } from '@/components/inventory-filters';
import { AnalyticsTab } from '@/components/analytics-tab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, Package, Sprout, BarChart3 } from 'lucide-react';
import { ProductType } from '@/types';

type TabType = 'treatments' | 'inventory' | 'analytics';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('treatments');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  
  // Состояния для фильтров обработок
  const [cultureFilter, setCultureFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Состояния для фильтров склада
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState<ProductType | ''>('');
  const [inventorySort, setInventorySort] = useState('name');

  // Хуки для данных
  const { 
    treatments, 
    isLoading: treatmentsLoading, 
    error: treatmentsError, 
    addTreatment, 
    updateTreatment,
    deleteTreatment,
    refetch: refetchTreatments 
  } = useTreatments();
  
  const {
    inventory,
    isLoading: inventoryLoading,
    error: inventoryError,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: refetchInventory
  } = useInventory();
  
  // Фильтрация обработок
  const filteredTreatments = useMemo(() => {
    let filtered = treatments.filter(treatment => {
      if (showCompleted && !treatment.completed) return false;
      if (cultureFilter && treatment.culture !== cultureFilter) return false;
      if (productTypeFilter && 
          !treatment.chemicalProducts.some(p => p.productType === productTypeFilter)) {
        return false;
      }
      if (searchQuery && 
          !treatment.chemicalProducts.some(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
        case 'createdAt': return b.createdAt.getTime() - a.createdAt.getTime();
        case 'culture': return a.culture.localeCompare(b.culture);
        case 'area': return b.area - a.area;
        default: return 0;
      }
    });

    return filtered;
  }, [treatments, cultureFilter, productTypeFilter, searchQuery, sortBy, showCompleted]);

  // Фильтрация склада
  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(product => {
      // Фильтр по поиску
      if (inventorySearch && !product.name.toLowerCase().includes(inventorySearch.toLowerCase())) {
        return false;
      }
      
      // Фильтр по типу
      if (inventoryTypeFilter && product.type !== inventoryTypeFilter) {
        return false;
      }
      
      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (inventorySort) {
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
  }, [inventory, inventorySearch, inventoryTypeFilter, inventorySort]);

  // Статистика склада
  const inventoryStats = useMemo(() => {
    const totalProducts = inventory.length;
    const byType = inventory.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalProducts, byType };
  }, [inventory]);

  const handleAddTreatment = async (treatmentData: any) => {
    await addTreatment(treatmentData);
    setShowTreatmentForm(false);
  };

  const handleAddProduct = async (productData: any) => {
    await addProduct(productData);
    setShowInventoryForm(false);
  };

  if (treatmentsLoading && activeTab === 'treatments') {
    return <LoadingState message="Загрузка обработок..." />;
  }

  if (inventoryLoading && activeTab === 'inventory') {
    return <LoadingState message="Загрузка склада..." />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Заголовок и вкладки */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Сельхозучет</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={activeTab === 'treatments' ? refetchTreatments : activeTab === 'inventory' ? refetchInventory : refetchTreatments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button onClick={() => activeTab === 'treatments' ? setShowTreatmentForm(true) : activeTab === 'inventory' ? setShowInventoryForm(true) : null}>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === 'treatments' ? 'Новая обработка' : activeTab === 'inventory' ? 'Добавить продукт' : 'Аналитика'}
          </Button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'treatments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('treatments')}
        >
          <Sprout className="h-4 w-4" />
          Обработки
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {treatments.length}
          </span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package className="h-4 w-4" />
          Склад СЗР
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {inventory.length}
          </span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="h-4 w-4" />
          Аналитика
        </button>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'treatments' && (
        <>
          {treatmentsError && <ErrorState error={treatmentsError} onRetry={refetchTreatments} />}
          
          <Stats treatments={treatments} />

          <FilterSort
            cultureFilter={cultureFilter}
            onCultureFilterChange={setCultureFilter}
            productTypeFilter={productTypeFilter}
            onProductTypeFilterChange={setProductTypeFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showCompleted={showCompleted}
            onShowCompletedChange={setShowCompleted}
          />

          {showTreatmentForm && (
            <TreatmentForm 
              onSubmit={handleAddTreatment}
              onCancel={() => setShowTreatmentForm(false)}
              inventory={inventory} // Передаем данные склада
            />
          )}

          <CompactTreatmentList 
            treatments={filteredTreatments}
            onUpdateTreatment={updateTreatment}
            onDeleteTreatment={deleteTreatment}
          />
        </>
      )}

      {activeTab === 'inventory' && (
        <>
          {inventoryError && <ErrorState error={inventoryError} onRetry={refetchInventory} />}

          {/* Статистика склада */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <Card className="bg-blue-50">
              <CardContent className="p-3">
                <div className="text-xs text-blue-600 font-medium">Всего</div>
                <div className="text-lg font-bold text-blue-800">{inventoryStats.totalProducts}</div>
              </CardContent>
            </Card>
            {Object.entries(inventoryStats.byType).map(([type, count]) => (
              <Card key={type} className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-600 font-medium capitalize truncate">
                    {type}
                  </div>
                  <div className="text-lg font-bold text-gray-800">{count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Фильтры склада */}
          <InventoryFilters
            searchQuery={inventorySearch}
            onSearchChange={setInventorySearch}
            typeFilter={inventoryTypeFilter}
            onTypeFilterChange={setInventoryTypeFilter}
            sortBy={inventorySort}
            onSortChange={setInventorySort}
          />

          {showInventoryForm && (
            <InventoryForm 
              onSubmit={handleAddProduct}
              onCancel={() => setShowInventoryForm(false)}
            />
          )}

          <InventoryList 
            inventory={filteredInventory}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            typeFilter={inventoryTypeFilter}
          />
        </>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab treatments={treatments} />
      )}
    </div>
  );
}

// Вспомогательные компоненты
function LoadingState({ message }: { message: string }) {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-red-800 font-medium">Ошибка загрузки</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    </div>
  );
}