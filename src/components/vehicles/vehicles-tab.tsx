'use client';

import { useState, useMemo } from 'react';
import { Vehicle, MaintenanceRecord, VehicleType } from '@/types';
import { VehiclesList } from '@/components/vehicles/vehicles-list';
import { MaintenanceList } from '@/components/vehicles/maintenance-list';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { MaintenanceForm } from '@/components/vehicles/maintenance-form';
import { VehiclesFilters } from '@/components/vehicles/vehicles-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [insuranceFilter, setInsuranceFilter] = useState('');
  const [roadLegalFilter, setRoadLegalFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Фильтрация и сортировка техники
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      // Фильтр по поиску
      if (searchQuery && !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Фильтр по типу
      if (typeFilter && vehicle.type !== typeFilter) {
        return false;
      }
      
      // Фильтр по страховке
      if (insuranceFilter) {
        const today = new Date();
        switch (insuranceFilter) {
          case 'with-insurance':
            // Только с действующей страховкой
            if (!vehicle.insuranceDate || new Date(vehicle.insuranceDate) < today) return false;
            break;
          case 'without-insurance':
            // Без страховки или с просроченной
            if (vehicle.insuranceDate && new Date(vehicle.insuranceDate) >= today) return false;
            break;
          case 'expiring-soon':
            // Истекает в течение 30 дней и еще действует
            if (!vehicle.insuranceDate) return false;
            const daysUntilInsuranceExpiry = Math.ceil((new Date(vehicle.insuranceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilInsuranceExpiry <= 0 || daysUntilInsuranceExpiry > 30) return false;
            break;
          case 'expired':
            // Просроченная страховка
            if (!vehicle.insuranceDate || new Date(vehicle.insuranceDate) >= today) return false;
            break;
        }
      }
      
      // Фильтр по допуску к движению
      if (roadLegalFilter) {
        const today = new Date();
        switch (roadLegalFilter) {
          case 'with-road-legal':
            // Только с действующим допуском
            if (!vehicle.roadLegalUntil || new Date(vehicle.roadLegalUntil) < today) return false;
            break;
          case 'without-road-legal':
            // Без допуска или с просроченным
            if (vehicle.roadLegalUntil && new Date(vehicle.roadLegalUntil) >= today) return false;
            break;
          case 'expiring-soon':
            // Истекает в течение 30 дней и еще действует
            if (!vehicle.roadLegalUntil) return false;
            const daysUntilRoadLegalExpiry = Math.ceil((new Date(vehicle.roadLegalUntil).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilRoadLegalExpiry <= 0 || daysUntilRoadLegalExpiry > 30) return false;
            break;
          case 'expired':
            // Просроченный допуск
            if (!vehicle.roadLegalUntil || new Date(vehicle.roadLegalUntil) >= today) return false;
            break;
        }
      }
      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'year':
          return (b.year || 0) - (a.year || 0);
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [vehicles, searchQuery, typeFilter, insuranceFilter, roadLegalFilter, sortBy]);

  const handleAddVehicle = async (vehicleData: any) => {
    await onAddVehicle(vehicleData);
    setShowVehicleForm(false);
  };

  const handleAddMaintenance = async (maintenanceData: any) => {
    await onAddMaintenance(maintenanceData);
    setShowMaintenanceForm(false);
  };

  // Статистика
  const stats = {
    totalVehicles: vehicles.length,
    totalMaintenance: maintenance.length,
    filteredVehicles: filteredVehicles.length,
    withoutRoadLegal: vehicles.filter(v => !v.roadLegalUntil).length,
    insuranceStats: {
      total: vehicles.filter(v => {
        if (!v.insuranceDate) return false;
        return new Date(v.insuranceDate) >= new Date(); // Только не просроченные
      }).length,
      expired: vehicles.filter(v => {
        if (!v.insuranceDate) return false;
        return new Date(v.insuranceDate) < new Date();
      }).length,
      expiringSoon: vehicles.filter(v => {
        if (!v.insuranceDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(v.insuranceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30; // Только не просроченные и истекающие
      }).length,
    },
    roadLegalStats: {
      total: vehicles.filter(v => {
        if (!v.roadLegalUntil) return false;
        return new Date(v.roadLegalUntil) >= new Date(); // Только не просроченные
      }).length,
      expired: vehicles.filter(v => {
        if (!v.roadLegalUntil) return false;
        return new Date(v.roadLegalUntil) < new Date();
      }).length,
      expiringSoon: vehicles.filter(v => {
        if (!v.roadLegalUntil) return false;
        const daysUntilExpiry = Math.ceil((new Date(v.roadLegalUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30; // Только не просроченные и истекающие
      }).length,
    },
    byType: vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-xs text-blue-600 font-medium">Всего техники</div>
            <div className="text-lg font-bold text-blue-800">{stats.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <div className="text-xs text-green-600 font-medium">Записей обслуживания</div>
            <div className="text-lg font-bold text-green-800">{stats.totalMaintenance}</div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-50">
          <CardContent className="p-3">
            <div className="text-xs text-cyan-600 font-medium">Со страховкой</div>
            <div className="text-lg font-bold text-cyan-800">{stats.insuranceStats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-3">
            <div className="text-xs text-yellow-600 font-medium">Страховка истекает</div>
            <div className="text-lg font-bold text-yellow-800">{stats.insuranceStats.expiringSoon}</div>
          </CardContent>
        </Card>
        <Card className="bg-teal-50">
          <CardContent className="p-3">
            <div className="text-xs text-teal-600 font-medium">С допуском</div>
            <div className="text-lg font-bold text-teal-800">{stats.roadLegalStats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-3">
            <div className="text-xs text-orange-600 font-medium">Допуск истекает</div>
            <div className="text-lg font-bold text-orange-800">{stats.roadLegalStats.expiringSoon}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-3">
            <div className="text-xs text-red-600 font-medium">Без допуска</div>
            <div className="text-lg font-bold text-red-800">{stats.withoutRoadLegal}</div>
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
          {/* Фильтры */}
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

          {/* Кнопки действий */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Учет техники ({filteredVehicles.length} из {vehicles.length})
            </h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowVehicleForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить технику
              </Button>
            </div>
          </div>

          {/* Форма добавления */}
          {showVehicleForm && (
            <VehicleForm 
              onSubmit={handleAddVehicle}
              onCancel={() => setShowVehicleForm(false)}
            />
          )}

          {/* Список техники */}
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
          {/* Кнопки действий */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Записи обслуживания
            </h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowMaintenanceForm(true)}
                disabled={vehicles.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Новая запись
                {vehicles.length === 0 && (
                  <span className="text-xs ml-2">(сначала добавьте технику)</span>
                )}
              </Button>
            </div>
          </div>

          {/* Форма добавления */}
          {showMaintenanceForm && (
            <MaintenanceForm 
              onSubmit={handleAddMaintenance}
              onCancel={() => setShowMaintenanceForm(false)}
              vehicles={vehicles}
            />
          )}

          {/* Список обслуживания */}
          <MaintenanceList 
            maintenance={maintenance}
            onUpdateMaintenance={onUpdateMaintenance}
            onDeleteMaintenance={onDeleteMaintenance}
          />
        </>
      )}
    </div>
  );
}