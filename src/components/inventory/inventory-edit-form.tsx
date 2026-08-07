'use client';

import { ProductInventory, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

const productTypes: ProductType[] = [
  'фунгицид', 'инсектицид', 'гербицид', 'десикант',
  'регулятор роста', 'удобрение', 'биопрепарат', 'адъювант'
];
const units = ['кг', 'л', 'г', 'мл', 'уп', 'шт'];

interface InventoryEditFormProps {
  editData: {
    name: string;
    type: ProductType;
    unit: string;
    notes: string;
  };
  onEditChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InventoryEditForm({ editData, onEditChange, onSave, onCancel }: InventoryEditFormProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600">Название</Label>
          <Input
            value={editData.name}
            onChange={(e) => onEditChange('name', e.target.value)}
            className="mt-1 h-9"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Тип</Label>
          <select
            value={editData.type}
            onChange={(e) => onEditChange('type', e.target.value as ProductType)}
            className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {productTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-600">Ед. изм.</Label>
          <select
            value={editData.unit}
            onChange={(e) => onEditChange('unit', e.target.value)}
            className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-600">Примечания</Label>
          <Textarea
            value={editData.notes}
            onChange={(e) => onEditChange('notes', e.target.value)}
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
    </div>
  );
}