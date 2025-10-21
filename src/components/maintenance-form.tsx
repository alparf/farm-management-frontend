'use client';

import { useState } from 'react';
import { MaintenanceRecord, Vehicle, MaintenanceType, MaintenanceWork } from '@/types';
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
  const [works, setWorks] = useState<MaintenanceWork[]>([{ name: '', description: '' }]);
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const addWork = () => {
    setWorks([...works, { name: '', description: '' }]);
  };

  const updateWork = (index: number, field: keyof MaintenanceWork, value: string) => {
    const newWorks = [...works];
    newWorks[index] = { ...newWorks[index], [field]: value };
    setWorks(newWorks);
  };

  const removeWork = (index: number) => {
    setWorks(works.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) {
      alert('Выберите технику');
      return;
    }

    if (works.some(w => !w.name)) {
      alert('Заполните названия всех выполненных работ');
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
      description,
      works: works.filter(w => w.name.trim() !== ''),
      cost: cost ? parseFloat(cost) : undefined,
      notes: notes || undefined,
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
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание проведенных работ"
              required
            />
          </div>

          <div>
            <Label>Выполненные работы *</Label>
            {works.map((work, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5">
                  <Label>Название работы</Label>
                  <Input
                    value={work.name}
                    onChange={(e) => updateWork(index, 'name', e.target.value)}
                    placeholder="Например: Замена масла двигателя"
                    required
                  />
                </div>
                <div className="col-span-6">
                  <Label>Описание</Label>
                  <Input
                    value={work.description || ''}
                    onChange={(e) => updateWork(index, 'description', e.target.value)}
                    placeholder="Детали выполнения работы"
                  />
                </div>
                <div className="col-span-1">
                  {works.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeWork(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addWork}>
              + Добавить работу
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Стоимость (руб)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
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