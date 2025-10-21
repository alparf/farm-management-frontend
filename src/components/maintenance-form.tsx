'use client';

import { useState } from 'react';
import { MaintenanceRecord, Vehicle, MaintenanceType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';

interface MaintenanceFormProps {
  onSubmit: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
}

export function MaintenanceForm({ onSubmit, onCancel, vehicles }: MaintenanceFormProps) {
  const [vehicleId, setVehicleId] = useState<number>(vehicles[0]?.id || 0);
  const [type, setType] = useState<MaintenanceType>('плановое ТО');
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

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
        <CardTitle>Новая запись обслуживания</CardTitle>
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
              >
                <option value="">Выберите технику...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.type})
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
                <option value="плановое ТО">Плановое ТО</option>
                <option value="замена масла">Замена масла</option>
                <option value="сезонное обслуживание">Сезонное обслуживание</option>
                <option value="внеплановый ремонт">Внеплановый ремонт</option>
                <option value="диагностика">Диагностика</option>
                <option value="другое">Другое</option>
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
              placeholder="Опишите проведенные работы: что сделали, какие детали заменили и т.д."
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
              placeholder="Дополнительная информация, рекомендации, заметки..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              Создать запись
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}