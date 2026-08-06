'use client';

import { useMemo } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';

interface ChemicalsUsageStatsProps {
  culture: CultureType;
  treatments: ChemicalTreatment[];
}

export function ChemicalsUsageStats({ culture, treatments }: ChemicalsUsageStatsProps) {
  const usageStats = useMemo(() => {
    const map = new Map<number, {
      productId: number;
      name: string;
      unit: string;
      totalAmount: number;
      treatmentCount: number;
    }>();

    treatments
      .filter(t => t.culture === culture && t.completed === true)
      .forEach(t => {
        t.chemicalProducts.forEach(cp => {
          const product = cp.product;
          if (!product) return;
          const id = product.id;
          const name = product.name;
          const unit = product.unit || cp.unit;
          const amount = cp.ratePerHa * t.area;

          if (map.has(id)) {
            const entry = map.get(id)!;
            entry.totalAmount += amount;
            entry.treatmentCount += 1;
          } else {
            map.set(id, {
              productId: id,
              name,
              unit,
              totalAmount: amount,
              treatmentCount: 1,
            });
          }
        });
      });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [treatments, culture]);

  if (usageStats.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="text-sm font-medium text-gray-700 mb-2">Использованные СЗР</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left text-gray-600">
              <th className="pb-1 pr-4 font-medium">Препарат</th>
              <th className="pb-1 pr-4 font-medium text-right">Расход</th>
              <th className="pb-1 pr-4 font-medium text-right">Ед. изм.</th>
              <th className="pb-1 font-medium text-right">Обработок</th>
            </tr>
          </thead>
          <tbody>
            {usageStats.map(item => (
              <tr key={item.productId} className="border-b border-gray-100 last:border-0">
                <td className="py-1 pr-4">{item.name}</td>
                <td className="py-1 pr-4 text-right font-mono">{item.totalAmount.toFixed(1)}</td>
                <td className="py-1 pr-4 text-right">{item.unit}</td>
                <td className="py-1 text-right">{item.treatmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}