'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRecord, Vehicle } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, CheckCircle, Clock } from 'lucide-react';

interface MaintenanceFormProps {
  onSubmit: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  initialData?: MaintenanceRecord;
  isEditing?: boolean;
}

export function MaintenanceForm({
  onSubmit,
  onCancel,
  vehicles,
  initialData,
  isEditing = false,
}: MaintenanceFormProps) {
  const [vehicleId, setVehicleId] = useState<number>(initialData?.vehicleId || vehicles[0]?.id || 0);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );
  const [hours, setHours] = useState(initialData?.hours?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [completed, setCompleted] = useState<boolean>(initialData?.completed ?? false);

  useEffect(() => {
    if (initialData) {
      setVehicleId(initialData.vehicleId);
      setDate(new Date(initialData.date));
      setHours(initialData.hours?.toString() || '');
      setDescription(initialData.description);
      setNotes(initialData.notes || '');
      setCompleted(initialData.completed ?? false);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId) {
      alert('Выберите технику');
      return;
    }
    if (!description.trim()) {
      alert('Введите описание работ');
      return;
    }
    if (!date) {
      alert('Выберите дату');
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (!selectedVehicle) {
      alert('Выбранная техника не найдена');
      return;
    }

    onSubmit({
      vehicleId,
      vehicleName: selectedVehicle.name,
      date,
      hours: hours ? parseFloat(hours) : undefined,
      description: description.trim(),
      notes: notes.trim() || undefined,
      completed,
      actualDate: completed ? new Date() : undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{isEditing ? 'Редактировать запись' : 'Новая заявка на ремонт'}</CardTitle>
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
              <Label>Статус заявки</Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setCompleted(false)}
                  className={`flex-1 h-10 rounded-md border flex items-center justify-center gap-2 text-sm transition-colors ${
                    !completed
                      ? 'bg-orange-50 border-orange-300 text-orange-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Не выполнена
                </button>
                <button
                  type="button"
                  onClick={() => setCompleted(true)}
                  className={`flex-1 h-10 rounded-md border flex items-center justify-center gap-2 text-sm transition-colors ${
                    completed
                      ? 'bg-green-50 border-green-300 text-green-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  Выполнена
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата заявки *</Label>
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
            <Label htmlFor="description">Описание работ *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите необходимые работы или неисправность..."
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
              {isEditing ? 'Сохранить' : 'Создать заявку'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}