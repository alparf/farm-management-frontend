'use client';

import { useState } from 'react';
import { Vehicle, MaintenanceRecord } from '@/types';
import { VehiclesList } from '@/components/vehicles-list';
import { MaintenanceList } from '@/components/maintenance-list';
import { VehicleForm } from '@/components/vehicle-form';
import { MaintenanceForm } from '@/components/maintenance-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Wrench, Car } from 'lucide-react';

interface VehiclesTabProps {
  vehicles: Vehicle[];
  maintenance: MaintenanceRecord[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: number) => Promise<void>;
  onAddMaintenance: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateMaintenance: (id: number, updates: Partial<MaintenanceRecord>) => Promise<void>;
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
    byType: vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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
            <div className="text-xs text-green-600 font-medium">Записей обслуживания</div>
            <div className="text-lg font-bold text-green-800">{stats.totalMaintenance}</div>
          </CardContent>
        </Card>
        {Object.entries(stats.byType).slice(0, 2).map(([type, count]) => (
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

      {/* Кнопки действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {currentView === 'vehicles' ? 'Учет техники' : 'Записи обслуживания'}
        </h2>
        <div className="flex gap-2">
          {currentView === 'vehicles' ? (
            <Button onClick={() => setShowVehicleForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить технику
            </Button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Формы */}
      {showVehicleForm && (
        <VehicleForm 
          onSubmit={handleAddVehicle}
          onCancel={() => setShowVehicleForm(false)}
        />
      )}

      {showMaintenanceForm && (
        <MaintenanceForm 
          onSubmit={handleAddMaintenance}
          onCancel={() => setShowMaintenanceForm(false)}
          vehicles={vehicles}
        />
      )}

      {/* Списки */}
      {currentView === 'vehicles' ? (
        <VehiclesList 
          vehicles={vehicles}
          onUpdateVehicle={onUpdateVehicle}
          onDeleteVehicle={onDeleteVehicle}
        />
      ) : (
        <MaintenanceList 
          maintenance={maintenance}
          onUpdateMaintenance={onUpdateMaintenance}
          onDeleteMaintenance={onDeleteMaintenance}
        />
      )}
    </div>
  );
}