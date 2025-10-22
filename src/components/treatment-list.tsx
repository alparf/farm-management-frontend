'use client';

import { useState } from 'react';
import { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface VehiclesListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<void>;
  onDeleteVehicle: (id: number) => Promise<void>;
}

export function VehiclesList({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehiclesListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null
  });

  const requestDelete = (vehicle: Vehicle) => {
    setDeleteConfirm({
      isOpen: true,
      vehicle
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.vehicle) {
      try {
        await onDeleteVehicle(deleteConfirm.vehicle.id);
        setDeleteConfirm({ isOpen: false, vehicle: null });
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setDeleteConfirm({ isOpen: false, vehicle: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, vehicle: null });
  };

  // Функция для определения статуса страховки
  const getInsuranceStatus = (insuranceDate?: Date) => {
    if (!insuranceDate) return null;
    
    const today = new Date();
    const insuranceEnd = new Date(insuranceDate);
    const daysUntilExpiry = Math.ceil((insuranceEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Просрочена', color: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', text: `Скоро истекает (${daysUntilExpiry} д.)`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'valid', text: `Действует до ${insuranceEnd.toLocaleDateString('ru-RU')}`, color: 'bg-green-100 text-green-800' };
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'трактор': 'bg-orange-100 text-orange-800 border-orange-200',
      'комбайн': 'bg-amber-100 text-amber-800 border-amber-200',
      'грузовой автомобиль': 'bg-blue-100 text-blue-800 border-blue-200',
      'легковой автомобиль': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'прицеп': 'bg-gray-100 text-gray-800 border-gray-200',
      'сельхозорудие': 'bg-green-100 text-green-800 border-green-200',
      'другая техника': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        Техника не добавлена. Добавьте первую единицу техники.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => {
          const insuranceStatus = getInsuranceStatus(vehicle.insuranceDate);
          
          return (
            <div
              key={vehicle.id}
              className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getTypeColor(vehicle.type)}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {vehicle.name}
                  </h3>
                  <span className="text-xs text-gray-600 capitalize">
                    {vehicle.type}
                  </span>
                </div>
              </div>

              {/* Статус страховки */}
              {insuranceStatus && (
                <div className={`text-xs px-2 py-1 rounded-full mb-3 ${insuranceStatus.color}`}>
                  {insuranceStatus.text}
                </div>
              )}

              {vehicle.model && (
                <div className="text-sm text-gray-700 mb-1">
                  Модель: {vehicle.model}
                </div>
              )}

              {vehicle.year && (
                <div className="text-sm text-gray-700 mb-1">
                  Год: {vehicle.year}
                </div>
              )}

              {vehicle.vin && (
                <div className="text-sm text-gray-700 mb-3">
                  VIN: {vehicle.vin}
                </div>
              )}

              {vehicle.notes && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {vehicle.notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 mb-3">
                Добавлено: {vehicle.createdAt.toLocaleDateString('ru-RU')}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => requestDelete(vehicle)}
                  className="flex-1 h-8 text-xs"
                >
                  Удалить
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление техники"
        message={`Вы уверены, что хотите удалить "${deleteConfirm.vehicle?.name}"? Все записи обслуживания этой техники также будут удалены.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}