'use client';

import { useState } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Package } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { InventoryItem } from './inventory-item';
import { StockAdjustDialog } from './stock-adjust-dialog';

interface InventoryListProps {
  inventory: ProductInventory[];
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onRefresh?: () => void;
  typeFilter?: ProductType | '';
  onSelectProduct?: (id: number, name: string) => void;
}

export function InventoryList({ 
  inventory, 
  onUpdateProduct, 
  onDeleteProduct, 
  onRefresh, 
  onSelectProduct 
}: InventoryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: '',
    type: 'фунгицид' as ProductType,
    unit: 'кг',
    notes: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; product: ProductInventory | null }>({
    isOpen: false,
    product: null
  });
  const [adjustDialog, setAdjustDialog] = useState<{
    open: boolean;
    product: ProductInventory | null;
  }>({
    open: false,
    product: null,
  });

  const { getBaseUrl } = useApi();

  const startEdit = (product: ProductInventory) => {
    setEditingId(product.id);
    setEditData({
      name: product.name,
      type: product.type,
      unit: product.unit,
      notes: product.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await onUpdateProduct(editingId, {
        name: editData.name,
        type: editData.type,
        unit: editData.unit,
        notes: editData.notes || undefined,
      });
      setEditingId(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const requestDelete = (product: ProductInventory) => {
    setDeleteConfirm({ isOpen: true, product });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.product) {
      try {
        await onDeleteProduct(deleteConfirm.product.id);
        setDeleteConfirm({ isOpen: false, product: null });
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting product:', error);
        setDeleteConfirm({ isOpen: false, product: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, product: null });
  };

  const handleAdjust = async (newQuantity: number, reason: string) => {
    if (!adjustDialog.product) return;
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/inventory/${adjustDialog.product.id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newQuantity, reason }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Operation failed');
    }
    if (onRefresh) await onRefresh();
  };

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Склад пуст</p>
        <p className="text-sm mt-1">Нажмите "Добавить продукт" чтобы начать</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {inventory.map((product) => (
          <InventoryItem
            key={product.id}
            product={product}
            isEditing={editingId === product.id}
            editData={editData}
            onEditChange={updateEditField}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onEdit={startEdit}
            onDelete={requestDelete}
            onAdjust={(p) => setAdjustDialog({ open: true, product: p })}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>

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

      {adjustDialog.product && (
        <StockAdjustDialog
          open={adjustDialog.open}
          onOpenChange={(open) => setAdjustDialog({ ...adjustDialog, open })}
          productName={adjustDialog.product.name}
          productUnit={adjustDialog.product.unit}
          onAdjust={handleAdjust}
        />
      )}
    </>
  );
}