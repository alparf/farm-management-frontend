import { useState } from 'react';
import { Vehicle } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { VehicleCard } from './vehicle-card';
import { VehicleEmptyState } from './vehicle-empty-state';

interface VehiclesListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<Vehicle | void>;
  onDeleteVehicle: (id: number) => Promise<void>;
}

export function VehiclesList({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehiclesListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null
  });

  const [editData, setEditData] = useState<{
    name: string;
    type: Vehicle['type'];
    model: string;
    year: string;
    vin: string;
    insuranceDate?: Date;
    roadLegalUntil?: Date;
    notes: string;
  }>({
    name: '',
    type: 'трактор',
    model: '',
    year: '',
    vin: '',
    notes: ''
  });

  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditData({
      name: vehicle.name,
      type: vehicle.type,
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      vin: vehicle.vin || '',
      insuranceDate: vehicle.insuranceDate,
      roadLegalUntil: vehicle.roadLegalUntil,
      notes: vehicle.notes || ''
    });
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateVehicle(id, {
        name: editData.name,
        type: editData.type,
        model: editData.model || undefined,
        year: editData.year ? parseInt(editData.year) : undefined,
        vin: editData.vin || undefined,
        insuranceDate: editData.insuranceDate,
        roadLegalUntil: editData.roadLegalUntil,
        notes: editData.notes || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

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

  if (vehicles.length === 0) {
    return <VehicleEmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            isEditing={editingId === vehicle.id}
            editData={editData}
            onStartEdit={() => startEdit(vehicle)}
            onSaveEdit={() => saveEdit(vehicle.id)}
            onCancelEdit={cancelEdit}
            onUpdateField={updateEditField}
            onDelete={() => requestDelete(vehicle)}
          />
        ))}
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

export default VehiclesList;