import React, { useState } from 'react';
import { MaintenanceRecord, MaintenanceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons } from '@/components/ui-icons';
import { Calendar, Clock, FileText, StickyNote, Save, X, Wrench, AlertTriangle } from 'lucide-react';

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

  const getTypeIcon = (type: string) => {
    if (type === 'Плановое ТО') {
      return <Wrench className="h-5 w-5 text-green-600" />;
    }
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  if (maintenance.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Записей обслуживания нет</p>
        <p className="text-sm mt-1">Нажмите "Новая запись" чтобы добавить</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {maintenance.map((record) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          const EditIcon = ButtonIcons.Edit.icon;
          const isExpanded = expandedId === record.id;
          const isEditing = editingId === record.id;
          
          return (
            <div
              key={record.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white"
            >
              <div className="p-4">
                {/* Содержимое */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 mt-0.5">
                    {getTypeIcon(record.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600">Тип обслуживания</Label>
                          <select
                            value={editData.type}
                            onChange={(e) => updateEditField('type', e.target.value as MaintenanceType)}
                            className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Плановое ТО">🔧 Плановое ТО</option>
                            <option value="Внеплановый ремонт">⚠️ Внеплановый ремонт</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Дата</Label>
                          <Input
                            type="date"
                            value={editData.date}
                            onChange={(e) => updateEditField('date', e.target.value)}
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Моточасы</Label>
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
                          <Label className="text-xs text-gray-600">Описание работ</Label>
                          <Textarea
                            value={editData.description}
                            onChange={(e) => updateEditField('description', e.target.value)}
                            placeholder="Что было сделано..."
                            rows={3}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Примечания</Label>
                          <Textarea
                            value={editData.notes}
                            onChange={(e) => updateEditField('notes', e.target.value)}
                            placeholder="Дополнительная информация..."
                            rows={2}
                            className="mt-1 text-sm"
                          />
                        </div>
                        
                        {/* Кнопки сохранения/отмены при редактировании */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveEdit(record.id)}
                            className="h-8 px-3 text-green-600 hover:bg-green-50"
                          >
                            <Save className="h-3.5 w-3.5 mr-1" />
                            Сохранить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            className="h-8 px-3 text-gray-500 hover:bg-gray-100"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Заголовок с названием и кнопками в одной строке */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {record.vehicleName}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(record)}
                              className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                              title="Редактировать"
                            >
                              <EditIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requestDelete(record)}
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                              title="Удалить"
                            >
                              <DeleteIcon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(record.date).toLocaleDateString('ru-RU')}
                          </span>
                          {record.hours && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {record.hours} ч
                            </span>
                          )}
                        </div>

                        {/* Описание работ */}
                        <div className="bg-gray-50 rounded-lg p-2 mb-3">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-2">
                            {record.description}
                          </div>
                        </div>

                        {/* Примечания (если есть) */}
                        {record.notes && (
                          <div className="flex items-start gap-1.5 text-sm bg-yellow-50 rounded-lg p-2">
                            <StickyNote className="h-3.5 w-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 text-xs line-clamp-2">{record.notes}</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                          Создано: {new Date(record.createdAt).toLocaleDateString('ru-RU')}
                        </div>

                        {/* Кнопка "Подробнее" для режима просмотра */}
                        {record.description && record.description.split('\n').length > 2 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : record.id)}
                            className="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
                          >
                            {isExpanded ? '▲ Скрыть полное описание' : '▼ Показать полное описание'}
                          </button>
                        )}

                        {/* Полное описание (если раскрыто) */}
                        {isExpanded && record.description && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words bg-gray-50 rounded-lg p-3">
                              {record.description}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
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

export default MaintenanceList;