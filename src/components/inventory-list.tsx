'use client';

import { useState } from 'react';
import { ProductInventory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryListProps {
  inventory: ProductInventory[];
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
}

export function InventoryList({ inventory, onUpdateProduct, onDeleteProduct }: InventoryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const startEdit = (product: ProductInventory) => {
    setEditingId(product.id);
    setEditQuantity(product.quantity.toString());
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateProduct(id, { quantity: parseFloat(editQuantity) });
      setEditingId(null);
      setEditQuantity('');
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'фунгицид': 'bg-purple-100 text-purple-800',
      'инсектицид': 'bg-red-100 text-red-800',
      'гербицид': 'bg-orange-100 text-orange-800',
      'десикант': 'bg-yellow-100 text-yellow-800',
      'регулятор роста': 'bg-green-100 text-green-800',
      'удобрение': 'bg-blue-100 text-blue-800',
      'биопрепарат': 'bg-teal-100 text-teal-800',
      'адъювант': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (inventory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        Склад пуст. Добавьте первый продукт.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inventory.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Информация о продукте */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(product.type)}`}>
                    {product.type}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {/* Редактирование количества */}
                  {editingId === product.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-24 h-8"
                      />
                      <span className="text-gray-500">{product.unit}</span>
                      <Button size="sm" onClick={() => saveEdit(product.id)}>
                        ✓
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        ×
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-gray-900">
                        {product.quantity} {product.unit}
                      </span>
                      <span className="text-xs text-gray-500">
                        Обновлено: {product.updatedAt.toLocaleDateString('ru-RU')}
                      </span>
                    </>
                  )}
                </div>

                {/* Примечания */}
                {product.notes && (
                  <p className="text-sm text-gray-600 mt-1">{product.notes}</p>
                )}
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {editingId !== product.id && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(product)}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    Удалить
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}