'use client';

import { CultureType } from '@/types';
import { getCultureIcon, getCultureTextColor, getIconColor } from '@/lib/culture-icons';
import { CultureStats } from '@/hooks/useCultureStats';

interface CultureSelectorProps {
  cultures: CultureType[];
  selectedCulture: CultureType | '';
  onCultureChange: (culture: CultureType) => void;
  stats: CultureStats[];
}

export function CultureSelector({ cultures, selectedCulture, onCultureChange, stats }: CultureSelectorProps) {
  const getCultureStats = (culture: CultureType) => {
    return stats.find(stat => stat.culture === culture) || { 
      totalTreatments: 0, 
      completedTreatments: 0,
      plannedTreatments: 0,
      lastTreatment: null,
      nextTreatment: null,
      productsUsed: [],
      tankMixCount: 0,
      tankMixTypes: []
    };
  };

  const getCardColor = (culture: CultureType, isSelected: boolean) => {
    if (isSelected) return 'bg-blue-100 border-blue-500 shadow-md';
    
    const colors: Record<CultureType, string> = {
      'яблоко': 'bg-red-50 border-red-200 hover:bg-red-100',
      'груша': 'bg-green-50 border-green-200 hover:bg-green-100',
      'черешня': 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      'слива': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      'томаты': 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      'картофель': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      'лук': 'bg-lime-50 border-lime-200 hover:bg-lime-100',
      'свекла': 'bg-rose-50 border-rose-200 hover:bg-rose-100',
      'морковь': 'bg-amber-50 border-amber-200 hover:bg-amber-100',
      'капуста': 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      'другое': 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    };
    return colors[culture] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  const getPercentCompleted = (cultureStat: any) => {
    if (cultureStat.totalTreatments === 0) return 0;
    return Math.round((cultureStat.completedTreatments / cultureStat.totalTreatments) * 100);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {cultures.map((culture) => {
        const cultureStat = getCultureStats(culture);
        const isSelected = selectedCulture === culture;
        const percentCompleted = getPercentCompleted(cultureStat);
        
        return (
          <button
            key={culture}
            onClick={() => onCultureChange(culture)}
            className={`border-2 rounded-xl p-3 transition-all text-left hover:shadow-lg ${
              getCardColor(culture, isSelected)
            } ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1 shadow-md' : 'shadow-sm'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`${getIconColor(culture)}`}>
                {getCultureIcon(culture, "h-5 w-5")}
              </div>
              <span className={`font-medium text-sm capitalize ${getCultureTextColor(culture)}`}>
                {culture}
              </span>
            </div>
            
            <div className="text-2xl font-bold text-gray-800">
              {cultureStat.totalTreatments}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">
                  {cultureStat.completedTreatments} выполнено
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {percentCompleted}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}