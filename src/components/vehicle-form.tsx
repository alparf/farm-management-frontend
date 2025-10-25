'use client';

import { useState } from 'react';
import { Vehicle, VehicleType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';

interface VehicleFormProps {
  onSubmit: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function VehicleForm({ onSubmit, onCancel }: VehicleFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('трактор');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [insuranceDate, setInsuranceDate] = useState<Date>();
  const [roadLegalUntil, setRoadLegalUntil] = useState<Date>();
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      alert('Введите название техники');
      return;
    }

    onSubmit({
      name,
      type,
      model: model || undefined,
      year: year ? parseInt(year) : undefined,
      vin: vin || undefined,
      insuranceDate: insuranceDate || undefined,
      roadLegalUntil: roadLegalUntil || undefined,
      notes: notes || undefined,
    });
  };

  // Обработчики для предотвращения отправки формы
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем отправку формы при нажатии Enter
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Обычная обработка, но форма не отправляется
    setType(e.target.value as VehicleType);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Добавить технику</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Название техники *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Например: Трактор John Deere 7930"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Тип техники</Label>
              <select
                id="type"
                value={type}
                onChange={handleSelectChange}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">Модель</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Модель техники"
              />
            </div>

            <div>
              <Label htmlFor="year">Год выпуска</Label>
              <Input
                id="year"
                type="number"
                min="1950"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="2020"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vin">VIN/Заводской номер</Label>
            <Input
              id="vin"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="VIN или серийный номер"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата окончания страховки</Label>
              <DatePicker 
                value={insuranceDate} 
                onChange={setInsuranceDate}
              />
              <p className="text-xs text-gray-500 mt-1">
                Оставьте пустым, если страховка не требуется
              </p>
            </div>

            <div>
              <Label>Допуск к движению до</Label>
              <DatePicker 
                value={roadLegalUntil} 
                onChange={setRoadLegalUntil}
              />
              <p className="text-xs text-gray-500 mt-1">
                Дата окончания техосмотра/регистрации
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Дополнительная информация о технике..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить технику
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}