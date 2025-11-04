'use client';

import { useState } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons, ButtonSizes } from '@/components/ui-icons';
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
      return { 
        status: 'out', 
        icon: PackageX, 
        color: 'text-red-500', 
        text: 'Нет в наличии' 
      };
    } else if (quantity <= 5) {
      return { 
        status: 'low', 
        icon: AlertTriangle, 
        color: 'text-yellow-500', 
        text: 'Низкий запас' 
      };
    } else {
      return { 
        status: 'normal', 
        icon: Package, 
        color: 'text-green-500', 
        text: '' 
      };
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inventory.map((product) => {
          const EditIcon = ButtonIcons.Edit.icon;
          const DeleteIcon = ButtonIcons.Delete.icon;
          
          const stockStatus = getStockStatus(product.quantity);
          const StatusIcon = stockStatus.icon;
          const isEditing = editingId === product.id;
          
          return (
            <div
              key={product.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md flex flex-col h-full ${getTypeColor(product.type)}`}
            >
              {/* Заголовок карточки */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-sm">
                    {product.name}
                  </h3>
                  <span className="text-xs text-gray-600 capitalize">
                    {product.type}
                  </span>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant={ButtonIcons.Edit.variant}
                    size="sm"
                    onClick={() => startEdit(product)}
                    className={ButtonSizes.sm}
                    title={ButtonIcons.Edit.title}
                  >
                    <EditIcon className={ButtonIcons.Edit.className} />
                  </Button>
                  <Button
                    variant={ButtonIcons.Delete.variant}
                    size="sm"
                    onClick={() => requestDelete(product)}
                    className={`${ButtonSizes.sm} ${ButtonIcons.Delete.style}`}
                    title={ButtonIcons.Delete.title}
                  >
                    <DeleteIcon className={ButtonIcons.Delete.className} />
                  </Button>
                </div>
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
                  </div>
                )}
              </div>

              {/* Статус запасов с иконкой - БЕЗ ФОНА */}
              {stockStatus.text && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                  <span className={`text-xs font-medium ${
                    stockStatus.status === 'out' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {stockStatus.text}
                  </span>
                </div>
              )}

              {/* Контент, который должен занимать оставшееся пространство */}
              <div className="flex-1"></div>

              {/* Нижняя часть карточки - всегда внизу слева */}
              <div className="mt-auto">
                {/* Примечания */}
                {product.notes && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 line-clamp-2 text-left">
                      {product.notes}
                    </p>
                  </div>
                )}

                {/* Дата обновления - всегда выравнивание по левому краю */}
                <div className="text-xs text-gray-500 text-left">
                  Обновлено: {product.updatedAt.toLocaleDateString('ru-RU')}
                </div>
              </div>

              {/* Действия для режима редактирования */}
              {isEditing && (
                <div className="flex gap-2 mt-3">
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
                </div>
              )}
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