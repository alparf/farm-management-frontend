'use client';

import { useMemo } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { getCultureIcon, getIconColor } from '@/lib/culture-icons';
import { Sprout } from 'lucide-react';

interface StatsProps {
  treatments: ChemicalTreatment[];
  onCultureClick?: (culture: string) => void;
}

const bgColors = [
  'bg-blue-50 border-blue-200',
  'bg-green-50 border-green-200',
  'bg-purple-50 border-purple-200',
  'bg-yellow-50 border-yellow-200',
  'bg-indigo-50 border-indigo-200',
  'bg-rose-50 border-rose-200',
  'bg-orange-50 border-orange-200',
  'bg-teal-50 border-teal-200',
  'bg-pink-50 border-pink-200',
  'bg-amber-50 border-amber-200',
  'bg-cyan-50 border-cyan-200',
];

export function Stats({ treatments, onCultureClick }: StatsProps) {
  const stats = useMemo(() => {
    const cultureMap = new Map<CultureType, { total: number; completed: number; planned: number }>();

    treatments.forEach(t => {
      const culture = t.culture as CultureType;
      if (!cultureMap.has(culture)) {
        cultureMap.set(culture, { total: 0, completed: 0, planned: 0 });
      }
      const stat = cultureMap.get(culture)!;
      stat.total += 1;
      if (t.completed) {
        stat.completed += 1;
      } else {
        stat.planned += 1;
      }
    });

    return Array.from(cultureMap.entries())
      .map(([culture, data]) => ({
        culture,
        ...data,
        completedPercent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [treatments]);

  const totalTreatments = treatments.length;

  const handleCardClick = (culture: string) => {
    if (onCultureClick) {
      onCultureClick(culture);
    }
  };

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
        <p>Нет данных по обработкам</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
      {/* Карточка "Всего обработок" - первая */}
      <Card 
        className="bg-blue-50 border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          if (onCultureClick) {
            // Сбрасываем фильтр культуры, показываем все
            onCultureClick('');
          }
        }}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 text-blue-600">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">
              Всего
            </span>
            <span className="text-xs font-bold text-gray-500 ml-auto">
              {totalTreatments}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-green-600 font-medium">
                ✓ {treatments.filter(t => t.completed).length}
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-orange-500 font-medium">
                {treatments.filter(t => !t.completed).length}
              </span>
            </div>
            <span className="font-medium text-gray-500">
              {totalTreatments > 0 ? Math.round((treatments.filter(t => t.completed).length / totalTreatments) * 100) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Карточки по культурам */}
      {stats.map((stat, index) => {
        const colorClass = bgColors[(index + 1) % bgColors.length];
        const Icon = getCultureIcon(stat.culture, "h-5 w-5");
        const iconColor = getIconColor(stat.culture);
        
        return (
          <Card 
            key={stat.culture} 
            className={`${colorClass} shadow-sm ${onCultureClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => handleCardClick(stat.culture)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 ${iconColor}`}>
                  {Icon}
                </div>
                <span className="text-sm font-medium text-gray-700 capitalize truncate" title={stat.culture}>
                  {stat.culture}
                </span>
                <span className="text-xs font-bold text-gray-500 ml-auto">
                  {stat.total}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-green-600 font-medium">✓ {stat.completed}</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-orange-500 font-medium">{stat.planned}</span>
                </div>
                <span className="font-medium text-gray-500">
                  {stat.completedPercent}%
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}