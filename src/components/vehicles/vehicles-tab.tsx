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
import { Plus, Wrench, Car, ShieldOff, RouteOff, AlertTriangle } from 'lucide-react';
import { generateMaintenanceReport } from '@/utils/reportMaintenance';

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
  
  // Фильтры для техники
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [insuranceFilter, setInsuranceFilter] = useState('');
  const [roadLegalFilter, setRoadLegalFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Фильтры для обслуживания
  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState('');
  const [maintenanceVehicleId, setMaintenanceVehicleId] = useState('all');
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('all');
  const [maintenanceSortBy, setMaintenanceSortBy] = useState('dateDesc');

  // Фильтрация техники
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      if (searchQuery && !vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter && vehicle.type !== typeFilter) return false;
      
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
            const days = Math.ceil((new Date(vehicle.insuranceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (days <= 0 || days > 30) return false;
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
            const days = Math.ceil((new Date(vehicle.roadLegalUntil).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (days <= 0 || days > 30) return false;
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

  // Фильтрация обслуживания
  const filteredMaintenance = useMemo(() => {
    let filtered = maintenance.filter(record => {
      if (maintenanceSearchQuery && 
          !record.description.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) &&
          !(record.notes || '').toLowerCase().includes(maintenanceSearchQuery.toLowerCase())) {
        return false;
      }
      if (maintenanceVehicleId !== 'all' && record.vehicleId !== parseInt(maintenanceVehicleId)) return false;
      if (maintenanceTypeFilter !== 'all' && record.type !== maintenanceTypeFilter) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (maintenanceSortBy) {
        case 'dateDesc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'dateAsc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'vehicle': return a.vehicleId - b.vehicleId;
        case 'type': return a.type.localeCompare(b.type);
        default: return 0;
      }
    });
    return filtered;
  }, [maintenance, maintenanceSearchQuery, maintenanceVehicleId, maintenanceTypeFilter, maintenanceSortBy]);

  // Вспомогательные функции для проверки дат
  const isDateExpired = (date?: Date) => date ? new Date(date) < new Date() : false;
  const isDateExpiringSoon = (date?: Date, daysThreshold = 30) => {
    if (!date) return false;
    const daysDiff = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  // Статистика
  const stats = {
    totalVehicles: vehicles.length,
    withoutInsurance: vehicles.filter(v => !v.insuranceDate || isDateExpired(v.insuranceDate)).length,
    withoutRoadLegal: vehicles.filter(v => !v.roadLegalUntil || isDateExpired(v.roadLegalUntil)).length,
    expiringInsurance: vehicles.filter(v => v.insuranceDate && !isDateExpired(v.insuranceDate) && isDateExpiringSoon(v.insuranceDate)).length,
    expiringRoadLegal: vehicles.filter(v => v.roadLegalUntil && !isDateExpired(v.roadLegalUntil) && isDateExpiringSoon(v.roadLegalUntil)).length,
  };

  // Обработчики
  const handleAddVehicle = async (vehicleData: any) => {
    await onAddVehicle(vehicleData);
    setShowVehicleForm(false);
  };

  const handleAddMaintenance = async (maintenanceData: any) => {
    await onAddMaintenance(maintenanceData);
    setShowMaintenanceForm(false);
  };

  // Генерация отчёта по обслуживанию
  const handleGenerateMaintenanceReport = () => {
    const vehiclesMap = new Map(vehicles.map(v => [v.id, v]));
    generateMaintenanceReport({
      records: filteredMaintenance,
      vehiclesMap,
      filters: {
        searchQuery: maintenanceSearchQuery,
        vehicleId: maintenanceVehicleId,
        typeFilter: maintenanceTypeFilter,
        sortBy: maintenanceSortBy,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="text-xs font-medium text-blue-600">Всего техники</div>
            <div className="text-lg font-bold text-blue-800">{stats.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card className={`${stats.withoutInsurance > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${stats.withoutInsurance > 0 ? 'text-red-600' : 'text-gray-600'}`}>Без страховки</div>
                <div className={`text-lg font-bold ${stats.withoutInsurance > 0 ? 'text-red-800' : 'text-gray-800'}`}>{stats.withoutInsurance}</div>
              </div>
              <ShieldOff className={`h-5 w-5 ${stats.withoutInsurance > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${stats.withoutRoadLegal > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${stats.withoutRoadLegal > 0 ? 'text-red-600' : 'text-gray-600'}`}>Без допуска</div>
                <div className={`text-lg font-bold ${stats.withoutRoadLegal > 0 ? 'text-red-800' : 'text-gray-800'}`}>{stats.withoutRoadLegal}</div>
              </div>
              <RouteOff className={`h-5 w-5 ${stats.withoutRoadLegal > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${stats.expiringInsurance > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${stats.expiringInsurance > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>Истекает страховка</div>
                <div className={`text-lg font-bold ${stats.expiringInsurance > 0 ? 'text-yellow-800' : 'text-gray-800'}`}>{stats.expiringInsurance}</div>
              </div>
              <AlertTriangle className={`h-5 w-5 ${stats.expiringInsurance > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        <Card className={`${stats.expiringRoadLegal > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${stats.expiringRoadLegal > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>Истекает допуск</div>
                <div className={`text-lg font-bold ${stats.expiringRoadLegal > 0 ? 'text-yellow-800' : 'text-gray-800'}`}>{stats.expiringRoadLegal}</div>
              </div>
              <AlertTriangle className={`h-5 w-5 ${stats.expiringRoadLegal > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
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

      {/* Вкладка техники */}
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
          {showVehicleForm && <VehicleForm onSubmit={handleAddVehicle} onCancel={() => setShowVehicleForm(false)} />}
          <VehiclesList vehicles={filteredVehicles} onUpdateVehicle={onUpdateVehicle} onDeleteVehicle={onDeleteVehicle} />
        </>
      )}

      {/* Вкладка обслуживания */}
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
            onGenerateReport={handleGenerateMaintenanceReport}
          />
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Записи обслуживания ({filteredMaintenance.length} из {maintenance.length})</h2>
            <Button onClick={() => setShowMaintenanceForm(true)} disabled={vehicles.length === 0}>Новая запись</Button>
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