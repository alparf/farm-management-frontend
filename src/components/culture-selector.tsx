'use client';

import { CultureType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCultureIcon, getCultureColor, getCultureTextColor, getIconColor } from '@/lib/culture-icons';

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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Выберите культуру для анализа</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2">
          {cultures.map((culture) => {
            const cultureStat = getCultureStats(culture);
            const isSelected = selectedCulture === culture;
            
            return (
              <button
                key={culture}
                onClick={() => onCultureChange(culture)}
                className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center text-center min-h-[70px] justify-between ${getCultureColor(culture, isSelected)}`}
              >
                <div className={`${getIconColor(culture)} mb-1`}>
                  {getCultureIcon(culture)}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className={`font-medium text-xs capitalize mb-1 ${getCultureTextColor(culture)}`}>
                    {culture}
                  </div>
                  
                  {/* Статистика */}
                  <div className="text-[10px] text-gray-600 leading-tight">
                    {cultureStat.completedTreatments}/{cultureStat.totalTreatments}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}