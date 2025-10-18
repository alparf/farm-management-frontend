'use client';

import { ProductType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: ProductType | '';
  onTypeFilterChange: (type: ProductType | '') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function InventoryFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortChange,
}: InventoryFiltersProps) {
  const productTypes: ProductType[] = [
    'фунгицид',
    'инсектицид', 
    'гербицид',
    'десикант',
    'регулятор роста',
    'удобрение',
    'биопрепарат',
    'адъювант'
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Фильтры склада</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск по названию */}
          <div>
            <Label htmlFor="inventory-search">Поиск по названию</Label>
            <Input
              id="inventory-search"
              placeholder="Название продукта..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Фильтр по типу */}
          <div>
            <Label htmlFor="type-filter">Тип продукта</Label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as ProductType | '')}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все типы</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Сортировка */}
          <div>
            <Label htmlFor="inventory-sort">Сортировка</Label>
            <select
              id="inventory-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="name">По названию</option>
              <option value="quantity">По количеству</option>
              <option value="type">По типу</option>
              <option value="updatedAt">По дате обновления</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}