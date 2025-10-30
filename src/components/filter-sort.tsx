'use client';

import { ProductType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FilterSortProps {
  cultureFilter: string;
  onCultureFilterChange: (value: string) => void;
  productTypeFilter: string;
  onProductTypeFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  showCompleted: boolean;
  onShowCompletedChange: (value: boolean) => void;
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
  onShowCompletedChange
}: FilterSortProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Поиск */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium">Поиск препаратов</Label>
          <Input
            id="search"
            placeholder="Название препарата..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Фильтр по культуре */}
        <div>
          <Label htmlFor="culture" className="text-sm font-medium">Культура</Label>
          <select
            id="culture"
            value={cultureFilter}
            onChange={(e) => onCultureFilterChange(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
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
          <Label htmlFor="productType" className="text-sm font-medium">Тип препарата</Label>
          <select
            id="productType"
            value={productTypeFilter}
            onChange={(e) => onProductTypeFilterChange(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Сортировка */}
        <div>
          <Label htmlFor="sort" className="text-sm font-medium">Сортировка</Label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
          >
            <option value="dueDate">По дате обработки</option>
            <option value="createdAt">По дате создания</option>
            <option value="culture">По культуре</option>
            <option value="area">По площади</option>
          </select>
        </div>

        {/* Чекбоксы */}
        <div className="flex items-center space-x-4 pt-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showCompleted"
              checked={showCompleted}
              onChange={(e) => onShowCompletedChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="showCompleted" className="text-sm">
              Показывать выполненные
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}