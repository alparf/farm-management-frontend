'use client';

import { useState } from 'react';
import { ChemicalTreatment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface TreatmentListProps {
  treatments: ChemicalTreatment[];
  onUpdate: (treatments: ChemicalTreatment[]) => void;
}

export function TreatmentList({ treatments, onUpdate }: TreatmentListProps) {
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [completingTreatment, setCompletingTreatment] = useState<number | null>(null);

  const toggleCompleted = (id: number, actualDate?: Date) => {
    const updated = treatments.map(treatment =>
      treatment.id === id 
        ? { 
            ...treatment, 
            completed: !treatment.completed, 
            actualDate: actualDate || (!treatment.completed ? new Date() : undefined)
          }
        : treatment
    );
    onUpdate(updated);
    setCompletingTreatment(null);
  };

  const startCompleteWithDate = (id: number) => {
    setCompletingTreatment(id);
  };

  const cancelCompleteWithDate = () => {
    setCompletingTreatment(null);
  };

  const updateActualDate = (id: number, date: Date | undefined) => {
    const updated = treatments.map(treatment =>
      treatment.id === id 
        ? { ...treatment, actualDate: date }
        : treatment
    );
    onUpdate(updated);
    setEditingDate(null);
  };

  const deleteTreatment = (id: number) => {
    onUpdate(treatments.filter(t => t.id !== id));
  };

  if (treatments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Нет созданных обработок</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {treatments.map((treatment) => (
        <Card key={treatment.id} className={treatment.completed ? 'bg-green-50 border-green-200' : ''}>
          <CardHeader>
            <CardTitle className="flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold">
                    {treatment.culture} - {treatment.area} га
                  </span>
                  {treatment.isTankMix && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                      Баковая смесь
                    </span>
                  )}
                  {treatment.completed && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                      ✓ Выполнено
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                {!treatment.completed && (
                  <>
                    {completingTreatment === treatment.id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex gap-2">
                          <DatePicker 
                            value={treatment.actualDate} 
                            onChange={(date) => date && toggleCompleted(treatment.id, date)}
                          />
                          <Button
                            variant="outline"
                            onClick={cancelCompleteWithDate}
                            className="whitespace-nowrap"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => toggleCompleted(treatment.id)}
                            className="whitespace-nowrap"
                          >
                            Выполнить сегодня
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => startCompleteWithDate(treatment.id)}
                            className="whitespace-nowrap"
                          >
                            Выбрать дату
                          </Button>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => deleteTreatment(treatment.id)}
                          className="whitespace-nowrap"
                        >
                          Удалить
                        </Button>
                      </div>
                    )}
                  </>
                )}
                {treatment.completed && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => toggleCompleted(treatment.id)}
                      className="whitespace-nowrap"
                    >
                      Вернуть в ожидание
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteTreatment(treatment.id)}
                      className="whitespace-nowrap"
                    >
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Препараты:</h4>
                <ul className="space-y-2">
                  {treatment.chemicalProducts.map((product, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {product.dosage} • {product.productType}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="font-medium text-gray-700">Создано:</span>
                    <span className="text-gray-900">{treatment.createdAt.toLocaleDateString('ru-RU')}</span>
                  </div>
                  
                  {treatment.dueDate && (
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="font-medium text-gray-700">Плановая дата:</span>
                      <span className="text-gray-900">{treatment.dueDate.toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  
                  {/* Редактирование фактической даты */}
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="font-medium text-gray-700">Фактическая дата:</span>
                    <div className="flex items-center gap-2">
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
                            className="whitespace-nowrap"
                          >
                            Готово
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`${treatment.actualDate ? 'text-gray-900' : 'text-gray-500'}`}>
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
                              className="whitespace-nowrap"
                            >
                              Изменить
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {treatment.notes && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-1">Примечания:</h5>
                    <p className="text-yellow-700 text-sm">{treatment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}