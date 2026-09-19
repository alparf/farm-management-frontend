'use client';

import { useState } from 'react';
import { MaintenanceRecord } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MaintenanceCard } from './maintenance-card';
import { MaintenanceEmptyState } from './maintenance-empty-state';

interface MaintenanceListProps {
  maintenance: MaintenanceRecord[];
  onUpdateMaintenance: (id: number, updates: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord | void>;
  onDeleteMaintenance: (id: number) => Promise<void>;
  onCompleteMaintenance?: (id: number) => Promise<MaintenanceRecord | void>;
  onUncompleteMaintenance?: (id: number) => Promise<MaintenanceRecord | void>;
}

export function MaintenanceList({
  maintenance,
  onUpdateMaintenance,
  onDeleteMaintenance,
  onCompleteMaintenance,
  onUncompleteMaintenance,
}: MaintenanceListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    record: MaintenanceRecord | null;
  }>({
    isOpen: false,
    record: null,
  });

  const [editData, setEditData] = useState<{
    date: string;
    hours: string;
    description: string;
    notes: string;
    completed: boolean;
  }>({
    date: '',
    hours: '',
    description: '',
    notes: '',
    completed: false,
  });

  const requestDelete = (record: MaintenanceRecord) => {
    setDeleteConfirm({ isOpen: true, record });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.record) {
      try {
        await onDeleteMaintenance(deleteConfirm.record.id);
        setDeleteConfirm({ isOpen: false, record: null });
      } catch (error) {
        console.error('Error deleting maintenance record:', error);
        setDeleteConfirm({ isOpen: false, record: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, record: null });
  };

  const startEdit = (record: MaintenanceRecord) => {
    setEditingId(record.id);
    setEditData({
      date: new Date(record.date).toISOString().split('T')[0],
      hours: record.hours?.toString() || '',
      description: record.description,
      notes: record.notes || '',
      completed: record.completed ?? false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateMaintenance(id, {
        date: new Date(editData.date),
        hours: editData.hours ? parseFloat(editData.hours) : undefined,
        description: editData.description,
        notes: editData.notes || undefined,
        completed: editData.completed,
        actualDate: editData.completed ? new Date() : undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating maintenance:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComplete = async (id: number) => {
    if (onCompleteMaintenance) {
      await onCompleteMaintenance(id);
    } else {
      await onUpdateMaintenance(id, { completed: true, actualDate: new Date() });
    }
  };

  const handleUncomplete = async (id: number) => {
    if (onUncompleteMaintenance) {
      await onUncompleteMaintenance(id);
    } else {
      await onUpdateMaintenance(id, { completed: false, actualDate: undefined });
    }
  };

  if (maintenance.length === 0) {
    return <MaintenanceEmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {maintenance.map((record) => (
          <MaintenanceCard
            key={record.id}
            record={record}
            isEditing={editingId === record.id}
            editData={editData}
            onStartEdit={() => startEdit(record)}
            onSaveEdit={() => saveEdit(record.id)}
            onCancelEdit={cancelEdit}
            onUpdateField={updateEditField}
            onDelete={() => requestDelete(record)}
            onComplete={() => handleComplete(record.id)}
            onUncomplete={() => handleUncomplete(record.id)}
            isExpanded={expandedId === record.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === record.id ? null : record.id)
            }
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление записи обслуживания"
        message={`Вы уверены, что хотите удалить запись для "${deleteConfirm.record?.vehicleName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}

export default MaintenanceList;