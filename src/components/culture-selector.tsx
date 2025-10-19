'use client';

import { CultureType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CultureSelectorProps {
  cultures: CultureType[];
  selectedCulture: CultureType | '';
  onCultureChange: (culture: CultureType) => void;
  stats: Array<{ culture: CultureType; totalTreatments: number; completedTreatments: number }>;
}

export function CultureSelector({ cultures, selectedCulture, onCultureChange, stats }: CultureSelectorProps) {
  const getCultureStats = (culture: CultureType) => {
    return stats.find(stat => stat.culture === culture) || { totalTreatments: 0, completedTreatments: 0 };
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Выберите культуру для анализа</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cultures.map((culture) => {
            const cultureStat = getCultureStats(culture);
            const isSelected = selectedCulture === culture;
            
            return (
              <button
                key={culture}
                onClick={() => onCultureChange(culture)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 capitalize">
                  {culture}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Обработок: {cultureStat.completedTreatments}/{cultureStat.totalTreatments}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}