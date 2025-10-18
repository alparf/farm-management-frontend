'use client';

import { useState } from 'react';
import { ChemicalTreatment } from '@/types';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface CompactTreatmentListProps {
  treatments: ChemicalTreatment[];
  onUpdateTreatment: (id: number, updates: Partial<ChemicalTreatment>) => Promise<void>;
  onDeleteTreatment: (id: number) => Promise<void>;
}

export function CompactTreatmentList({ treatments, onUpdateTreatment, onDeleteTreatment }: CompactTreatmentListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<number | null>(null);

  const toggleCompleted = async (id: number) => {
    await onUpdateTreatment(id, {
      completed: true,
      actualDate: new Date()
    });
  };

  const markAsPending = async (id: number) => {
    await onUpdateTreatment(id, {
      completed: false,
      actualDate: undefined
    });
  };

  const updateActualDate = async (id: number, date: Date | undefined) => {
    await onUpdateTreatment(id, { actualDate: date });
    setEditingDate(null);
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        Нет созданных обработок
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {treatments.map((treatment) => (
        <div
          key={treatment.id}
          className={`border rounded-lg p-3 transition-colors ${
            treatment.completed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          {/* Основная строка */}
          <div className="flex items-center gap-4">
            {/* Статус */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              treatment.completed ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            
            {/* Основная информация */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-1">
                <span className="font-semibold text-gray-900 text-sm">
                  {treatment.culture}
                </span>
                <span className="text-sm text-gray-600">
                  {treatment.area} га
                </span>
                {treatment.isTankMix && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Баковая смесь
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {treatment.chemicalProducts.length} препарата
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>План: {treatment.dueDate?.toLocaleDateString('ru-RU') || '—'}</span>
                {treatment.actualDate && (
                  <span>Факт: {treatment.actualDate.toLocaleDateString('ru-RU')}</span>
                )}
                <span>Создано: {treatment.createdAt.toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!treatment.completed ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => toggleCompleted(treatment.id)}
                    className="h-8 px-3"
                  >
                    Выполнить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === treatment.id ? null : treatment.id)}
                    className="h-8 px-3"
                  >
                    ⋯
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsPending(treatment.id)}
                    className="h-8 px-3"
                  >
                    Отменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === treatment.id ? null : treatment.id)}
                    className="h-8 px-3"
                  >
                    ⋯
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Раскрывающаяся детальная информация */}
          {expandedId === treatment.id && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Препараты */}
                <div>
                  <h5 className="font-medium text-sm text-gray-900 mb-3">Препараты:</h5>
                  <div className="space-y-2">
                    {treatment.chemicalProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-800">{product.name}</span>
                          <span className="text-gray-600 ml-2">({product.productType})</span>
                        </div>
                        <span className="text-gray-700 font-medium">{product.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Управление */}
                <div className="space-y-4">
                  {/* Редактирование даты */}
                  <div>
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Фактическая дата:</h5>
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
                      <div className="flex items-center gap-3">
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

                  {/* Примечания */}
                  {treatment.notes && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-900 mb-1">Примечания:</h5>
                      <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                        {treatment.notes}
                      </p>
                    </div>
                  )}

                  {/* Кнопка удаления */}
                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteTreatment(treatment.id)}
                    >
                      Удалить обработку
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}