'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterSortProps {
  cultureFilter: string;
  onCultureFilterChange: (culture: string) => void;
  productTypeFilter: string;
  onProductTypeFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
}

export function FilterSort({
  cultureFilter,
  onCultureFilterChange,
  productTypeFilter,
  onProductTypeFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showCompleted,
  onShowCompletedChange,
}: FilterSortProps) {
  const cultures = ['груша', 'яблоко', 'черешня', 'слива', 'томаты', 'картофель', 'лук', 'свекла', 'морковь', 'капуста', 'другое'];
  const productTypes = ['фунгицид', 'инсектицид', 'гербицид', 'десикант', 'регулятор роста'];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Фильтры и сортировка</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск по препаратам */}
          <div>
            <Label htmlFor="search">Поиск по препаратам</Label>
            <Input
              id="search"
              placeholder="Название препарата..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Фильтр по культуре */}
          <div>
            <Label htmlFor="culture-filter">Культура</Label>
            <select
              id="culture-filter"
              value={cultureFilter}
              onChange={(e) => onCultureFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все культуры</option>
              {cultures.map((culture) => (
                <option key={culture} value={culture}>
                  {culture}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по типу продукта */}
          <div>
            <Label htmlFor="product-type-filter">Тип СЗР</Label>
            <select
              id="product-type-filter"
              value={productTypeFilter}
              onChange={(e) => onProductTypeFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все типы</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Сортировка */}
          <div>
            <Label htmlFor="sort">Сортировка</Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="dueDate">По дате обработки</option>
              <option value="createdAt">По дате создания</option>
              <option value="culture">По культуре</option>
              <option value="area">По площади</option>
            </select>
          </div>
        </div>

        {/* Чекбокс для завершенных обработок */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Показывать завершенные обработки</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}