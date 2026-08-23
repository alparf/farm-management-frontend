// components/treatments/treatments-list.tsx
'use client';

import { useState } from 'react';
import { ChemicalTreatment } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Beaker } from 'lucide-react';
import { TreatmentCard } from './treatment-card';

interface CompactTreatmentListProps {
  treatments: ChemicalTreatment[];
  onUpdateTreatment: (id: number, updates: Partial<ChemicalTreatment>) => Promise<void>;
  onDeleteTreatment: (id: number) => Promise<void>;
  onCompleteTreatment?: (id: number) => Promise<void>;
  onUncompleteTreatment?: (id: number) => Promise<void>;
}

export function CompactTreatmentList({ 
  treatments, 
  onUpdateTreatment, 
  onDeleteTreatment,
  onCompleteTreatment,
  onUncompleteTreatment 
}: CompactTreatmentListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    culture: any;
    area: string;
    dueDate: string;
    actualDate: string;
    notes: string;
  }>({
    culture: 'яблоко',
    area: '',
    dueDate: '',
    actualDate: '',
    notes: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; treatment: ChemicalTreatment | null }>({
    isOpen: false,
    treatment: null
  });

  const startEdit = (treatment: ChemicalTreatment) => {
    setEditingId(treatment.id);
    setEditData({
      culture: treatment.culture,
      area: treatment.area.toString(),
      dueDate: treatment.dueDate ? new Date(treatment.dueDate).toISOString().split('T')[0] : '',
      actualDate: treatment.actualDate ? new Date(treatment.actualDate).toISOString().split('T')[0] : '',
      notes: treatment.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      const updates: Partial<ChemicalTreatment> = {
        culture: editData.culture,
        area: parseFloat(editData.area),
        notes: editData.notes || undefined,
      };

      if (editData.dueDate) {
        updates.dueDate = new Date(editData.dueDate);
      } else {
        updates.dueDate = undefined;
      }

      if (editData.actualDate) {
        updates.actualDate = new Date(editData.actualDate);
      } else {
        updates.actualDate = undefined;
      }

      await onUpdateTreatment(id, updates);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating treatment:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const markAsCompleted = async (id: number) => {
    if (onCompleteTreatment) {
      await onCompleteTreatment(id);
    } else {
      await onUpdateTreatment(id, {
        completed: true,
        actualDate: new Date() // передаём Date
      });
    }
  };

  const markAsPending = async (id: number) => {
    if (onUncompleteTreatment) {
      await onUncompleteTreatment(id);
    } else {
      await onUpdateTreatment(id, {
        completed: false,
        actualDate: undefined
      });
    }
  };

  const requestDelete = (treatment: ChemicalTreatment) => {
    setDeleteConfirm({
      isOpen: true,
      treatment
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.treatment) {
      try {
        await onDeleteTreatment(deleteConfirm.treatment.id);
        setDeleteConfirm({ isOpen: false, treatment: null });
      } catch (error) {
        console.error('Error deleting treatment:', error);
        setDeleteConfirm({ isOpen: false, treatment: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, treatment: null });
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Beaker className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Нет созданных обработок</p>
        <p className="text-sm mt-1">Нажмите "Новая обработка" чтобы добавить</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {treatments.map((treatment) => (
          <TreatmentCard
            key={treatment.id}
            treatment={treatment}
            isEditing={editingId === treatment.id}
            editData={editData}
            onEditChange={updateEditField}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onComplete={markAsCompleted}
            onUncomplete={markAsPending}
            onEdit={startEdit}
            onDelete={requestDelete}
            onUpdateTreatment={onUpdateTreatment}
            onDeleteTreatment={onDeleteTreatment}
            onCompleteTreatment={onCompleteTreatment}
            onUncompleteTreatment={onUncompleteTreatment}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление обработки"
        message={`Вы уверены, что хотите удалить обработку для "${deleteConfirm.treatment?.culture}"? Это действие нельзя отменить. Препараты будут возвращены на склад.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}