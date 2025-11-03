import { useState } from 'react';
import { MaintenanceRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons } from '@/components/ui-icons';

interface MaintenanceListProps {
  maintenance: MaintenanceRecord[];
  onUpdateMaintenance: (id: number, updates: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord | void>;
  onDeleteMaintenance: (id: number) => Promise<void>;
}

export function MaintenanceList({ maintenance, onUpdateMaintenance, onDeleteMaintenance }: MaintenanceListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; record: MaintenanceRecord | null }>({
    isOpen: false,
    record: null
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'плановое ТО': 'bg-green-100 text-green-800 border-green-200',
      'замена масла': 'bg-blue-100 text-blue-800 border-blue-200',
      'сезонное обслуживание': 'bg-orange-100 text-orange-800 border-orange-200',
      'внеплановый ремонт': 'bg-red-100 text-red-800 border-red-200',
      'диагностика': 'bg-purple-100 text-purple-800 border-purple-200',
      'другое': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="space-y-4">
        {maintenance.map((record) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          
          return (
            <div
              key={record.id}
              className={`border rounded-lg p-4 transition-colors ${getTypeColor(record.type)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {record.vehicleName}
                    </h3>
                    <span className="text-sm px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {record.type}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    {record.description}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Дата: {record.date.toLocaleDateString('ru-RU')}</span>
                    {record.hours && (
                      <span>Моточасы: {record.hours}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                    className="h-8 text-xs"
                  >
                    {expandedId === record.id ? 'Скрыть' : 'Подробнее'}
                  </Button>
                  <Button
                    variant={ButtonIcons.Delete.variant}
                    size="sm"
                    onClick={() => requestDelete(record)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    title={ButtonIcons.Delete.title}
                  >
                    <DeleteIcon className={ButtonIcons.Delete.className} />
                  </Button>
                </div>
              </div>

              {expandedId === record.id && (
                <div className="mt-4 pt-4 border-t border-gray-300 border-opacity-50">
                  {record.notes && (
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">Примечания:</h4>
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Создано: {record.createdAt.toLocaleDateString('ru-RU')}
                  </div>
                </div>
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