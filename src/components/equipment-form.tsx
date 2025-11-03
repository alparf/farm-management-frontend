import { useState } from 'react';
import { Equipment, EquipmentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';

interface EquipmentFormProps {
  equipment?: Equipment;
  onSubmit: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const equipmentTypes: EquipmentType[] = [
  'весы',
  'ph-метр',
  'термометр',
  'влагоанализатор',
  'анализатор',
  'дозатор',
  'другое'
];

export function EquipmentForm({ equipment, onSubmit, onCancel }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    type: equipment?.type || 'весы' as EquipmentType,
    model: equipment?.model || '',
    serialNumber: equipment?.serialNumber || '',
    verificationDate: equipment?.verificationDate || new Date(),
    notes: equipment?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      alert('Введите название оборудования');
      return;
    }
    
    if (!formData.verificationDate) {
      alert('Выберите дату поверки');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{equipment ? 'Редактировать оборудование' : 'Добавить оборудование'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Например: Весы аналитические"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип оборудования *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm h-10"
                required
              >
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Модель</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                placeholder="Например: AX124"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Серийный номер</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                placeholder="Например: SN12345"
              />
            </div>

            <div className="space-y-2">
              <Label>Дата поверки *</Label>
              <DatePicker
                value={formData.verificationDate}
                onChange={(date) => handleChange('verificationDate', date)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              {equipment ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}