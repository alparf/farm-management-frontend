// components/chemicals-usage-stats.tsx
'use client';

import { ChemicalTreatment, CultureType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Droplets, Ruler, Hash } from 'lucide-react';
import { useCultureStats } from '@/hooks/useCultureStats';

interface ChemicalsUsageStatsProps {
  culture: CultureType;
  treatments: ChemicalTreatment[];
}

export function ChemicalsUsageStats({ culture, treatments }: ChemicalsUsageStatsProps) {
  const { getChemicalsUsage } = useCultureStats(treatments);
  const usage = getChemicalsUsage(culture);

  if (usage.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Статистика СЗР за сезон</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-center text-gray-500 py-8">
          Нет данных о применённых препаратах
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Статистика СЗР за сезон</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-gray-500">
              <th className="pb-2 font-medium">Препарат</th>
              <th className="pb-2 font-medium">Тип</th>
              <th className="pb-2 font-medium text-right">Расход, {usage[0]?.unit}</th>
              <th className="pb-2 font-medium text-right">Площадь, га</th>
              <th className="pb-2 font-medium text-right">Обработок</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((item) => (
              <tr key={item.productId} className="border-b last:border-0">
                <td className="py-2 font-medium text-gray-800">{item.productName}</td>
                <td className="py-2 text-gray-600 capitalize">{item.productType}</td>
                <td className="py-2 text-right font-mono">{item.totalAmount.toFixed(1)}</td>
                <td className="py-2 text-right font-mono">{item.totalArea.toFixed(1)}</td>
                <td className="py-2 text-right">{item.treatmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-400 mt-2 text-right">
          Расход = норма (л/га или кг/га) × площадь
        </div>
      </CardContent>
    </Card>
  );
}