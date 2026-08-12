'use client';

import { useState } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { useInventory } from '@/hooks/useInventory';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useEquipment } from '@/hooks/useEquipment';
import { useShipments } from '@/hooks/useShipments';
import { useTreatmentFilters } from '@/hooks/useTreatmentFilters';
import { CompactTreatmentList } from '@/components/treatments/treatments-list';
import { TreatmentForm } from '@/components/treatments/treatments-form';
import { VehiclesTab } from '@/components/vehicles/vehicles-tab';
import { AnalyticsTab } from '@/components/analytics-tab';
import { EquipmentTab } from '@/components/equipment/equipment-tab';
import { Stats } from '@/components/treatments/treatments-stats';
import { FilterSort } from '@/components/treatments/treatments-filters';
import { Button } from '@/components/ui/button';
import { InventoryTab } from '@/components/inventory/inventory-tab';
import { ShipmentsTab } from '@/components/shipments/shipments-tab';
import { TabButton, LoadingState, ErrorState } from '@/components/common';
import { Plus, RefreshCw, Package, Sprout, BarChart3, Car, Gauge, Truck } from 'lucide-react';
import { generateTreatmentsReport } from '@/utils/reportTreatments';

type TabType = 'treatments' | 'inventory' | 'analytics' | 'vehicles' | 'equipment' | 'shipments';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);

  const [cultureFilter, setCultureFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDateDesc');

  const { treatments, isLoading: treatmentsLoading, error: treatmentsError, addTreatment, updateTreatment, deleteTreatment, completeTreatment, uncompleteTreatment, refetch: refetchTreatments } = useTreatments();
  const { inventory, isLoading: inventoryLoading, error: inventoryError, addProduct, updateProduct, deleteProduct, refetch: refetchInventory } = useInventory();
  const { vehicles, isLoading: vehiclesLoading, error: vehiclesError, addVehicle, updateVehicle, deleteVehicle, refetch: refetchVehicles } = useVehicles();
  const { maintenance, isLoading: maintenanceLoading, error: maintenanceError, addMaintenance, updateMaintenance, deleteMaintenance, refetch: refetchMaintenance } = useMaintenance();
  const { equipment, isLoading: equipmentLoading, error: equipmentError, addEquipment, updateEquipment, deleteEquipment, refetch: refetchEquipment } = useEquipment();
  const { shipments, isLoading: shipmentsLoading, error: shipmentsError, refetch: refetchShipments } = useShipments();

  const filteredTreatments = useTreatmentFilters({
    treatments,
    cultureFilter,
    productTypeFilter,
    searchQuery,
    sortBy,
  });

  const handleAddTreatment = async (treatmentData: any) => {
    await addTreatment(treatmentData);
    setShowTreatmentForm(false);
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'treatments': refetchTreatments(); break;
      case 'inventory': refetchInventory(); break;
      case 'analytics': refetchShipments(); break;
      case 'vehicles': refetchVehicles(); refetchMaintenance(); break;
      case 'equipment': refetchEquipment(); break;
      case 'shipments': refetchShipments(); break;
      default: break;
    }
  };

  const handleGenerateReport = () => {
    generateTreatmentsReport({
      treatments: filteredTreatments,
      inventory,
      filters: { searchQuery, cultureFilter, productTypeFilter, sortBy },
    });
  };

  if (treatmentsLoading && activeTab === 'treatments') return <LoadingState message="Загрузка обработок..." />;
  if (inventoryLoading && activeTab === 'inventory') return <LoadingState message="Загрузка склада..." />;
  if (vehiclesLoading && activeTab === 'vehicles') return <LoadingState message="Загрузка техники..." />;
  if (equipmentLoading && activeTab === 'equipment') return <LoadingState message="Загрузка оборудования..." />;
  if (shipmentsLoading && activeTab === 'shipments') return <LoadingState message="Загрузка отгрузок..." />;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Сельхозучет</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-gray-200 mb-6 overflow-x-auto">
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
        <TabButton
          active={activeTab === 'shipments'}
          onClick={() => setActiveTab('shipments')}
          icon={<Truck className="h-4 w-4" />}
          label="Отгрузки"
          count={shipments.length}
        />
      </div>

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
            onGenerateReport={handleGenerateReport}
          />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Обработки ({filteredTreatments.length} из {treatments.length})</h2>
            <Button onClick={() => setShowTreatmentForm(true)}>Новая обработка</Button>
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
            onCompleteTreatment={completeTreatment}
            onUncompleteTreatment={uncompleteTreatment}
          />
        </>
      )}

      {activeTab === 'inventory' && (
        <InventoryTab
          inventory={inventory}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
          onRefresh={refetchInventory}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab shipments={shipments} />
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

      {activeTab === 'shipments' && <ShipmentsTab shipments={shipments} />}
    </div>
  );
}