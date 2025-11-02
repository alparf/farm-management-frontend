import { Apple, Carrot, Cherry, Grape, Leaf, Sprout, Citrus, Trees, Flower, Cloud } from 'lucide-react';
import { CultureType } from '@/types';
import React from 'react';

// Иконки для культур
export const CultureIcons: Record<CultureType, React.ComponentType<{ className?: string }>> = {
  'яблоко': Apple,
  'груша': Citrus,
  'черешня': Cherry,
  'слива': Grape,
  'томаты': Flower, 
  'картофель': Flower,
  'лук': Sprout,
  'свекла': Carrot,
  'морковь': Carrot,
  'капуста': Leaf,
  'другое': Trees
};

// Цвета фона для культур
export const getCultureColor = (culture: CultureType, isSelected: boolean): string => {
  const colors: Record<CultureType, string> = {
    'яблоко': isSelected ? 'bg-red-100 border-red-500 shadow-sm' : 'bg-red-50 border-red-200 hover:bg-red-100',
    'груша': isSelected ? 'bg-green-100 border-green-500 shadow-sm' : 'bg-green-50 border-green-200 hover:bg-green-100',
    'черешня': isSelected ? 'bg-pink-100 border-pink-500 shadow-sm' : 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    'слива': isSelected ? 'bg-purple-100 border-purple-500 shadow-sm' : 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    'томаты': isSelected ? 'bg-orange-100 border-orange-500 shadow-sm' : 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    'картофель': isSelected ? 'bg-yellow-100 border-yellow-500 shadow-sm' : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    'лук': isSelected ? 'bg-lime-100 border-lime-500 shadow-sm' : 'bg-lime-50 border-lime-200 hover:bg-lime-100',
    'свекла': isSelected ? 'bg-rose-100 border-rose-500 shadow-sm' : 'bg-rose-50 border-rose-200 hover:bg-rose-100',
    'морковь': isSelected ? 'bg-amber-100 border-amber-500 shadow-sm' : 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    'капуста': isSelected ? 'bg-emerald-100 border-emerald-500 shadow-sm' : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    'другое': isSelected ? 'bg-gray-100 border-gray-500 shadow-sm' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };
  return colors[culture];
};

// Цвета текста для культур
export const getCultureTextColor = (culture: CultureType): string => {
  const colors: Record<CultureType, string> = {
    'яблоко': 'text-red-800',
    'груша': 'text-green-800',
    'черешня': 'text-pink-800',
    'слива': 'text-purple-800',
    'томаты': 'text-orange-800',
    'картофель': 'text-yellow-800',
    'лук': 'text-lime-800',
    'свекла': 'text-rose-800',
    'морковь': 'text-amber-800',
    'капуста': 'text-emerald-800',
    'другое': 'text-gray-800'
  };
  return colors[culture];
};

// Цвета иконок для культур
export const getIconColor = (culture: CultureType): string => {
  const colors: Record<CultureType, string> = {
    'яблоко': 'text-red-600',
    'груша': 'text-green-600',
    'черешня': 'text-pink-600',
    'слива': 'text-purple-600',
    'томаты': 'text-orange-600',
    'картофель': 'text-yellow-600',
    'лук': 'text-lime-600',
    'свекла': 'text-rose-600',
    'морковь': 'text-amber-600',
    'капуста': 'text-emerald-600',
    'другое': 'text-gray-600'
  };
  return colors[culture];
};

// Получить иконку для культуры (как компонент)
export const getCultureIcon = (culture: CultureType, className: string = "h-4 w-4"): React.ReactNode => {
  const IconComponent = CultureIcons[culture] || Sprout;
  return React.createElement(IconComponent, { className });
};