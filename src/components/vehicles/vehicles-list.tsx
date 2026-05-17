import { useState } from 'react';
import { Vehicle, VehicleType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { ButtonIcons } from '@/components/ui-icons';
import { AlertTriangle, Calendar, Car, Wrench, FileText, Save, X, Shield, Route, Tractor, Truck, Combine, Settings } from 'lucide-react';

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

  const vehicleTypes: VehicleType[] = ['трактор', 'комбайн', 'грузовой автомобиль', 'легковой автомобиль', 'прицеп', 'сельхозорудие', 'другая техника'];

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Car className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Техника не добавлена</p>
        <p className="text-sm mt-1">Нажмите "Добавить технику" чтобы начать</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((vehicle) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          const EditIcon = ButtonIcons.Edit.icon;
          const isEditing = editingId === vehicle.id;
          const typeIcon = getTypeIcon(vehicle.type);
          
          const isInsuranceExpired = isDateExpired(vehicle.insuranceDate);
          const isRoadLegalExpired = isDateExpired(vehicle.roadLegalUntil);
          const isInsuranceExpiringSoon = isDateExpiringSoon(vehicle.insuranceDate);
          const isRoadLegalExpiringSoon = isDateExpiringSoon(vehicle.roadLegalUntil);
          
          const hasExpiryWarnings = isInsuranceExpired || isRoadLegalExpired || isInsuranceExpiringSoon || isRoadLegalExpiringSoon;
          
          return (
            <div
              key={vehicle.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white"
            >
              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Название</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => updateEditField('name', e.target.value)}
                        className="mt-1 h-9"
                        placeholder="Название техники"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Тип техники</Label>
                      <select
                        value={editData.type}
                        onChange={(e) => updateEditField('type', e.target.value as VehicleType)}
                        className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>{getTypeLabel(type)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">Модель</Label>
                        <Input
                          value={editData.model}
                          onChange={(e) => updateEditField('model', e.target.value)}
                          className="mt-1 h-9"
                          placeholder="Модель"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Год</Label>
                        <Input
                          type="number"
                          value={editData.year}
                          onChange={(e) => updateEditField('year', e.target.value)}
                          className="mt-1 h-9"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">VIN/Заводской номер</Label>
                      <Input
                        value={editData.vin}
                        onChange={(e) => updateEditField('vin', e.target.value)}
                        className="mt-1 h-9"
                        placeholder="VIN номер"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">Страховка до</Label>
                        <DatePicker 
                          value={editData.insuranceDate} 
                          onChange={(date) => updateEditField('insuranceDate', date)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Допуск до</Label>
                        <DatePicker 
                          value={editData.roadLegalUntil} 
                          onChange={(date) => updateEditField('roadLegalUntil', date)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Примечания</Label>
                      <Textarea
                        value={editData.notes}
                        onChange={(e) => updateEditField('notes', e.target.value)}
                        placeholder="Дополнительная информация..."
                        rows={2}
                        className="mt-1 text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(vehicle.id)}
                        className="flex-1 h-8 gap-1"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        className="flex-1 h-8 gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        Отмена
                      </Button>
                    </div>
                  </div>
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
                          onClick={() => startEdit(vehicle)}
                          className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                          title="Редактировать"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestDelete(vehicle)}
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

                    {hasExpiryWarnings && (
                      <div className="space-y-1 mb-2">
                        {isInsuranceExpired && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Страховка просрочена!
                          </div>
                        )}
                        {isInsuranceExpiringSoon && !isInsuranceExpired && (
                          <div className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Страховка истекает
                          </div>
                        )}
                        {isRoadLegalExpired && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Допуск просрочен!
                          </div>
                        )}
                        {isRoadLegalExpiringSoon && !isRoadLegalExpired && (
                          <div className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Допуск истекает
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5 mb-3">
                      {vehicle.insuranceDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Shield className="h-3.5 w-3.5" />
                            Страховка:
                          </span>
                          <span className="text-gray-700 text-xs">{formatDate(vehicle.insuranceDate)}</span>
                        </div>
                      )}
                      
                      {vehicle.roadLegalUntil && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <Route className="h-3.5 w-3.5" />
                            Допуск:
                          </span>
                          <span className="text-gray-700 text-xs">{formatDate(vehicle.roadLegalUntil)}</span>
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

export default VehiclesList;