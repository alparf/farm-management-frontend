import { Wrench } from 'lucide-react';

export function MaintenanceEmptyState() {
  return (
    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
      <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p>Заявок на ремонт нет</p>
      <p className="text-sm mt-1">Нажмите "Новая заявка" чтобы добавить</p>
    </div>
  );
}