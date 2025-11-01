'use client';

import { ChemicalTreatment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

interface StatsProps {
  treatments: ChemicalTreatment[];
}

export function Stats({ treatments }: StatsProps) {
  const total = treatments.length;
  const completed = treatments.filter(t => t.completed).length;
  const pending = total - completed;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Всего обработок</p>
              <p className="text-2xl font-bold text-blue-800">{total}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Выполнено</p>
              <p className="text-2xl font-bold text-green-800">{completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Ожидают</p>
              <p className="text-2xl font-bold text-orange-800">{pending}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600 opacity-60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}