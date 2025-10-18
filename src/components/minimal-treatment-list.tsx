'use client';

import { ChemicalTreatment } from '@/types';
import { Button } from '@/components/ui/button';

interface MinimalTreatmentListProps {
  treatments: ChemicalTreatment[];
  onUpdateTreatment: (id: number, updates: Partial<ChemicalTreatment>) => Promise<void>;
  onDeleteTreatment: (id: number) => Promise<void>;
}

export function MinimalTreatmentList({ treatments, onUpdateTreatment, onDeleteTreatment }: MinimalTreatmentListProps) {
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

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет созданных обработок
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {treatments.map((treatment) => (
        <div
          key={treatment.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${
            treatment.completed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Статус */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              treatment.completed ? 'bg-green-500' : 'bg-yellow-500'
            }`} />

            {/* Культура и площадь */}
            <span className="font-medium text-gray-900 truncate">
              {treatment.culture}
            </span>
            
            <span className="text-sm text-gray-600 flex-shrink-0">
              {treatment.area} га
            </span>

            {/* Препараты */}
            <span className="text-sm text-gray-500 truncate flex-1">
              {treatment.chemicalProducts.map(p => p.name).join(', ')}
            </span>

            {/* Даты */}
            <div className="text-xs text-gray-500 flex-shrink-0">
              {treatment.dueDate?.toLocaleDateString('ru-RU')}
              {treatment.actualDate && ` → ${treatment.actualDate.toLocaleDateString('ru-RU')}`}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            {!treatment.completed ? (
              <Button
                size="sm"
                onClick={() => toggleCompleted(treatment.id)}
                className="h-7 px-2"
                title="Отметить выполненным"
              >
                ✓
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsPending(treatment.id)}
                className="h-7 px-2"
                title="Вернуть в ожидание"
              >
                ↩
              </Button>
            )}
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteTreatment(treatment.id)}
              className="h-7 px-2"
              title="Удалить"
            >
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}