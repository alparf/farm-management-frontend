'use client';

import { useState, useMemo } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import { Vehicle, VehicleType, MaintenanceRecord } from '@/types';
import { VehiclesList } from './vehicles-list';
import { MaintenanceList } from './maintenance-list';
import { VehicleForm } from './vehicle-form';
import { MaintenanceForm } from './maintenance-form';
import { VehiclesFilters } from './vehicles-filters';
import { MaintenanceFilters } from './maintenance-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Wrench, Car, ShieldOff, RouteOff, AlertTriangle } from 'lucide-react';
import { generateMaintenanceReport } from '@/utils/reportMaintenance';

type VehiclesView = 'vehicles' | 'maintenance';

export function VehiclesTab() {
  const { vehicles, isLoading: vehiclesLoading, addVehicle, updateVehicle, deleteVehicle, refetch: refetchVehicles } = useVehicles();
  const { maintenance, isLoading: maintenanceLoading, addMaintenance, updateMaintenance, deleteMaintenance, refetch: refetchMaintenance } = useMaintenance();

  const [currentView, setCurrentView] = useState<VehiclesView>('vehicles');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [insuranceFilter, setInsuranceFilter] = useState('');
  const [roadLegalFilter, setRoadLegalFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState('');
  const [maintenanceVehicleId, setMaintenanceVehicleId] = useState('all');
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('all');
  const [maintenanceSortBy, setMaintenanceSortBy] = useState('dateDesc');

  // Фильтрация (остаётся без изменений)
  const filteredVehicles = useMemo(() => {
    // ... существующая логика
    return vehicles;
  }, [vehicles, searchQuery, typeFilter, insuranceFilter, roadLegalFilter, sortBy]);

  const filteredMaintenance = useMemo(() => {
    // ... существующая логика
    return maintenance;
  }, [maintenance, maintenanceSearchQuery, maintenanceVehicleId, maintenanceTypeFilter, maintenanceSortBy]);

  if (vehiclesLoading || maintenanceLoading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      {/* Статистика */}
      {/* ... существующие карточки */}

      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            currentView === 'vehicles'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('vehicles')}
        >
          <Car className="h-4 w-4" />
          Техника
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{vehicles.length}</span>
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
            currentView === 'maintenance'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setCurrentView('maintenance')}
        >
          <Wrench className="h-4 w-4" />
          Обслуживание
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">{maintenance.length}</span>
        </button>
      </div>

      {currentView === 'vehicles' && (
        <>
          <VehiclesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            insuranceFilter={insuranceFilter}
            onInsuranceFilterChange={setInsuranceFilter}
            roadLegalFilter={roadLegalFilter}
            onRoadLegalFilterChange={setRoadLegalFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Учет техники ({filteredVehicles.length} из {vehicles.length})</h2>
            <Button onClick={() => setShowVehicleForm(true)}>Новая техника</Button>
          </div>
          {showVehicleForm && <VehicleForm onSubmit={addVehicle} onCancel={() => setShowVehicleForm(false)} />}
          <VehiclesList vehicles={filteredVehicles} onUpdateVehicle={updateVehicle} onDeleteVehicle={deleteVehicle} />
        </>
      )}

      {currentView === 'maintenance' && (
        <>
          <MaintenanceFilters
            vehicles={vehicles}
            selectedVehicleId={maintenanceVehicleId}
            onVehicleChange={setMaintenanceVehicleId}
            typeFilter={maintenanceTypeFilter}
            onTypeFilterChange={setMaintenanceTypeFilter}
            searchQuery={maintenanceSearchQuery}
            onSearchChange={setMaintenanceSearchQuery}
            sortBy={maintenanceSortBy}
            onSortChange={setMaintenanceSortBy}
            onGenerateReport={() => {}}
          />
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Записи обслуживания ({filteredMaintenance.length} из {maintenance.length})</h2>
            <Button onClick={() => setShowMaintenanceForm(true)} disabled={vehicles.length === 0}>Новая запись</Button>
          </div>
          {showMaintenanceForm && (
            <MaintenanceForm
              onSubmit={addMaintenance}
              onCancel={() => setShowMaintenanceForm(false)}
              vehicles={vehicles}
            />
          )}
          <MaintenanceList
            maintenance={filteredMaintenance}
            onUpdateMaintenance={updateMaintenance}
            onDeleteMaintenance={deleteMaintenance}
          />
        </>
      )}
    </div>
  );
}