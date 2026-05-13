'use client';

import { useState, useMemo } from 'react';
import { Vehicle, MaintenanceRecord, VehicleType } from '@/types';
import { VehiclesList } from '@/components/vehicles/vehicles-list';
import { MaintenanceList } from '@/components/vehicles/maintenance-list';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { MaintenanceForm } from '@/components/vehicles/maintenance-form';
import { VehiclesFilters } from '@/components/vehicles/vehicles-filters';
import { MaintenanceFilters } from '@/components/vehicles/maintenance-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Wrench, Car } from 'lucide-react';

interface VehiclesTabProps {
  vehicles: Vehicle[];
  maintenance: MaintenanceRecord[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle | void>;
  onUpdateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<Vehicle | void>;
  onDeleteVehicle: (id: number) => Promise<void>;
  onAddMaintenance: (maintenance: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => Promise<MaintenanceRecord | void>;
  onUpdateMaintenance: (id: number, updates: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord | void>;
  onDeleteMaintenance: (id: number) => Promise<void>;
}

type VehiclesView = 'vehicles' | 'maintenance';

export function VehiclesTab({
  vehicles,
  maintenance,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddMaintenance,
  onUpdateMaintenance,
  onDeleteMaintenance
}: VehiclesTabProps) {
  const [currentView, setCurrentView] = useState<VehiclesView>('vehicles');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  
  // Состояния для фильтров техники
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [insuranceFilter, setInsuranceFilter] = useState('');
  const [roadLegalFilter, setRoadLegalFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Состояния для фильтров обслуживания
  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState('');
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState<VehicleType | ''>('');
  const [maintenanceServiceTypeFilter, setMaintenanceServiceTypeFilter] = useState('');

  // Фильтрация и сортировка техники
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      if (searchQuery && !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (typeFilter && vehicle.type !== typeFilter) {
        return false;
      }
      
      if (insuranceFilter) {
        const today = new Date();
        switch (insuranceFilter) {
          case 'with-insurance':
            if (!vehicle.insuranceDate || new Date(vehicle.insuranceDate) < today) return false;
            break;
          case 'without-insurance':
            if (vehicle.insuranceDate && new Date(vehicle.insuranceDate) >= today) return false;
            break;
          case 'expiring-soon':
            if (!vehicle.insuranceDate) return false;
            const daysUntilInsuranceExpiry = Math.ceil((new Date(vehicle.insuranceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilInsuranceExpiry <= 0 || daysUntilInsuranceExpiry > 30) return false;
            break;
          case 'expired':
            if (!vehicle.insuranceDate || new Date(vehicle.insuranceDate) >= today) return false;
            break;
        }
      }
      
      if (roadLegalFilter) {
        const today = new Date();
        switch (roadLegalFilter) {
          case 'with-road-legal':
            if (!vehicle.roadLegalUntil || new Date(vehicle.roadLegalUntil) < today) return false;
            break;
          case 'without-road-legal':
            if (vehicle.roadLegalUntil && new Date(vehicle.roadLegalUntil) >= today) return false;
            break;
          case 'expiring-soon':
            if (!vehicle.roadLegalUntil) return false;
            const daysUntilRoadLegalExpiry = Math.ceil((new Date(vehicle.roadLegalUntil).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilRoadLegalExpiry <= 0 || daysUntilRoadLegalExpiry > 30) return false;
            break;
          case 'expired':
            if (!vehicle.roadLegalUntil || new Date(vehicle.roadLegalUntil) >= today) return false;
            break;
        }
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'type': return a.type.localeCompare(b.type);
        case 'year': return (b.year || 0) - (a.year || 0);
        case 'insurance':
          if (!a.insuranceDate && !b.insuranceDate) return 0;
          if (!a.insuranceDate) return 1;
          if (!b.insuranceDate) return -1;
          return new Date(a.insuranceDate).getTime() - new Date(b.insuranceDate).getTime();
        case 'roadLegal':
          if (!a.roadLegalUntil && !b.roadLegalUntil) return 0;
          if (!a.roadLegalUntil) return 1;
          if (!b.roadLegalUntil) return -1;
          return new Date(a.roadLegalUntil).getTime() - new Date(b.roadLegalUntil).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

    return filtered;
  }, [vehicles, searchQuery, typeFilter, insuranceFilter, roadLegalFilter, sortBy]);

  // Фильтрация записей обслуживания
  const filteredMaintenance = useMemo(() => {
    let filtered = maintenance.filter(record => {
      if (maintenanceSearchQuery && 
          !record.vehicleName.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) &&
          !record.description.toLowerCase().includes(maintenanceSearchQuery.toLowerCase())) {
        return false;
      }
      
      if (maintenanceTypeFilter) {
        const vehicle = vehicles.find(v => v.id === record.vehicleId);
        if (!vehicle || vehicle.type !== maintenanceTypeFilter) return false;
      }
      
      if (maintenanceServiceTypeFilter && record.type !== maintenanceServiceTypeFilter) {
        return false;
      }
      
      return true;
    });

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return filtered;
  }, [maintenance, maintenanceSearchQuery, maintenanceTypeFilter, maintenanceServiceTypeFilter, vehicles]);

  const handleAddVehicle = async (vehicleData: any) => {
    await onAddVehicle(vehicleData);
    setShowVehicleForm(false);
  };

  const handleAddMaintenance = async (maintenanceData: any) => {
    await onAddMaintenance(maintenanceData);
    setShowMaintenanceForm(false);
  };

  const stats = {
    totalVehicles: vehicles.length,
    totalMaintenance: maintenance.length,
    insuranceStats: {
      active: vehicles.filter(v => v.insuranceDate && new Date(v.insuranceDate) >= new Date()).length,
      expiringSoon: vehicles.filter(v => {
        if (!v.insuranceDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(v.insuranceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      }).length,
    },
    roadLegalStats: {
      active: vehicles.filter(v => v.roadLegalUntil && new Date(v.roadLegalUntil) >= new Date()).length,
      expiringSoon: vehicles.filter(v => {
        if (!v.roadLegalUntil) return false;
        const daysUntilExpiry = Math.ceil((new Date(v.roadLegalUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      }).length,
    },
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-xs text-blue-600 font-medium">Всего техники</div>
            <div className="text-lg font-bold text-blue-800">{stats.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <div className="text-xs text-green-600 font-medium">Обслуживаний</div>
            <div className="text-lg font-bold text-green-800">{stats.totalMaintenance}</div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50">
          <CardContent className="p-3">
            <div className="text-xs text-cyan-600 font-medium">Страховка активна</div>
            <div className="text-lg font-bold text-cyan-800">{stats.insuranceStats.active}</div>
          </CardContent>
        </Card>
        <Card className="bg-teal-50">
          <CardContent className="p-3">
            <div className="text-xs text-teal-600 font-medium">Допуск активен</div>
            <div className="text-lg font-bold text-teal-800">{stats.roadLegalStats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Переключение вкладок */}
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
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {vehicles.length}
          </span>
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
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {maintenance.length}
          </span>
        </button>
      </div>

      {/* Контент вкладки техники */}
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
            <h2 className="text-xl font-semibold">
              Учет техники ({filteredVehicles.length} из {vehicles.length})
            </h2>
            <Button onClick={() => setShowVehicleForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить технику
            </Button>
          </div>

          {showVehicleForm && (
            <VehicleForm 
              onSubmit={handleAddVehicle}
              onCancel={() => setShowVehicleForm(false)}
            />
          )}

          <VehiclesList 
            vehicles={filteredVehicles}
            onUpdateVehicle={onUpdateVehicle}
            onDeleteVehicle={onDeleteVehicle}
          />
        </>
      )}

      {/* Контент вкладки обслуживания */}
      {currentView === 'maintenance' && (
        <>
          <MaintenanceFilters
            searchQuery={maintenanceSearchQuery}
            onSearchChange={setMaintenanceSearchQuery}
            vehicleTypeFilter={maintenanceTypeFilter}
            onVehicleTypeFilterChange={setMaintenanceTypeFilter}
            serviceTypeFilter={maintenanceServiceTypeFilter}
            onServiceTypeFilterChange={setMaintenanceServiceTypeFilter}
            vehicles={vehicles}
          />

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Записи обслуживания ({filteredMaintenance.length} из {maintenance.length})
            </h2>
            <Button 
              onClick={() => setShowMaintenanceForm(true)}
              disabled={vehicles.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Новая запись
            </Button>
          </div>

          {showMaintenanceForm && (
            <MaintenanceForm 
              onSubmit={handleAddMaintenance}
              onCancel={() => setShowMaintenanceForm(false)}
              vehicles={vehicles}
            />
          )}

          <MaintenanceList 
            maintenance={filteredMaintenance}
            onUpdateMaintenance={onUpdateMaintenance}
            onDeleteMaintenance={onDeleteMaintenance}
          />
        </>
      )}
    </div>
  );
}