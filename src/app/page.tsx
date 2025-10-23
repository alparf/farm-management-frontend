'use client';

import { useState, useMemo } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { useInventory } from '@/hooks/useInventory';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import { CompactTreatmentList } from '@/components/compact-treatment-list';
import { InventoryList } from '@/components/inventory-list';
import { InventoryForm } from '@/components/inventory-form';
import { TreatmentForm } from '@/components/treatment-form';
import { VehiclesTab } from '@/components/vehicles-tab';
import { AnalyticsTab } from '@/components/analytics-tab';
import { Stats } from '@/components/stats';
import { FilterSort } from '@/components/filter-sort';
import { InventoryFilters } from '@/components/inventory-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, Package, Sprout, BarChart3, Car } from 'lucide-react';
import { ProductType } from '@/types';

type TabType = 'treatments' | 'inventory' | 'analytics' | 'vehicles';

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
  const [stockFilter, setStockFilter] = useState('all');

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
  
  // Хуки для техники
  const {
    vehicles,
    isLoading: vehiclesLoading,
    error: vehiclesError,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: refetchVehicles
  } = useVehicles();

  const {
    maintenance,
    isLoading: maintenanceLoading,
    error: maintenanceError,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    refetch: refetchMaintenance
  } = useMaintenance();

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
  }, [inventory, inventorySearch, inventoryTypeFilter, inventorySort, stockFilter]);

  // Статистика склада
 const inventoryStats = useMemo(() => {
    const totalProducts = inventory.length;
    const byType = inventory.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Добавляем статистику по низким запасам
  const lowStockProducts = inventory.filter(product => product.quantity <= 5);
  const outOfStockProducts = inventory.filter(product => product.quantity === 0);

  return { 
    totalProducts, 
    byType,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length
  };
}, [inventory]);

  const handleAddTreatment = async (treatmentData: any) => {
    await addTreatment(treatmentData);
    setShowTreatmentForm(false);
  };

  const handleAddProduct = async (productData: any) => {
    await addProduct(productData);
    setShowInventoryForm(false);
  };

  // Функция для кнопки обновления
  const handleRefresh = () => {
    switch (activeTab) {
      case 'treatments':
        refetchTreatments();
        break;
      case 'inventory':
        refetchInventory();
        break;
      case 'analytics':
        refetchTreatments();
        break;
      case 'vehicles':
        refetchVehicles();
        refetchMaintenance();
        break;
      default:
        refetchTreatments();
    }
  };

  // Функция для кнопки добавления
  const handleAddButton = () => {
    switch (activeTab) {
      case 'treatments':
        setShowTreatmentForm(true);
        break;
      case 'inventory':
        setShowInventoryForm(true);
        break;
      case 'vehicles':
        // В VehiclesTab есть свои кнопки добавления
        break;
      default:
        break;
    }
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'treatments':
        return 'Новая обработка';
      case 'inventory':
        return 'Добавить продукт';
      case 'vehicles':
        return ''; // В VehiclesTab есть свои кнопки
      default:
        return 'Добавить';
    }
  };

  if (treatmentsLoading && activeTab === 'treatments') {
    return <LoadingState message="Загрузка обработок..." />;
  }

  if (inventoryLoading && activeTab === 'inventory') {
    return <LoadingState message="Загрузка склада..." />;
  }

  if (vehiclesLoading && activeTab === 'vehicles') {
    return <LoadingState message="Загрузка техники..." />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Заголовок и вкладки */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Сельхозучет</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          {(activeTab === 'treatments' || activeTab === 'inventory') && (
            <Button onClick={handleAddButton}>
              <Plus className="mr-2 h-4 w-4" />
              {getAddButtonText()}
            </Button>
          )}
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
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'vehicles'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('vehicles')}
        >
          <Car className="h-4 w-4" />
          Техника
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {vehicles.length}
          </span>
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
              inventory={inventory}
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
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

            {/* Карточки для низких запасов */}
            <Card className={`${inventoryStats.lowStockCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}`}>
              <CardContent className="p-3">
                <div className={`text-xs font-medium ${inventoryStats.lowStockCount > 0 ? 'text-yellow-700' : 'text-gray-600'}`}>
                  Низкий запас
                </div>
                <div className={`text-lg font-bold ${inventoryStats.lowStockCount > 0 ? 'text-yellow-800' : 'text-gray-800'}`}>
                  {inventoryStats.lowStockCount}
                </div>
              </CardContent>
            </Card>
            <Card className={`${inventoryStats.outOfStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
              <CardContent className="p-3">
                <div className={`text-xs font-medium ${inventoryStats.outOfStockCount > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                  Нет в наличии
                </div>
                <div className={`text-lg font-bold ${inventoryStats.outOfStockCount > 0 ? 'text-red-800' : 'text-gray-800'}`}>
                  {inventoryStats.outOfStockCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Фильтры склада */}
          <InventoryFilters
            searchQuery={inventorySearch}
            onSearchChange={setInventorySearch}
            typeFilter={inventoryTypeFilter}
            onTypeFilterChange={setInventoryTypeFilter}
            sortBy={inventorySort}
            onSortChange={setInventorySort}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
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

      {activeTab === 'vehicles' && (
        <VehiclesTab
          vehicles={vehicles}
          maintenance={maintenance}
          onAddVehicle={addVehicle}
          onUpdateVehicle={updateVehicle}
          onDeleteVehicle={deleteVehicle}
          onAddMaintenance={addMaintenance}
          onUpdateMaintenance={updateMaintenance}
          onDeleteMaintenance={deleteMaintenance}
        />
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