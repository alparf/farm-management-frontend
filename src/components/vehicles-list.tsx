import { useState } from 'react';
import { Vehicle, VehicleType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { ButtonIcons, ButtonSizes } from '@/components/ui-icons';
import { AlertTriangle, Calendar } from 'lucide-react';

interface VehiclesListProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<Vehicle | void>;
  onDeleteVehicle: (id: number) => Promise<void>;
}

export function VehiclesList({ vehicles, onUpdateVehicle, onDeleteVehicle }: VehiclesListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null
  });

  // Состояния для редактирования
  const [editData, setEditData] = useState<{
    name: string;
    type: VehicleType;
    model: string;
    year: string;
    vin: string;
    insuranceDate?: Date;
    roadLegalUntil?: Date;
    notes: string;
  }>({
    name: '',
    type: 'трактор',
    model: '',
    year: '',
    vin: '',
    notes: ''
  });

  // Функция для проверки просроченных дат
  const isDateExpired = (date?: Date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  // Функция для проверки истекающих дат (в течение 30 дней)
  const isDateExpiringSoon = (date?: Date, daysThreshold: number = 30) => {
    if (!date) return false;
    const today = new Date();
    const timeDiff = new Date(date).getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  // Функция для форматирования даты
  const formatDate = (date?: Date) => {
    if (!date) return null;
    return date.toLocaleDateString('ru-RU');
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditData({
      name: vehicle.name,
      type: vehicle.type,
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      vin: vehicle.vin || '',
      insuranceDate: vehicle.insuranceDate,
      roadLegalUntil: vehicle.roadLegalUntil,
      notes: vehicle.notes || ''
    });
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateVehicle(id, {
        name: editData.name,
        type: editData.type,
        model: editData.model || undefined,
        year: editData.year ? parseInt(editData.year) : undefined,
        vin: editData.vin || undefined,
        insuranceDate: editData.insuranceDate,
        roadLegalUntil: editData.roadLegalUntil,
        notes: editData.notes || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const requestDelete = (vehicle: Vehicle) => {
    setDeleteConfirm({
      isOpen: true,
      vehicle
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.vehicle) {
      try {
        await onDeleteVehicle(deleteConfirm.vehicle.id);
        setDeleteConfirm({ isOpen: false, vehicle: null });
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setDeleteConfirm({ isOpen: false, vehicle: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, vehicle: null });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'трактор': 'bg-orange-50 border-orange-200',
      'комбайн': 'bg-amber-50 border-amber-200',
      'грузовой автомобиль': 'bg-blue-50 border-blue-200',
      'легковой автомобиль': 'bg-cyan-50 border-cyan-200',
      'прицеп': 'bg-gray-50 border-gray-200',
      'сельхозорудие': 'bg-green-50 border-green-200',
      'другая техника': 'bg-purple-50 border-purple-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        Техника не добавлена. Добавьте первую единицу техники.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => {
          const EditIcon = ButtonIcons.Edit.icon;
          const DeleteIcon = ButtonIcons.Delete.icon;
          
          const isInsuranceExpired = isDateExpired(vehicle.insuranceDate);
          const isRoadLegalExpired = isDateExpired(vehicle.roadLegalUntil);
          const isInsuranceExpiringSoon = isDateExpiringSoon(vehicle.insuranceDate);
          const isRoadLegalExpiringSoon = isDateExpiringSoon(vehicle.roadLegalUntil);
          const isEditing = editingId === vehicle.id;
          
          return (
            <div
              key={vehicle.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getTypeColor(vehicle.type)}`}
            >
              {isEditing ? (
                // Режим редактирования
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-name">Название *</Label>
                    <Input
                      id="edit-name"
                      value={editData.name}
                      onChange={(e) => updateEditField('name', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-type">Тип</Label>
                    <select
                      id="edit-type"
                      value={editData.type}
                      onChange={(e) => updateEditField('type', e.target.value as VehicleType)}
                      className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                    >
                      <option value="трактор">Трактор</option>
                      <option value="комбайн">Комбайн</option>
                      <option value="грузовой автомобиль">Грузовой автомобиль</option>
                      <option value="легковой автомобиль">Легковой автомобиль</option>
                      <option value="прицеп">Прицеп</option>
                      <option value="сельхозорудие">Сельхозорудие</option>
                      <option value="другая техника">Другая техника</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="edit-model">Модель</Label>
                      <Input
                        id="edit-model"
                        value={editData.model}
                        onChange={(e) => updateEditField('model', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-year">Год</Label>
                      <Input
                        id="edit-year"
                        type="number"
                        value={editData.year}
                        onChange={(e) => updateEditField('year', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-vin">VIN</Label>
                    <Input
                      id="edit-vin"
                      value={editData.vin}
                      onChange={(e) => updateEditField('vin', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Страховка до</Label>
                      <DatePicker 
                        value={editData.insuranceDate} 
                        onChange={(date) => updateEditField('insuranceDate', date)}
                      />
                    </div>
                    <div>
                      <Label>Допуск до</Label>
                      <DatePicker 
                        value={editData.roadLegalUntil} 
                        onChange={(date) => updateEditField('roadLegalUntil', date)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-notes">Примечания</Label>
                    <textarea
                      id="edit-notes"
                      value={editData.notes}
                      onChange={(e) => updateEditField('notes', e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(vehicle.id)}
                      className="flex-1 h-8 text-xs"
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      className="flex-1 h-8 text-xs"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                // Режим просмотра
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">
                        {vehicle.name}
                      </h3>
                      <span className="text-xs text-gray-600 capitalize">
                        {vehicle.type}
                      </span>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant={ButtonIcons.Edit.variant}
                        size="sm"
                        onClick={() => startEdit(vehicle)}
                        className={ButtonSizes.sm}
                        title={ButtonIcons.Edit.title}
                      >
                        <EditIcon className={ButtonIcons.Edit.className} />
                      </Button>
                      <Button
                        variant={ButtonIcons.Delete.variant}
                        size="sm"
                        onClick={() => requestDelete(vehicle)}
                        className={`${ButtonSizes.sm} ${ButtonIcons.Delete.style}`}
                        title={ButtonIcons.Delete.title}
                      >
                        <DeleteIcon className={ButtonIcons.Delete.className} />
                      </Button>
                    </div>
                  </div>

                  {/* Информация о страховке */}
                  {vehicle.insuranceDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-700 mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>Страховка: {formatDate(vehicle.insuranceDate)}</span>
                      {isInsuranceExpired ? (
                        <div className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">просрочена</span>
                        </div>
                      ) : isInsuranceExpiringSoon ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">истекает</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  {/* Информация о допуске */}
                  {vehicle.roadLegalUntil && (
                    <div className="flex items-center gap-2 text-xs text-gray-700 mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>Допуск: {formatDate(vehicle.roadLegalUntil)}</span>
                      {isRoadLegalExpired ? (
                        <div className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">просрочен</span>
                        </div>
                      ) : isRoadLegalExpiringSoon ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs">истекает</span>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {(!vehicle.insuranceDate && !vehicle.roadLegalUntil) && (
                    <div className="text-xs text-gray-500 mb-3">
                      Нет данных о страховке и допуске
                    </div>
                  )}

                  {vehicle.model && (
                    <div className="text-sm text-gray-700 mb-1">
                      Модель: {vehicle.model}
                    </div>
                  )}

                  {vehicle.year && (
                    <div className="text-sm text-gray-700 mb-1">
                      Год: {vehicle.year}
                    </div>
                  )}

                  {vehicle.vin && (
                    <div className="text-sm text-gray-700 mb-3">
                      VIN: {vehicle.vin}
                    </div>
                  )}

                  {vehicle.notes && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {vehicle.notes}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Добавлено: {vehicle.createdAt.toLocaleDateString('ru-RU')}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление техники"
        message={`Вы уверены, что хотите удалить "${deleteConfirm.vehicle?.name}"? Все записи обслуживания этой техники также будут удалены.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}