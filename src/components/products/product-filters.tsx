'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProductFilters({ searchQuery, onSearchChange }: ProductFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div>
        <Label htmlFor="search">Поиск по названию</Label>
        <Input
          id="search"
          placeholder="Название товара..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}