'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Vehicle } from '@/types';

interface MaintenanceFiltersProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onGenerateReport?: () => void;
}

export function MaintenanceFilters({
  vehicles,
  selectedVehicleId,
  onVehicleChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onGenerateReport,
}: MaintenanceFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Фильтры заявок на ремонт</CardTitle>
        {onGenerateReport && (
          <Button variant="outline" size="sm" onClick={onGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Отчет
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="vehicle-select">Техника</Label>
            <select
              id="vehicle-select"
              value={selectedVehicleId}
              onChange={(e) => onVehicleChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Все единицы</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.vin ? `(${v.vin})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="status-filter">Статус заявки</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Все заявки</option>
              <option value="completed">Выполненные</option>
              <option value="pending">Не выполненные</option>
            </select>
          </div>

          <div>
            <Label htmlFor="search">Поиск (описание/примечания)</Label>
            <Input
              id="search"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="sort">Сортировка</Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="dateDesc">По дате (новые сначала)</option>
              <option value="dateAsc">По дате (старые сначала)</option>
              <option value="vehicle">По технике</option>
              <option value="status">По статусу (невыполненные сначала)</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}