// src/components/inventory/InventoryItem.tsx
'use client';

import { ProductInventory, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { ButtonIcons } from '@/components/ui-icons';
import { getTypeIconAndColor, getStockStatus } from './inventory-utils';
import { InventoryEditForm } from './inventory-edit-form';

interface InventoryItemProps {
  product: ProductInventory;
  isEditing: boolean;
  editData: {
    name: string;
    type: ProductType;
    unit: string;
    notes: string;
  };
  onEditChange: (field: string, value: any) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEdit: (product: ProductInventory) => void;
  onDelete: (product: ProductInventory) => void;
  onAdjust: (product: ProductInventory) => void;
  onSelectProduct?: (id: number, name: string) => void;
}

export function InventoryItem({
  product,
  isEditing,
  editData,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onEdit,
  onDelete,
  onAdjust,
  onSelectProduct,
}: InventoryItemProps) {
  const DeleteIcon = ButtonIcons.Delete.icon;
  const EditIcon = ButtonIcons.Edit.icon;
  const typeConfig = getTypeIconAndColor(product.type);
  const stockStatus = getStockStatus(product.quantity);
  const StatusIcon = stockStatus.icon;

  const handleClick = () => {
    if (!isEditing && onSelectProduct) {
      onSelectProduct(product.id, product.name);
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white ${!isEditing && onSelectProduct ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="p-4">
        {isEditing ? (
          <InventoryEditForm
            editData={editData}
            onEditChange={onEditChange}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                  {stockStatus.text && (
                    <StatusIcon className={`h-4 w-4 ${stockStatus.color}`} />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className={`flex-shrink-0 ${typeConfig.textColor}`}>{typeConfig.icon}</div>
                  <span className="text-xs text-gray-500 capitalize">{product.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                  title="Редактировать"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product)}
                  className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                  title="Удалить"
                >
                  <DeleteIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{product.quantity}</div>
                <div className="text-xs text-gray-500">{product.unit}</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdjust(product);
                }}
                className="h-7 px-2 text-blue-600 hover:bg-blue-50 border-blue-200"
                title="Корректировка остатка"
              >
                Коррекция
              </Button>
              <div className="text-xs text-gray-400">
                Обновлено: {new Date(product.updatedAt).toLocaleDateString('ru-RU')}
              </div>
            </div>

            {product.notes && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 truncate" title={product.notes}>
                  {product.notes}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}