'use client';

import { Client } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShipmentFiltersProps {
  clients: Client[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  clientFilter: string;
  onClientFilterChange: (clientId: string) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
}

export function ShipmentFilters({
  clients,
  searchQuery,
  onSearchChange,
  clientFilter,
  onClientFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: ShipmentFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Поиск (клиент, примечания)</Label>
          <Input
            id="search"
            placeholder="Клиент, примечания..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="client">Клиент</Label>
          <select
            id="client"
            value={clientFilter}
            onChange={(e) => onClientFilterChange(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Все клиенты</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="dateFrom">Дата от</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dateTo">Дата до</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}