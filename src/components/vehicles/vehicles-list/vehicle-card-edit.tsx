import { VehicleType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Save, X } from 'lucide-react';

interface VehicleCardEditProps {
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
  onUpdateField: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

const VEHICLE_TYPES: VehicleType[] = [
  'трактор', 'комбайн', 'грузовой автомобиль',
  'легковой автомобиль', 'прицеп', 'сельхозорудие', 'другая техника'
];

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

export function VehicleCardEdit({
  editData,
  onUpdateField,
  onSave,
  onCancel,
}: VehicleCardEditProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-gray-600">Название</Label>
        <Input
          value={editData.name}
          onChange={(e) => onUpdateField('name', e.target.value)}
          className="mt-1 h-9"
          placeholder="Название техники"
        />
      </div>
      <div>
        <Label className="text-xs text-gray-600">Тип техники</Label>
        <select
          value={editData.type}
          onChange={(e) => onUpdateField('type', e.target.value as VehicleType)}
          className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          {VEHICLE_TYPES.map((type) => (
            <option key={type} value={type}>{getTypeLabel(type)}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-600">Модель</Label>
          <Input
            value={editData.model}
            onChange={(e) => onUpdateField('model', e.target.value)}
            className="mt-1 h-9"
            placeholder="Модель"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Год</Label>
          <Input
            type="number"
            value={editData.year}
            onChange={(e) => onUpdateField('year', e.target.value)}
            className="mt-1 h-9"
            placeholder="2020"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-gray-600">VIN/Заводской номер</Label>
        <Input
          value={editData.vin}
          onChange={(e) => onUpdateField('vin', e.target.value)}
          className="mt-1 h-9"
          placeholder="VIN номер"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-600">Страховка до</Label>
          <DatePicker 
            value={editData.insuranceDate} 
            onChange={(date) => onUpdateField('insuranceDate', date)}
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Допуск до</Label>
          <DatePicker 
            value={editData.roadLegalUntil} 
            onChange={(date) => onUpdateField('roadLegalUntil', date)}
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-gray-600">Примечания</Label>
        <Textarea
          value={editData.notes}
          onChange={(e) => onUpdateField('notes', e.target.value)}
          placeholder="Дополнительная информация..."
          rows={2}
          className="mt-1 text-sm"
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={onSave} className="flex-1 h-8 gap-1">
          <Save className="h-3.5 w-3.5" />
          Сохранить
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 h-8 gap-1">
          <X className="h-3.5 w-3.5" />
          Отмена
        </Button>
      </div>
    </div>
  );
}