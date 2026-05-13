'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRecord, Vehicle, MaintenanceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, X, Save } from 'lucide-react';

interface MaintenanceFormProps {
  onSubmit: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  initialData?: MaintenanceRecord;
  isEditing?: boolean;
}

const MAINTENANCE_TYPES: MaintenanceType[] = ['Плановое ТО', 'Внеплановый ремонт'];

export function MaintenanceForm({ 
  onSubmit, 
  onCancel, 
  vehicles, 
  initialData, 
  isEditing = false 
}: MaintenanceFormProps) {
  const [vehicleId, setVehicleId] = useState<number>(initialData?.vehicleId || vehicles[0]?.id || 0);
  const [type, setType] = useState<MaintenanceType>(initialData?.type || MAINTENANCE_TYPES[0]);
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date());
  const [hours, setHours] = useState(initialData?.hours?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  useEffect(() => {
    if (initialData) {
      setVehicleId(initialData.vehicleId);
      setType(initialData.type);
      setDate(new Date(initialData.date));
      setHours(initialData.hours?.toString() || '');
      setDescription(initialData.description);
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) {
      alert('Выберите технику');
      return;
    }

    if (!description.trim()) {
      alert('Введите описание обслуживания');
      return;
    }

    if (!date) {
      alert('Выберите дату обслуживания');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (!selectedVehicle) {
      alert('Выбранная техника не найдена');
      return;
    }

    onSubmit({
      vehicleId,
      vehicleName: selectedVehicle.name,
      type,
      date,
      hours: hours ? parseFloat(hours) : undefined,
      description: description.trim(),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{isEditing ? 'Редактировать запись' : 'Новая запись обслуживания'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle">Техника *</Label>
              <select
                id="vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(parseInt(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
                disabled={isEditing}
              >
                <option value="">Выберите технику...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="type">Тип обслуживания</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата обслуживания *</Label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            <div>
              <Label htmlFor="hours">Наработка (моточасов)</Label>
              <Input
                id="hours"
                type="number"
                step="0.1"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Например: 1250.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание обслуживания *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите проведенные работы..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-1">
              <X className="h-4 w-4" />
              Отмена
            </Button>
            <Button type="submit" className="gap-1">
              <Save className="h-4 w-4" />
              Добавить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}