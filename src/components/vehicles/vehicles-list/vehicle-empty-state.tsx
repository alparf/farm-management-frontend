import { Car } from 'lucide-react';

export function VehicleEmptyState() {
  return (
    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
      <Car className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p>Техника не добавлена</p>
      <p className="text-sm mt-1">Нажмите "Добавить технику" чтобы начать</p>
    </div>
  );
}