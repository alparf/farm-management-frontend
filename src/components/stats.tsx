'use client';

import { ChemicalTreatment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsProps {
  treatments: ChemicalTreatment[];
}

export function Stats({ treatments }: StatsProps) {
  const totalTreatments = treatments.length;
  const completedTreatments = treatments.filter(t => t.completed).length;
  const pendingTreatments = totalTreatments - completedTreatments;
  
  const totalArea = treatments.reduce((sum, t) => sum + t.area, 0);
  const completedArea = treatments
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.area, 0);

  // Статистика по культурам
  const cultureStats = treatments.reduce((acc, treatment) => {
    const culture = treatment.culture;
    if (!acc[culture]) {
      acc[culture] = { total: 0, completed: 0, area: 0 };
    }
    acc[culture].total++;
    acc[culture].area += treatment.area;
    if (treatment.completed) {
      acc[culture].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; area: number }>);

  // Статистика по типам препаратов
  const productTypeStats = treatments.reduce((acc, treatment) => {
    treatment.chemicalProducts.forEach(product => {
      const type = product.productType;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Всего обработок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTreatments}</div>
          <p className="text-xs text-gray-500">
            {completedTreatments} выполнено, {pendingTreatments} в ожидании
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Общая площадь</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalArea.toFixed(1)} га</div>
          <p className="text-xs text-gray-500">
            {completedArea.toFixed(1)} га обработано
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Процент выполнения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalTreatments > 0 ? Math.round((completedTreatments / totalTreatments) * 100) : 0}%
          </div>
          <p className="text-xs text-gray-500">
            от общего количества
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Баковые смеси</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {treatments.filter(t => t.isTankMix).length}
          </div>
          <p className="text-xs text-gray-500">
            обработок с баковыми смесями
          </p>
        </CardContent>
      </Card>
    </div>
  );
}