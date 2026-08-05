'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ClientFilters({ searchQuery, onSearchChange }: ClientFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div>
        <Label htmlFor="search">Поиск по названию</Label>
        <Input
          id="search"
          placeholder="Название клиента..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}