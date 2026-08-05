'use client';

import { useState, useEffect } from 'react';
import { Shipment, Client, Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface ShipmentFormProps {
  onSubmit: (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  clients: Client[];
  products: Product[];
  initialData?: Shipment;
}

export function ShipmentForm({ onSubmit, onCancel, clients, products, initialData }: ShipmentFormProps) {
  const [clientId, setClientId] = useState(initialData?.clientId || (clients.length > 0 ? clients[0].id : 0));
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [items, setItems] = useState<{ productId: number; quantity: number; returnQuantity?: number | null; pricePerUnit: number }[]>(
    initialData?.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      returnQuantity: item.returnQuantity ?? null,
      pricePerUnit: item.pricePerUnit || 0,
    })) || [{ productId: products.length > 0 ? products[0].id : 0, quantity: 0, returnQuantity: null, pricePerUnit: 0 }]
  );

  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId);
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
      setItems(
        initialData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          returnQuantity: item.returnQuantity ?? null,
          pricePerUnit: item.pricePerUnit || 0,
        }))
      );
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items
      .map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        pricePerUnit: Number(item.pricePerUnit) || 0,
        returnQuantity: item.returnQuantity !== undefined && item.returnQuantity !== null ? Number(item.returnQuantity) : null,
      }))
      .filter(item => item.productId && item.quantity > 0);

    if (validItems.length === 0) {
      alert('Добавьте хотя бы одну позицию с количеством больше 0');
      return;
    }

    const payload = {
      clientId,
      date: new Date(date),
      notes: notes || undefined,
      items: validItems.map(item => {
        const base = {
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
        };
        if (item.returnQuantity !== null && item.returnQuantity !== undefined && item.returnQuantity > 0) {
          return { ...base, returnQuantity: item.returnQuantity };
        }
        return base;
      }),
    };
    onSubmit(payload);
  };

  const addItem = () => {
    setItems([
      ...items,
      { productId: products.length > 0 ? products[0].id : 0, quantity: 0, returnQuantity: null, pricePerUnit: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'returnQuantity') {
      const val = value === '' ? null : Number(value);
      newItems[index] = { ...newItems[index], returnQuantity: val };
    } else if (field === 'quantity' || field === 'pricePerUnit') {
      const val = value === '' ? 0 : Number(value);
      newItems[index] = { ...newItems[index], [field]: val };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const getProductUnit = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.unit || '';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{initialData ? 'Редактировать отгрузку' : 'Новая отгрузка'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Клиент *</Label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(parseInt(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Дата отгрузки *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label>Товары</Label>
            <div className="space-y-2 mt-1">
              {items.map((item, index) => {
                const unit = getProductUnit(item.productId);
                // Расчёт стоимости с учётом возврата
                const quantity = Number(item.quantity) || 0;
                const returnQty = Number(item.returnQuantity) || 0;
                const netQuantity = quantity - returnQty;
                const price = Number(item.pricePerUnit) || 0;
                const total = netQuantity * price;

                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 bg-gray-50 rounded-lg">
                    <div className="col-span-3">
                      <Label className="text-xs text-gray-600">Товар</Label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value))}
                        className="w-full h-9 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Кол-во</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="h-9"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Возврат</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.returnQuantity !== null && item.returnQuantity !== undefined ? item.returnQuantity : ''}
                        onChange={(e) => updateItem(index, 'returnQuantity', e.target.value)}
                        className="h-9"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Цена за ед., BYN</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.pricePerUnit || 0}
                        onChange={(e) => updateItem(index, 'pricePerUnit', e.target.value)}
                        className="h-9"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-600">Стоимость</Label>
                      <div className="h-9 flex items-center text-sm font-medium text-gray-800">
                        {total.toFixed(2)} BYN
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-4 w-4" /> Добавить позицию
              </Button>
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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-1">
              <X className="h-4 w-4" /> Отмена
            </Button>
            <Button type="submit" className="gap-1">
              <Save className="h-4 w-4" /> {initialData ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}