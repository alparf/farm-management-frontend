'use client';

import { useState } from 'react';
import { ChemicalTreatment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

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
      {treatments.map((treatment) => (
        <div
          key={treatment.id}
          className="border border-gray-200 rounded-lg p-4 transition-colors bg-white hover:bg-gray-50 relative"
        >
          {/* Кнопки действий в правом верхнем углу */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {/* Кнопка выполнения/отмены */}
            {!treatment.completed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCompleted(treatment.id)}
                className="h-8 w-8 p-0 hover:bg-green-50 text-gray-500 hover:text-green-600"
                title="Выполнить"
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsPending(treatment.id)}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Отменить выполнение"
              >
                <UndoIcon className="h-4 w-4" />
              </Button>
            )}

            {/* Кнопка редактирования */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedId(expandedId === treatment.id ? null : treatment.id)}
              className="h-8 w-8 p-0 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
              title="Редактировать"
            >
              <EditIcon className="h-4 w-4" />
            </Button>

            {/* Кнопка удаления */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => requestDelete(treatment)}
              className="h-8 w-8 p-0 hover:bg-red-50 text-gray-500 hover:text-red-600"
              title="Удалить"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Основное содержимое */}
          <div className="flex items-start gap-3 pr-10">
            {/* Статус */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
              treatment.completed ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            
            {/* Основная информация */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900 text-base leading-tight">
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
                  <CalendarIcon className="h-3.5 w-3.5" />
                  План: {treatment.dueDate?.toLocaleDateString('ru-RU') || '—'}
                </span>
                {treatment.actualDate && (
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                    Факт: {treatment.actualDate.toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>

              {/* Информация о препаратах */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BeakerIcon className="h-4 w-4" />
                <span>{treatment.chemicalProducts.length} препарата</span>
              </div>
            </div>
          </div>

          {/* Раскрывающаяся детальная информация */}
          {expandedId === treatment.id && (
            <div className="mt-4 pt-4 border-t border-gray-200">
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
                            ? 'bg-yellow-50 border-yellow-200' 
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
      ))}

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

// Иконки
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v0M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}