'use client';

import { VehicleType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VehiclesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: VehicleType | '';
  onTypeFilterChange: (type: VehicleType | '') => void;
  insuranceFilter: string;
  onInsuranceFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function VehiclesFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  insuranceFilter,
  onInsuranceFilterChange,
  sortBy,
  onSortChange,
}: VehiclesFiltersProps) {
  const vehicleTypes: VehicleType[] = [
    'трактор',
    'комбайн',
    'грузовой автомобиль',
    'легковой автомобиль',
    'прицеп',
    'сельхозорудие',
    'другая техника'
  ];

  const insuranceFilters = [
    { value: '', label: 'Все' },
    { value: 'with-insurance', label: 'Со страховкой' },
    { value: 'without-insurance', label: 'Без страховки' },
    { value: 'expiring-soon', label: 'Скоро истекает' },
    { value: 'expired', label: 'Просроченные' },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Фильтры техники</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск по названию */}
          <div className="md:col-span-2">
            <Label htmlFor="vehicles-search" className="text-sm">Поиск по названию</Label>
            <Input
              id="vehicles-search"
              placeholder="Введите название техники..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Фильтр по типу */}
          <div>
            <Label htmlFor="type-filter" className="text-sm">Тип техники</Label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as VehicleType | '')}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все типы</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по страховке */}
          <div>
            <Label htmlFor="insurance-filter" className="text-sm">Статус страховки</Label>
            <select
              id="insurance-filter"
              value={insuranceFilter}
              onChange={(e) => onInsuranceFilterChange(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {insuranceFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Сортировка */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vehicles-sort" className="text-sm">Сортировка</Label>
            <select
              id="vehicles-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="name">По названию</option>
              <option value="type">По типу</option>
              <option value="year">По году выпуска</option>
              <option value="insurance">По дате страховки</option>
              <option value="createdAt">По дате добавления</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}