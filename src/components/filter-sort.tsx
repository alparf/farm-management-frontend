'use client';

import { CultureType, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
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
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Фильтры и сортировка</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Поиск */}
          <div>
            <Label htmlFor="search">Поиск по названию</Label>
            <Input
              id="search"
              placeholder="Название препарата..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Фильтр по культуре */}
          <div>
            <Label htmlFor="culture">Культура</Label>
            <select
              id="culture"
              value={cultureFilter}
              onChange={(e) => onCultureFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все культуры</option>
              <option value="яблоко">Яблоко</option>
              <option value="груша">Груша</option>
              <option value="черешня">Черешня</option>
              <option value="слива">Слива</option>
              <option value="томаты">Томаты</option>
              <option value="картофель">Картофель</option>
              <option value="лук">Лук</option>
              <option value="свекла">Свекла</option>
              <option value="морковь">Морковь</option>
              <option value="капуста">Капуста</option>
              <option value="другое">Другое</option>
            </select>
          </div>

          {/* Фильтр по типу препарата */}
          <div>
            <Label htmlFor="productType">Тип препарата</Label>
            <select
              id="productType"
              value={productTypeFilter}
              onChange={(e) => onProductTypeFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все типы</option>
              <option value="фунгицид">Фунгицид</option>
              <option value="инсектицид">Инсектицид</option>
              <option value="гербицид">Гербицид</option>
              <option value="десикант">Десикант</option>
              <option value="регулятор роста">Регулятор роста</option>
              <option value="удобрение">Удобрение</option>
              <option value="биопрепарат">Биопрепарат</option>
              <option value="адъювант">Адъювант</option>
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

          {/* Переключатель выполненных */}
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="showCompleted"
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="showCompleted">Только выполненные</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}