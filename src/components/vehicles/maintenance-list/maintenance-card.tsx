import { MaintenanceRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { ButtonIcons } from '@/components/ui-icons';
import { Calendar, Clock, StickyNote, CheckCircle, AlertCircle } from 'lucide-react';
import { MaintenanceCardEdit } from './maintenance-card-edit';

interface MaintenanceCardProps {
  record: MaintenanceRecord;
  isEditing: boolean;
  editData: {
    date: string;
    hours: string;
    description: string;
    notes: string;
    completed: boolean;
  };
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateField: (field: string, value: any) => void;
  onDelete: () => void;
  onComplete: () => void;
  onUncomplete: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function MaintenanceCard({
  record,
  isEditing,
  editData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateField,
  onDelete,
  onComplete,
  onUncomplete,
  isExpanded,
  onToggleExpand,
}: MaintenanceCardProps) {
  const DeleteIcon = ButtonIcons.Delete.icon;
  const EditIcon = ButtonIcons.Edit.icon;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white">
      <div className="p-4">
        {isEditing ? (
          <MaintenanceCardEdit
            editData={editData}
            onUpdateField={onUpdateField}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            {/* Заголовок: иконка + название техники + кнопки */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {record.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                )}
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {record.vehicleName}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {record.completed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUncomplete}
                    className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50 border-orange-200"
                    title="Отменить выполнение"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onComplete}
                    className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 border-green-200"
                    title="Отметить выполненной"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartEdit}
                  className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                  title="Редактировать"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                  title="Удалить"
                >
                  <DeleteIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Статус */}
            <div className="mb-2">
              {record.completed ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Выполнена
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3" />
                  Не выполнена
                </span>
              )}
            </div>

            {/* Дата и моточасы */}
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

            {/* Описание */}
            <div className="bg-gray-50 rounded-lg p-2 mb-3">
              <div className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-2">
                {record.description}
              </div>
            </div>

            {/* Примечания */}
            {record.notes && (
              <div className="flex items-start gap-1.5 text-sm bg-yellow-50 rounded-lg p-2">
                <StickyNote className="h-3.5 w-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-xs line-clamp-2">{record.notes}</span>
              </div>
            )}

            {/* Футер */}
            <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
              Создано: {new Date(record.createdAt).toLocaleDateString('ru-RU')}
              {record.actualDate && (
                <span className="ml-2 text-green-600">
                  • Выполнено: {new Date(record.actualDate).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>

            {/* Кнопка "Подробнее" */}
            {record.description && record.description.split('\n').length > 2 && onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="w-full mt-2 text-center text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
              >
                {isExpanded ? '▲ Скрыть полное описание' : '▼ Показать полное описание'}
              </button>
            )}

            {/* Полное описание */}
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
  );
}