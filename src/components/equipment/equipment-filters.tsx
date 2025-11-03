'use client';

import { EquipmentType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EquipmentFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: EquipmentType | '';
  onTypeFilterChange: (type: EquipmentType | '') => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function EquipmentFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: EquipmentFiltersProps) {
  const equipmentTypes: EquipmentType[] = [
    'весы',
    'ph-метр',
    'термометр',
    'влагоанализатор',
    'анализатор',
    'дозатор',
    'другое'
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Фильтры оборудования</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск по названию */}
          <div>
            <Label htmlFor="equipment-search">Поиск по названию</Label>
            <Input
              id="equipment-search"
              placeholder="Название оборудования..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Фильтр по типу */}
          <div>
            <Label htmlFor="type-filter">Тип оборудования</Label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as EquipmentType | '')}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все типы</option>
              {equipmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по статусу поверки */}
          <div>
            <Label htmlFor="status-filter">Статус поверки</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="expiring">Скоро истекает</option>
              <option value="overdue">Просроченные</option>
            </select>
          </div>

          {/* Сортировка */}
          <div>
            <Label htmlFor="equipment-sort">Сортировка</Label>
            <select
              id="equipment-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="name">По названию</option>
              <option value="verificationDate">По дате поверки</option>
              <option value="type">По типу</option>
              <option value="updatedAt">По дате обновления</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}