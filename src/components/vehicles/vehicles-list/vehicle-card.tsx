import { Vehicle, VehicleType } from '@/types';
import { Button } from '@/components/ui/button';
import { ButtonIcons } from '@/components/ui-icons';
import {
  Car,
  FileText,
  Shield,
  Route,
  Tractor,
  Truck,
  Combine,
  Wrench,
  Settings,
  CircleAlert
} from 'lucide-react';
import { VehicleCardEdit } from './vehicle-card-edit';

interface VehicleCardProps {
  vehicle: Vehicle;
  isEditing: boolean;
  editData: {
    name: string;
    type: VehicleType;
    model: string;
    year: string;
    vin: string;
    insuranceDate?: Date;
    roadLegalUntil?: Date;
    notes: string;
  };
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateField: (field: string, value: any) => void;
  onDelete: () => void;
}

const isDateExpired = (date?: Date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const isDateExpiringSoon = (date?: Date, daysThreshold: number = 30) => {
  if (!date) return false;
  const today = new Date();
  const timeDiff = new Date(date).getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff > 0 && daysDiff <= daysThreshold;
};

const formatDate = (date?: Date) => {
  if (!date) return null;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getTypeIcon = (type: VehicleType) => {
  const icons: Record<VehicleType, { icon: React.ReactNode; color: string }> = {
    'трактор': { icon: <Tractor className="h-4 w-4" />, color: 'text-orange-500' },
    'комбайн': { icon: <Combine className="h-4 w-4" />, color: 'text-amber-600' },
    'грузовой автомобиль': { icon: <Truck className="h-4 w-4" />, color: 'text-blue-500' },
    'легковой автомобиль': { icon: <Car className="h-4 w-4" />, color: 'text-cyan-500' },
    'прицеп': { icon: <Truck className="h-4 w-4" />, color: 'text-gray-500' },
    'сельхозорудие': { icon: <Wrench className="h-4 w-4" />, color: 'text-green-600' },
    'другая техника': { icon: <Settings className="h-4 w-4" />, color: 'text-purple-500' },
  };
  return icons[type] || { icon: <Settings className="h-4 w-4" />, color: 'text-gray-500' };
};

const getTypeLabel = (type: VehicleType) => {
  const labels: Record<VehicleType, string> = {
    'трактор': 'Трактор',
    'комбайн': 'Комбайн',
    'грузовой автомобиль': 'Грузовой автомобиль',
    'легковой автомобиль': 'Легковой автомобиль',
    'прицеп': 'Прицеп',
    'сельхозорудие': 'Сельхозорудие',
    'другая техника': 'Другая техника',
  };
  return labels[type] || type;
};

export function VehicleCard({
  vehicle,
  isEditing,
  editData,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateField,
  onDelete,
}: VehicleCardProps) {
  const DeleteIcon = ButtonIcons.Delete.icon;
  const EditIcon = ButtonIcons.Edit.icon;
  const typeIcon = getTypeIcon(vehicle.type);
  
  const isInsuranceExpired = isDateExpired(vehicle.insuranceDate);
  const isRoadLegalExpired = isDateExpired(vehicle.roadLegalUntil);
  const isInsuranceExpiringSoon = isDateExpiringSoon(vehicle.insuranceDate);
  const isRoadLegalExpiringSoon = isDateExpiringSoon(vehicle.roadLegalUntil);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white">
      <div className="p-4">
        {isEditing ? (
          <VehicleCardEdit
            editData={editData}
            onUpdateField={onUpdateField}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base text-gray-900 truncate">
                {vehicle.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartEdit}
                  className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                  title="Редактировать"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                  title="Удалить"
                >
                  <DeleteIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-3">
              <div className={`flex-shrink-0 ${typeIcon.color}`}>
                {typeIcon.icon}
              </div>
              <span className="text-xs text-gray-500 capitalize">
                {getTypeLabel(vehicle.type)}
              </span>
            </div>

            <div className="space-y-1.5 mb-3">
              {vehicle.insuranceDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Shield className="h-3.5 w-3.5" />
                    Страховка:
                  </span>
                  <span className={`text-xs flex items-center gap-1.5 ${
                    isInsuranceExpired 
                      ? 'text-red-600 font-medium' 
                      : isInsuranceExpiringSoon 
                        ? 'text-yellow-600' 
                        : 'text-gray-700'
                  }`}>
                    {/* ИКОНКА СЛЕВА ОТ ДАТЫ */}
                    {isInsuranceExpired && (
                      <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    {isInsuranceExpiringSoon && !isInsuranceExpired && (
                      <CircleAlert className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                    {formatDate(vehicle.insuranceDate)}
                  </span>
                </div>
              )}
              
              {vehicle.roadLegalUntil && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Route className="h-3.5 w-3.5" />
                    Допуск:
                  </span>
                  <span className={`text-xs flex items-center gap-1.5 ${
                    isRoadLegalExpired 
                      ? 'text-red-600 font-medium' 
                      : isRoadLegalExpiringSoon 
                        ? 'text-yellow-600' 
                        : 'text-gray-700'
                  }`}>
                    {/* ИКОНКА СЛЕВА ОТ ДАТЫ */}
                    {isRoadLegalExpired && (
                      <CircleAlert className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    {isRoadLegalExpiringSoon && !isRoadLegalExpired && (
                      <CircleAlert className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                    {formatDate(vehicle.roadLegalUntil)}
                  </span>
                </div>
              )}
            </div>

            {(vehicle.model || vehicle.year || vehicle.vin) && (
              <div className="bg-gray-50 rounded-lg p-2 space-y-1 text-sm mb-3">
                {vehicle.model && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-14 text-xs">Модель:</span>
                    <span className="text-gray-700 text-xs truncate">{vehicle.model}</span>
                  </div>
                )}
                {vehicle.year && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-14 text-xs">Год:</span>
                    <span className="text-gray-700 text-xs">{vehicle.year}</span>
                  </div>
                )}
                {vehicle.vin && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-14 text-xs">VIN:</span>
                    <span className="text-gray-700 font-mono text-xs truncate">{vehicle.vin}</span>
                  </div>
                )}
              </div>
            )}

            {vehicle.notes && (
              <div className="flex items-start gap-1.5 text-sm bg-gray-50 rounded-lg p-2 mb-2">
                <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-xs line-clamp-2">{vehicle.notes}</span>
              </div>
            )}

            <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
              Добавлено: {new Date(vehicle.createdAt).toLocaleDateString('ru-RU')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}