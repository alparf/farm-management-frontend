'use client';

import { ProductType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface InventoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: ProductType | '';
  onTypeFilterChange: (type: ProductType | '') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  stockFilter: string;
  onStockFilterChange: (filter: string) => void;
  onGenerateReport?: () => void;
}

export function InventoryFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortChange,
  stockFilter,
  onStockFilterChange,
  onGenerateReport,
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Фильтры склада</CardTitle>
        {onGenerateReport && (
          <Button variant="outline" size="sm" onClick={onGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Отчет
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Фильтр по запасам */}
          <div>
            <Label htmlFor="stock-filter">Статус запасов</Label>
            <select
              id="stock-filter"
              value={stockFilter}
              onChange={(e) => onStockFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Все запасы</option>
              <option value="low">Низкий запас (≤5)</option>
              <option value="out">Нет в наличии</option>
              <option value="normal">Нормальный запас</option>
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