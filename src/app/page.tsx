'use client';

import { useState, useMemo } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { useInventory } from '@/hooks/useInventory';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useEquipment } from '@/hooks/useEquipment';
import { CompactTreatmentList } from '@/components/treatments/treatments-list';
import { TreatmentForm } from '@/components/treatments/treatments-form';
import { VehiclesTab } from '@/components/vehicles/vehicles-tab';
import { AnalyticsTab } from '@/components/analytics-tab';
import { EquipmentTab } from '@/components/equipment/equipment-tab';
import { Stats } from '@/components/treatments/treatments-stats';
import { FilterSort } from '@/components/treatments/treatments-filters';
import { Button } from '@/components/ui/button';
import { InventoryTab } from '@/components/inventory/inventory-tab';
import { Plus, RefreshCw, Package, Sprout, BarChart3, Car, Gauge } from 'lucide-react';

type TabType = 'treatments' | 'inventory' | 'analytics' | 'vehicles' | 'equipment';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  
  // Состояния для фильтров обработок
  const [cultureFilter, setCultureFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(false);

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

  // Хуки для оборудования
  const {
    equipment,
    isLoading: equipmentLoading,
    error: equipmentError,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    refetch: refetchEquipment
  } = useEquipment();

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

  const handleAddTreatment = async (treatmentData: any) => {
    await addTreatment(treatmentData);
    setShowTreatmentForm(false);
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
      case 'equipment':
        refetchEquipment();
        break;
      default:
        refetchTreatments();
    }
  };

  // Состояния загрузки для каждой вкладки
  if (treatmentsLoading && activeTab === 'treatments') {
    return <LoadingState message="Загрузка обработок..." />;
  }

  if (inventoryLoading && activeTab === 'inventory') {
    return <LoadingState message="Загрузка склада..." />;
  }

  if (vehiclesLoading && activeTab === 'vehicles') {
    return <LoadingState message="Загрузка техники..." />;
  }

  if (equipmentLoading && activeTab === 'equipment') {
    return <LoadingState message="Загрузка оборудования..." />;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Заголовок и кнопка обновления - УБРАЛИ КНОПКУ ДОБАВЛЕНИЯ ОТСЮДА */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Сельхозучет</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          {/* Убрали кнопку добавления из общего заголовка */}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <TabButton
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          icon={<BarChart3 className="h-4 w-4" />}
          label="Аналитика"
        />
        <TabButton
          active={activeTab === 'treatments'}
          onClick={() => setActiveTab('treatments')}
          icon={<Sprout className="h-4 w-4" />}
          label="Обработки"
          count={treatments.length}
        />
        <TabButton
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')}
          icon={<Package className="h-4 w-4" />}
          label="Склад СЗР"
          count={inventory.length}
        />
        <TabButton
          active={activeTab === 'vehicles'}
          onClick={() => setActiveTab('vehicles')}
          icon={<Car className="h-4 w-4" />}
          label="Техника"
          count={vehicles.length}
        />
        <TabButton
          active={activeTab === 'equipment'}
          onClick={() => setActiveTab('equipment')}
          icon={<Gauge className="h-4 w-4" />}
          label="Оборудование"
          count={equipment.length}
        />
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

          {/* Заголовок и кнопка добавления обработок - ПОД ФИЛЬТРАМИ */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Обработки ({filteredTreatments.length} из {treatments.length})
            </h2>
            <Button onClick={() => setShowTreatmentForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Новая обработка
            </Button>
          </div>

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
        <InventoryTab
          inventory={inventory}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
        />
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

      {activeTab === 'equipment' && (
        <EquipmentTab
          equipment={equipment}
          onAddEquipment={addEquipment}
          onUpdateEquipment={updateEquipment}
          onDeleteEquipment={deleteEquipment}
        />
      )}
    </div>
  );
}

// Компонент кнопки вкладки
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  count 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  count?: number; 
}) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
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