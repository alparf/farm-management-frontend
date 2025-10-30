'use client';

import { useState } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AlertTriangle, PackageX, Package } from 'lucide-react';

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

  const getTypeColor = (type: ProductType) => {
    const colors: Record<string, string> = {
      'фунгицид': 'bg-purple-50 border-purple-200',
      'инсектицид': 'bg-red-50 border-red-200',
      'гербицид': 'bg-orange-50 border-orange-200',
      'десикант': 'bg-yellow-50 border-yellow-200',
      'регулятор роста': 'bg-green-50 border-green-200',
      'удобрение': 'bg-blue-50 border-blue-200',
      'биопрепарат': 'bg-teal-50 border-teal-200',
      'адъювант': 'bg-gray-50 border-gray-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  // Функция для определения статуса запасов
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { status: 'out', icon: PackageX, color: 'text-red-500', text: 'Нет в наличии' };
    } else if (quantity <= 5) {
      return { status: 'low', icon: AlertTriangle, color: 'text-yellow-500', text: 'Низкий запас' };
    } else {
      return { status: 'normal', icon: Package, color: 'text-green-500', text: '' };
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inventory.map((product) => {
          const stockStatus = getStockStatus(product.quantity);
          const StatusIcon = stockStatus.icon;
          const isEditing = editingId === product.id;
          
          return (
            <div
              key={product.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getTypeColor(product.type)}`}
            >
              {/* Заголовок карточки с индикаторами запасов */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-sm">
                    {product.name}
                  </h3>
                  <span className="text-xs text-gray-600 capitalize">
                    {product.type}
                  </span>
                </div>
                <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
              </div>

              {/* Количество */}
              <div className="mb-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <span className="text-xs text-gray-600 whitespace-nowrap">{product.unit}</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {product.quantity}
                    </div>
                    <div className="text-xs text-gray-600">
                      {product.unit}
                    </div>
                    {/* Текстовый статус запасов с фиксированной высотой */}
                    <div className="h-5 mt-1">
                      {stockStatus.text && (
                        <div className={`text-xs ${
                          stockStatus.status === 'out' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {stockStatus.text}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Примечания */}
              {product.notes && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {product.notes}
                  </p>
                </div>
              )}

              {/* Дата обновления */}
              <div className="text-xs text-gray-500 mb-3">
                Обновлено: {product.updatedAt.toLocaleDateString('ru-RU')}
              </div>

              {/* Действия */}
              <div className="flex gap-2">
                {isEditing ? (
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
          );
        })}
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