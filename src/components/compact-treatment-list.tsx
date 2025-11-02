'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons, ButtonSizes, CustomIcons } from '@/components/ui-icons';
import { getCultureIcon, getIconColor, getCultureTextColor } from '@/lib/culture-icons';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface CompactTreatmentListProps {
  treatments: ChemicalTreatment[];
  onUpdateTreatment: (id: number, updates: Partial<ChemicalTreatment>) => Promise<void>;
  onDeleteTreatment: (id: number) => Promise<void>;
}

export function CompactTreatmentList({ treatments, onUpdateTreatment, onDeleteTreatment }: CompactTreatmentListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; treatment: ChemicalTreatment | null }>({
    isOpen: false,
    treatment: null
  });

  // Функция для получения стилей карточки - убрали цвет фона
  const getCardStyle = (completed: boolean) => {
    return 'bg-white border-gray-200 hover:bg-gray-50';
  };

  const markAsPending = async (id: number) => {
    await onUpdateTreatment(id, {
      completed: false,
      actualDate: undefined
    });
  };

  const toggleCompleted = async (id: number) => {
    const treatment = treatments.find(t => t.id === id);
    if (treatment) {
      await onUpdateTreatment(id, {
        completed: !treatment.completed,
        actualDate: !treatment.completed ? new Date() : undefined
      });
    }
  };

  const updateActualDate = async (id: number, date: Date | undefined) => {
    await onUpdateTreatment(id, { actualDate: date });
    setEditingDate(null);
  };

  const startEditNotes = (treatment: ChemicalTreatment) => {
    setEditingNotes(treatment.id);
    setEditNotesText(treatment.notes || '');
  };

  const saveNotes = async (id: number) => {
    await onUpdateTreatment(id, { notes: editNotesText || undefined });
    setEditingNotes(null);
    setEditNotesText('');
  };

  const cancelEditNotes = () => {
    setEditingNotes(null);
    setEditNotesText('');
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        Нет созданных обработок
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {treatments.map((treatment) => {
        const EditIcon = ButtonIcons.Edit.icon;
        const DeleteIcon = ButtonIcons.Delete.icon;
        const CheckIcon = ButtonIcons.Check.icon;
        const UndoIcon = ButtonIcons.Undo.icon;
        const BeakerIcon = CustomIcons.BeakerIcon;
        const culture = treatment.culture as CultureType;

        return (
          <div
            key={treatment.id}
            className={`border rounded-lg p-4 transition-colors relative ${getCardStyle(treatment.completed)}`}
          >
            {/* Кнопки действий в правом верхнем углу */}
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {/* Кнопка выполнения/отмены */}
              {!treatment.completed ? (
                <Button
                  variant={ButtonIcons.Check.variant}
                  size="sm"
                  onClick={() => toggleCompleted(treatment.id)}
                  className={`${ButtonSizes.sm} ${ButtonIcons.Check.style}`}
                  title={ButtonIcons.Check.title}
                >
                  <CheckIcon className={ButtonIcons.Check.className} />
                </Button>
              ) : (
                <Button
                  variant={ButtonIcons.Undo.variant}
                  size="sm"
                  onClick={() => markAsPending(treatment.id)}
                  className={`${ButtonSizes.sm} ${ButtonIcons.Undo.style}`}
                  title={ButtonIcons.Undo.title}
                >
                  <UndoIcon className={ButtonIcons.Undo.className} />
                </Button>
              )}

              {/* Кнопка редактирования */}
              <Button
                variant={ButtonIcons.Edit.variant}
                size="sm"
                onClick={() => setExpandedId(expandedId === treatment.id ? null : treatment.id)}
                className={`${ButtonSizes.sm} hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300`}
                title={ButtonIcons.Edit.title}
              >
                <EditIcon className={ButtonIcons.Edit.className} />
              </Button>

              {/* Кнопка удаления */}
              <Button
                variant={ButtonIcons.Delete.variant}
                size="sm"
                onClick={() => requestDelete(treatment)}
                className={`${ButtonSizes.sm} ${ButtonIcons.Delete.style} border-red-200 hover:border-red-300`}
                title={ButtonIcons.Delete.title}
              >
                <DeleteIcon className={ButtonIcons.Delete.className} />
              </Button>
            </div>

            {/* Основное содержимое */}
            <div className="flex items-start gap-3 pr-16">
              {/* Иконка культуры */}
              <div className={`flex-shrink-0 mt-0.5 ${getIconColor(culture)}`}>
                {getCultureIcon(culture)}
              </div>
              
              {/* Основная информация */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`font-semibold text-base leading-tight ${getCultureTextColor(culture)}`}>
                    {treatment.culture}
                  </span>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {treatment.area} га
                  </span>
                  {treatment.isTankMix && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Баковая смесь
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    План: {treatment.dueDate?.toLocaleDateString('ru-RU') || '—'}
                  </span>
                  {treatment.actualDate && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      Факт: {treatment.actualDate.toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>

                {/* Статус */}
                <div className="flex items-center gap-2 text-sm">
                  {treatment.completed ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Выполнено</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Clock className="h-4 w-4" />
                      <span>Ожидает выполнения</span>
                    </div>
                  )}
                </div>

                {/* Информация о препаратах */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <BeakerIcon className="h-4 w-4" />
                  <span>{treatment.chemicalProducts.length} препарата</span>
                </div>
              </div>
            </div>

            {/* Раскрывающаяся детальная информация */}
            {expandedId === treatment.id && (
              <div className="mt-4 pt-4 border-t border-gray-300 border-opacity-50">
                <div className="space-y-4">
                  {/* Препараты */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Препараты:</h5>
                    <div className="space-y-2">
                      {treatment.chemicalProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-800">{product.name}</span>
                            <span className="text-gray-600 ml-2">({product.productType})</span>
                          </div>
                          <span className="text-gray-700 font-medium ml-2 flex-shrink-0">{product.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Управление */}
                  <div className="space-y-4">
                    {/* Редактирование даты */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Фактическая дата:</h5>
                      {editingDate === treatment.id ? (
                        <div className="flex items-center gap-2">
                          <DatePicker 
                            value={treatment.actualDate} 
                            onChange={(date) => updateActualDate(treatment.id, date)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingDate(null)}
                          >
                            ✓
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={treatment.actualDate ? 'text-gray-900' : 'text-gray-500'}>
                            {treatment.actualDate 
                              ? treatment.actualDate.toLocaleDateString('ru-RU')
                              : 'Не указана'
                            }
                          </span>
                          {treatment.completed && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingDate(treatment.id)}
                            >
                              Изменить дату
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Редактирование примечаний */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Примечания:</h5>
                      {editingNotes === treatment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editNotesText}
                            onChange={(e) => setEditNotesText(e.target.value)}
                            placeholder="Введите примечания..."
                            rows={3}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveNotes(treatment.id)}
                            >
                              Сохранить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditNotes}
                            >
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <div className={`flex-1 p-3 rounded border text-sm ${
                            treatment.notes 
                              ? 'bg-gray-50 border-gray-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <p className="text-gray-700">
                              {treatment.notes || 'Примечания отсутствуют'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startEditNotes(treatment)}
                          >
                            {treatment.notes ? 'Изменить' : 'Добавить'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Диалог подтверждения удаления обработки */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление обработки"
        message={`Вы уверены, что хотите удалить обработку для "${deleteConfirm.treatment?.culture}"? Это действие нельзя отменить.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </div>
  );
}