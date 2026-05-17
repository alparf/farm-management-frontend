'use client';

import { ChemicalTreatment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, CheckCircle, Clock, CalendarDays } from 'lucide-react';

interface StatsProps {
  treatments: ChemicalTreatment[];
}

export function Stats({ treatments }: StatsProps) {
  const totalArea = treatments.reduce((sum, t) => sum + t.area, 0);
  
  // Площадь выполненных обработок (completed = true)
  const completedArea = treatments
    .filter(t => t.completed === true)
    .reduce((sum, t) => sum + t.area, 0);
  
  // Площадь запланированных обработок (не выполненных)
  const plannedArea = treatments
    .filter(t => t.completed === false)
    .reduce((sum, t) => sum + t.area, 0);
  
  const completedPercent = totalArea > 0 ? Math.round((completedArea / totalArea) * 100) : 0;
  const plannedPercent = totalArea > 0 ? Math.round((plannedArea / totalArea) * 100) : 0;

  // Количество обработок
  const totalCount = treatments.length;
  const completedCount = treatments.filter(t => t.completed === true).length;
  const plannedCount = treatments.filter(t => t.completed === false).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      <Card className="bg-cyan-50 border-cyan-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-600">Общая площадь</p>
              <p className="text-lg font-bold text-cyan-800">{totalArea.toFixed(1)} га</p>
              <p className="text-xs text-cyan-600 mt-0.5">{totalCount} обработок</p>
            </div>
            <MapPin className="h-5 w-5 text-cyan-600 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600">Выполнено по площади</p>
              <p className="text-lg font-bold text-green-800">{completedArea.toFixed(1)} га</p>
              <p className="text-xs text-green-600 mt-0.5">{completedPercent}% ({completedCount} обработок)</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600">Запланировано по площади</p>
              <p className="text-lg font-bold text-orange-800">{plannedArea.toFixed(1)} га</p>
              <p className="text-xs text-orange-600 mt-0.5">{plannedPercent}% ({plannedCount} обработок)</p>
            </div>
            <CalendarDays className="h-5 w-5 text-orange-600 opacity-60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}