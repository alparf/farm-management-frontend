'use client';

import { useState } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface InventoryListProps {
  inventory: ProductInventory[];
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  typeFilter?: ProductType | '';
}

export function InventoryList({ inventory, onUpdateProduct, onDeleteProduct, typeFilter }: InventoryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; product: ProductInventory | null }>({
    isOpen: false,
    product: null
  });

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

  const requestDelete = (product: ProductInventory) => {
    setDeleteConfirm({
      isOpen: true,
      product
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.product) {
      try {
        await onDeleteProduct(deleteConfirm.product.id);
        setDeleteConfirm({ isOpen: false, product: null });
      } catch (error) {
        console.error('Error deleting product:', error);
        setDeleteConfirm({ isOpen: false, product: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, product: null });
  };

  const getTypeColor = (product: ProductInventory) => {
    const baseColors: Record<string, string> = {
      'фунгицид': 'bg-purple-100 text-purple-800 border-purple-200',
      'инсектицид': 'bg-red-100 text-red-800 border-red-200',
      'гербицид': 'bg-orange-100 text-orange-800 border-orange-200',
      'десикант': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'регулятор роста': 'bg-green-100 text-green-800 border-green-200',
      'удобрение': 'bg-blue-100 text-blue-800 border-blue-200',
      'биопрепарат': 'bg-teal-100 text-teal-800 border-teal-200',
      'адъювант': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    let color = baseColors[product.type] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    // Сохраняем базовые цвета, но добавляем акценты для низких запасов
    if (product.quantity === 0) {
      // Для нулевого количества добавляем красную рамку поверх базового цвета
      color = color.replace('border-', 'border-2 border-red-400 ');
    } else if (product.quantity <= 5) {
      // Для низкого запаса добавляем желтую рамку поверх базового цвета
      color = color.replace('border-', 'border-2 border-yellow-400 ');
    }
    
    return color;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inventory.map((product) => (
          <div
            key={product.id}
            className={`border rounded-lg p-4 transition-all hover:shadow-md ${getTypeColor(product)}`}
          >
            {/* Заголовок карточки с индикаторами запасов */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate text-sm">
                  {product.name}
                </h3>
                <span className="text-xs opacity-75 capitalize">
                  {product.type}
                </span>
              </div>
            </div>

            {/* Количество */}
            <div className="mb-3">
              {editingId === product.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <span className="text-xs opacity-75 whitespace-nowrap">{product.unit}</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {product.quantity}
                  </div>
                  <div className="text-xs opacity-75">
                    {product.unit}
                  </div>
                </div>
              )}
            </div>

            {/* Примечания */}
            {product.notes && (
              <div className="mb-3">
                <p className="text-xs opacity-75 line-clamp-2">
                  {product.notes}
                </p>
              </div>
            )}

            {/* Дата обновления */}
            <div className="text-xs opacity-75 mb-3">
              Обновлено: {product.updatedAt.toLocaleDateString('ru-RU')}
            </div>

            {/* Действия */}
            <div className="flex gap-2">
              {editingId === product.id ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => saveEdit(product.id)}
                    className="flex-1 h-8 text-xs"
                  >
                    ✓
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEdit}
                    className="flex-1 h-8 text-xs"
                  >
                    ×
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(product)}
                    className="flex-1 h-8 text-xs"
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => requestDelete(product)}
                    className="flex-1 h-8 text-xs"
                  >
                    Удалить
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление продукта"
        message={`Вы уверены, что хотите удалить "${deleteConfirm.product?.name}" из склада? Это действие нельзя отменить.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}