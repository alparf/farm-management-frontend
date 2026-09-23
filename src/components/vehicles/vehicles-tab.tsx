'use client';

import { useState, useMemo } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import { Vehicle, VehicleType } from '@/types';
import { VehiclesList } from './vehicles-list';
import { MaintenanceList } from './maintenance-list';
import { VehicleForm } from './vehicle-form';
import { MaintenanceForm } from './maintenance-form';
import { VehiclesFilters } from './vehicles-filters';
import { MaintenanceFilters } from './maintenance-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Car, ShieldOff, RouteOff, AlertTriangle } from 'lucide-react';
import { generateVehiclesReport } from '@/utils/reportVehicles';
import { generateMaintenanceReport } from '@/utils/reportMaintenance';

type VehiclesView = 'vehicles' | 'maintenance';

export default function VehiclesTab() {
  const {
    vehicles,
    isLoading: vehiclesLoading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  } = useVehicles();

  const {
    maintenance,
    isLoading: maintenanceLoading,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    completeMaintenance,
    uncompleteMaintenance,
  } = useMaintenance();

  const [currentView, setCurrentView] = useState<VehiclesView>('vehicles');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  // Фильтры техники
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('');
  const [insuranceFilter, setInsuranceFilter] = useState('');
  const [roadLegalFilter, setRoadLegalFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Фильтры обслуживания
  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState('');
  const [maintenanceVehicleId, setMaintenanceVehicleId] = useState('all');
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState('all');
  const [maintenanceSortBy, setMaintenanceSortBy] = useState('dateDesc');

  const isDateExpired = (date?: Date) => (date ? new Date(date) < new Date() : false);
  const isDateExpiringSoon = (date?: Date, daysThreshold = 30) => {
    if (!date) return false;
    const daysDiff = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  const applyInsuranceFilter = (filter: string) => {
    setInsuranceFilter(filter);
    setSearchQuery('');
    setTypeFilter('');
  };

  const applyRoadLegalFilter = (filter: string) => {
    setRoadLegalFilter(filter);
    setSearchQuery('');
    setTypeFilter('');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setInsuranceFilter('');
    setRoadLegalFilter('');
  };

  const stats = {
    totalVehicles: vehicles.length,
    withoutInsurance: vehicles.filter((v) => !v.insuranceDate || isDateExpired(v.insuranceDate)).length,
    withoutRoadLegal: vehicles.filter((v) => !v.roadLegalUntil || isDateExpired(v.roadLegalUntil)).length,
    expiringInsurance: vehicles.filter(
      (v) => v.insuranceDate && !isDateExpired(v.insuranceDate) && isDateExpiringSoon(v.insuranceDate),
    ).length,
    expiringRoadLegal: vehicles.filter(
      (v) => v.roadLegalUntil && !isDateExpired(v.roadLegalUntil) && isDateExpiringSoon(v.roadLegalUntil),
    ).length,
  };

  const vehiclesMap = useMemo(() => {
    const map = new Map<number, Vehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const filtered = vehicles.filter((vehicle) => {
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
          case 'expiring-soon': {
            if (!vehicle.insuranceDate) return false;
            const days = Math.ceil(
              (new Date(vehicle.insuranceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (days <= 0 || days > 30) return false;
            break;
          }
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
          case 'expiring-soon': {
            if (!vehicle.roadLegalUntil) return false;
            const days = Math.ceil(
              (new Date(vehicle.roadLegalUntil).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            if (days <= 0 || days > 30) return false;
            break;
          }
          case 'expired':
            if (!vehicle.roadLegalUntil || new Date(vehicle.roadLegalUntil) >= today) return false;
            break;
        }
      }
      return true;
    });

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

  const filteredMaintenance = useMemo(() => {
    const filtered = maintenance.filter((record) => {
      if (
        maintenanceSearchQuery &&
        !record.description.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) &&
        !(record.notes || '').toLowerCase().includes(maintenanceSearchQuery.toLowerCase())
      ) {
        return false;
      }
      if (maintenanceVehicleId !== 'all' && record.vehicleId !== parseInt(maintenanceVehicleId)) return false;
      if (maintenanceStatusFilter === 'completed' && !record.completed) return false;
      if (maintenanceStatusFilter === 'pending' && record.completed) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (maintenanceSortBy) {
        case 'dateDesc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'dateAsc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'vehicle':
          return a.vehicleId - b.vehicleId;
        case 'status':
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        default:
          return 0;
      }
    });
    return filtered;
  }, [maintenance, maintenanceSearchQuery, maintenanceVehicleId, maintenanceStatusFilter, maintenanceSortBy]);

  const handleGenerateVehiclesReport = () => {
    generateVehiclesReport({
      vehicles: filteredVehicles,
      filters: {
        searchQuery,
        typeFilter,
        insuranceFilter,
        roadLegalFilter,
        sortBy,
      },
    });
  };

  const handleGenerateMaintenanceReport = () => {
    generateMaintenanceReport({
      records: filteredMaintenance,
      vehiclesMap,
      filters: {
        searchQuery: maintenanceSearchQuery,
        vehicleId: maintenanceVehicleId,
        statusFilter: maintenanceStatusFilter,
        sortBy: maintenanceSortBy,
      },
    });
  };

  if (vehiclesLoading || maintenanceLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Статистика техники */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card
          className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={clearAllFilters}
        >
          <CardContent className="p-3">
            <div className="text-xs font-medium text-blue-600">Всего техники</div>
            <div className="text-lg font-bold text-blue-800">{stats.totalVehicles}</div>
          </CardContent>
        </Card>

        <Card
          className={`${
            stats.withoutInsurance > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => {
            if (stats.withoutInsurance > 0) applyInsuranceFilter('without-insurance');
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-xs font-medium ${
                    stats.withoutInsurance > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  Без страховки
                </div>
                <div
                  className={`text-lg font-bold ${
                    stats.withoutInsurance > 0 ? 'text-red-800' : 'text-gray-800'
                  }`}
                >
                  {stats.withoutInsurance}
                </div>
              </div>
              <ShieldOff
                className={`h-5 w-5 ${
                  stats.withoutInsurance > 0 ? 'text-red-500' : 'text-gray-400'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            stats.withoutRoadLegal > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => {
            if (stats.withoutRoadLegal > 0) applyRoadLegalFilter('without-road-legal');
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-xs font-medium ${
                    stats.withoutRoadLegal > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  Без допуска
                </div>
                <div
                  className={`text-lg font-bold ${
                    stats.withoutRoadLegal > 0 ? 'text-red-800' : 'text-gray-800'
                  }`}
                >
                  {stats.withoutRoadLegal}
                </div>
              </div>
              <RouteOff
                className={`h-5 w-5 ${
                  stats.withoutRoadLegal > 0 ? 'text-red-500' : 'text-gray-400'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            stats.expiringInsurance > 0
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => {
            if (stats.expiringInsurance > 0) applyInsuranceFilter('expiring-soon');
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-xs font-medium ${
                    stats.expiringInsurance > 0 ? 'text-yellow-600' : 'text-gray-600'
                  }`}
                >
                  Истекает страховка
                </div>
                <div
                  className={`text-lg font-bold ${
                    stats.expiringInsurance > 0 ? 'text-yellow-800' : 'text-gray-800'
                  }`}
                >
                  {stats.expiringInsurance}
                </div>
              </div>
              <AlertTriangle
                className={`h-5 w-5 ${
                  stats.expiringInsurance > 0 ? 'text-yellow-500' : 'text-gray-400'
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            stats.expiringRoadLegal > 0
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => {
            if (stats.expiringRoadLegal > 0) applyRoadLegalFilter('expiring-soon');
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-xs font-medium ${
                    stats.expiringRoadLegal > 0 ? 'text-yellow-600' : 'text-gray-600'
                  }`}
                >
                  Истекает допуск
                </div>
                <div
                  className={`text-lg font-bold ${
                    stats.expiringRoadLegal > 0 ? 'text-yellow-800' : 'text-gray-800'
                  }`}
                >
                  {stats.expiringRoadLegal}
                </div>
              </div>
              <AlertTriangle
                className={`h-5 w-5 ${
                  stats.expiringRoadLegal > 0 ? 'text-yellow-500' : 'text-gray-400'
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Переключатель вкладок */}
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
          Заявки на ремонт
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {maintenance.length}
          </span>
        </button>
      </div>

      {/* Вкладка Техника */}
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
            onGenerateReport={handleGenerateVehiclesReport}
          />
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Учет техники ({filteredVehicles.length} из {vehicles.length})
            </h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowVehicleForm(true)}>Новая техника</Button>
            </div>
          </div>
          {showVehicleForm && (
            <VehicleForm onSubmit={addVehicle} onCancel={() => setShowVehicleForm(false)} />
          )}
          <VehiclesList
            vehicles={filteredVehicles}
            onUpdateVehicle={updateVehicle}
            onDeleteVehicle={deleteVehicle}
          />
        </>
      )}

      {/* Вкладка Заявки на ремонт */}
      {currentView === 'maintenance' && (
        <>
          <MaintenanceFilters
            vehicles={vehicles}
            selectedVehicleId={maintenanceVehicleId}
            onVehicleChange={setMaintenanceVehicleId}
            statusFilter={maintenanceStatusFilter}
            onStatusFilterChange={setMaintenanceStatusFilter}
            searchQuery={maintenanceSearchQuery}
            onSearchChange={setMaintenanceSearchQuery}
            sortBy={maintenanceSortBy}
            onSortChange={setMaintenanceSortBy}
            onGenerateReport={handleGenerateMaintenanceReport}
          />

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Заявки на ремонт ({filteredMaintenance.length} из {maintenance.length})
            </h2>
            <Button
              onClick={() => setShowMaintenanceForm(true)}
              disabled={vehicles.length === 0}
            >
              Новая заявка
            </Button>
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
            onCompleteMaintenance={completeMaintenance}
            onUncompleteMaintenance={uncompleteMaintenance}
          />
        </>
      )}
    </div>
  );
}