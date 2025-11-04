'use client';

import { VehicleType, Vehicle } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MaintenanceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vehicleTypeFilter: VehicleType | '';
  onVehicleTypeFilterChange: (type: VehicleType | '') => void;
  serviceTypeFilter: string;
  onServiceTypeFilterChange: (type: string) => void;
  vehicles: Vehicle[];
}

export function MaintenanceFilters({
  searchQuery,
  onSearchChange,
  vehicleTypeFilter,
  onVehicleTypeFilterChange,
  serviceTypeFilter,
  onServiceTypeFilterChange,
  vehicles
}: MaintenanceFiltersProps) {
  const vehicleTypes: VehicleType[] = [
    'трактор',
    'комбайн',
    'грузовой автомобиль',
    'легковой автомобиль',
    'прицеп',
    'сельхозорудие',
    'другая техника'
  ];

  const serviceTypes = [
    { value: '', label: 'Все типы' },
    { value: 'плановое ТО', label: 'Плановое ТО' },
    { value: 'замена масла', label: 'Замена масла' },
    { value: 'сезонное обслуживание', label: 'Сезонное обслуживание' },
    { value: 'внеплановый ремонт', label: 'Внеплановый ремонт' },
    { value: 'диагностика', label: 'Диагностика' },
    { value: 'другое', label: 'Другое' },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Фильтры обслуживания</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск по названию техники или описанию */}
          <div>
            <Label htmlFor="maintenance-search" className="text-sm">Поиск</Label>
            <Input
              id="maintenance-search"
              placeholder="Поиск по технике или описанию..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Фильтр по типу техники */}
          <div>
            <Label htmlFor="vehicle-type-filter" className="text-sm">Тип техники</Label>
            <select
              id="vehicle-type-filter"
              value={vehicleTypeFilter}
              onChange={(e) => onVehicleTypeFilterChange(e.target.value as VehicleType | '')}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Все типы техники</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по типу обслуживания */}
          <div>
            <Label htmlFor="service-type-filter" className="text-sm">Тип обслуживания</Label>
            <select
              id="service-type-filter"
              value={serviceTypeFilter}
              onChange={(e) => onServiceTypeFilterChange(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}