import React, { useState, Fragment } from 'react';
import { MaintenanceRecord, MaintenanceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons } from '@/components/ui-icons';
import { Wrench, AlertTriangle, Calendar, Clock, FileText, StickyNote, Save, X } from 'lucide-react';

interface MaintenanceListProps {
  maintenance: MaintenanceRecord[];
  onUpdateMaintenance: (id: number, updates: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord | void>;
  onDeleteMaintenance: (id: number) => Promise<void>;
}

const MAINTENANCE_TYPES: MaintenanceType[] = ['Плановое ТО', 'Внеплановый ремонт'];

export function MaintenanceList({ 
  maintenance, 
  onUpdateMaintenance, 
  onDeleteMaintenance
}: MaintenanceListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; record: MaintenanceRecord | null }>({
    isOpen: false,
    record: null
  });

  // Состояния для редактирования
  const [editData, setEditData] = useState<{
    type: MaintenanceType;
    date: string;
    hours: string;
    description: string;
    notes: string;
  }>({
    type: 'Плановое ТО',
    date: '',
    hours: '',
    description: '',
    notes: '',
  });

  const requestDelete = (record: MaintenanceRecord) => {
    setDeleteConfirm({
      isOpen: true,
      record
    });
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
      type: record.type,
      date: new Date(record.date).toISOString().split('T')[0],
      hours: record.hours?.toString() || '',
      description: record.description,
      notes: record.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateMaintenance(id, {
        type: editData.type,
        date: new Date(editData.date),
        hours: editData.hours ? parseFloat(editData.hours) : undefined,
        description: editData.description,
        notes: editData.notes || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating maintenance:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getTypeStyles = (type: string) => {
    const styles: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
      'Плановое ТО': {
        bg: 'bg-green-100 text-green-800 border-green-200',
        icon: <Wrench className="h-3 w-3" />,
        label: 'Плановое ТО'
      },
      'Внеплановый ремонт': {
        bg: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="h-3 w-3" />,
        label: 'Внеплановый ремонт'
      },
    };
    return styles[type] || { bg: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Wrench className="h-3 w-3" />, label: type };
  };

  if (maintenance.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        Записей обслуживания нет. Добавьте первую запись.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenance.map((record) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          const EditIcon = ButtonIcons.Edit.icon;
          const isExpanded = expandedId === record.id;
          const isEditing = editingId === record.id;
          const typeStyle = getTypeStyles(record.type);
          
          return (
            <div
              key={record.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${typeStyle.bg}`}
            >
              {isEditing ? (
                // Режим редактирования
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Тип обслуживания</Label>
                    <select
                      value={editData.type}
                      onChange={(e) => updateEditField('type', e.target.value as MaintenanceType)}
                      className="w-full mt-1 h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      {MAINTENANCE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Дата *</Label>
                    <Input
                      type="date"
                      value={editData.date}
                      onChange={(e) => updateEditField('date', e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Моточасы</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editData.hours}
                      onChange={(e) => updateEditField('hours', e.target.value)}
                      placeholder="Например: 1250.5"
                      className="mt-1 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Описание работ *</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => updateEditField('description', e.target.value)}
                      placeholder="Что было сделано..."
                      rows={3}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Примечания</Label>
                    <Textarea
                      value={editData.notes}
                      onChange={(e) => updateEditField('notes', e.target.value)}
                      placeholder="Дополнительная информация..."
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(record.id)}
                      className="flex-1 h-8 text-xs"
                    >
                      <Save className="mr-1 h-3 w-3" />
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      className="flex-1 h-8 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                // Режим просмотра
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {typeStyle.icon}
                          <span className="text-xs font-medium">
                            {typeStyle.label}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">•</span>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {record.vehicleName}
                        </h3>
                      </div>
                      
                      <div className={`text-sm text-gray-700 mb-2 whitespace-pre-wrap break-words ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {record.description}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.date).toLocaleDateString('ru-RU')}
                        </span>
                        {record.hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.hours} ч
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        className="h-7 text-xs"
                      >
                        {isExpanded ? 'Скрыть' : 'Подробнее'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(record)}
                        className="h-7 w-7 p-0"
                        title="Редактировать"
                      >
                        <EditIcon className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestDelete(record)}
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                        title="Удалить"
                      >
                        <DeleteIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Развернутая информация */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-50 space-y-2">
                      {record.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 text-xs mb-1 flex items-center gap-1">
                            <StickyNote className="h-3 w-3" />
                            Примечания:
                          </h4>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words pl-5">
                            {record.notes}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 pt-1">
                        Создано: {new Date(record.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление записи обслуживания"
        message={`Вы уверены, что хотите удалить запись обслуживания для "${deleteConfirm.record?.vehicleName}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}