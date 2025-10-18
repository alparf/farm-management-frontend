'use client';

import { useState } from 'react';
import { ProductType, InventoryUnit } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface InventoryFormProps {
  onSubmit: (product: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function InventoryForm({ onSubmit, onCancel }: InventoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('фунгицид');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<InventoryUnit>('кг');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !quantity) {
      alert('Заполните название и количество');
      return;
    }

    onSubmit({
      name,
      type,
      quantity: parseFloat(quantity),
      unit,
      notes: notes || undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Добавить продукт</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Название препарата</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название продукта"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Тип продукта</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="фунгицид">Фунгицид</option>
                <option value="инсектицид">Инсектицид</option>
                <option value="гербицид">Гербицид</option>
                <option value="десикант">Десикант</option>
                <option value="регулятор роста">Регулятор роста</option>
                <option value="удобрение">Удобрение</option>
                <option value="биопрепарат">Биопрепарат</option>
                <option value="адъювант">Адъювант</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Единица измерения</Label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as InventoryUnit)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="кг">кг</option>
                <option value="л">л</option>
                <option value="г">г</option>
                <option value="мл">мл</option>
                <option value="уп">упаковка</option>
                <option value="шт">штука</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить продукт
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}