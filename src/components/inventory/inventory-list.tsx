'use client';

import { useState } from 'react';
import { ProductInventory, ProductType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ButtonIcons } from '@/components/ui-icons';
import { Shield, Bug, Flower2, Droplets, TrendingUp, Sprout, Leaf, Beaker, Package, AlertTriangle, PackageX, Save, X, Edit2, Plus, Minus, RefreshCw } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface InventoryListProps {
  inventory: ProductInventory[];
  onUpdateProduct: (id: number, updates: Partial<ProductInventory>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onRefresh: () => void;
  typeFilter?: ProductType | '';
  onSelectProduct?: (id: number, name: string) => void;
}

export function InventoryList({ inventory, onUpdateProduct, onDeleteProduct, onRefresh, typeFilter, onSelectProduct }: InventoryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; product: ProductInventory | null }>({
    isOpen: false,
    product: null
  });
  
  // Состояния для операций со складом
  const [stockDialog, setStockDialog] = useState<{
    open: boolean;
    type: 'in' | 'out' | 'adjust';
    productId: number;
    productName: string;
    productUnit: string;
  }>({ open: false, type: 'in', productId: 0, productName: '', productUnit: '' });
  
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockDescription, setStockDescription] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  const { getBaseUrl } = useApi();

  const [editData, setEditData] = useState<{
    name: string;
    type: ProductType;
    unit: string;
    notes: string;
  }>({
    name: '',
    type: 'фунгицид',
    unit: 'кг',
    notes: '',
  });

  const getTypeIconAndColor = (type: ProductType) => {
    const types: Record<string, { icon: React.ReactNode; textColor: string }> = {
      'фунгицид': { icon: <Shield className="h-4 w-4" />, textColor: 'text-purple-600' },
      'инсектицид': { icon: <Bug className="h-4 w-4" />, textColor: 'text-red-600' },
      'гербицид': { icon: <Flower2 className="h-4 w-4" />, textColor: 'text-orange-600' },
      'десикант': { icon: <Droplets className="h-4 w-4" />, textColor: 'text-yellow-600' },
      'регулятор роста': { icon: <TrendingUp className="h-4 w-4" />, textColor: 'text-green-600' },
      'удобрение': { icon: <Sprout className="h-4 w-4" />, textColor: 'text-blue-600' },
      'биопрепарат': { icon: <Leaf className="h-4 w-4" />, textColor: 'text-teal-600' },
      'адъювант': { icon: <Beaker className="h-4 w-4" />, textColor: 'text-gray-600' }
    };
    return types[type] || { icon: <Package className="h-4 w-4" />, textColor: 'text-gray-600' };
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { status: 'out', icon: PackageX, color: 'text-red-500', text: 'Нет в наличии' };
    } else if (quantity <= 5) {
      return { status: 'low', icon: AlertTriangle, color: 'text-yellow-500', text: 'Низкий запас' };
    } else {
      return { status: 'normal', icon: Package, color: 'text-green-500', text: '' };
    }
  };

  const productTypes: ProductType[] = [
    'фунгицид', 'инсектицид', 'гербицид', 'десикант',
    'регулятор роста', 'удобрение', 'биопрепарат', 'адъювант'
  ];

  const units = ['кг', 'л', 'г', 'мл', 'уп', 'шт'];

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

  const saveEdit = async (id: number) => {
    try {
      await onUpdateProduct(id, {
        name: editData.name,
        type: editData.type,
        unit: editData.unit,
        notes: editData.notes || undefined,
      });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
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
        onRefresh();
      } catch (error) {
        console.error('Error deleting product:', error);
        setDeleteConfirm({ isOpen: false, product: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, product: null });
  };

  const handleProductClick = (product: ProductInventory) => {
    if (!editingId && onSelectProduct) {
      onSelectProduct(product.id, product.name);
    }
  };

  const handleStockOperation = async () => {
    setStockLoading(true);
    try {
      const baseUrl = getBaseUrl();
      let url = '';
      let body = {};
      
      if (stockDialog.type === 'in') {
        url = `${baseUrl}/inventory/${stockDialog.productId}/in`;
        body = { quantity: parseFloat(stockQuantity), description: stockDescription };
      } else if (stockDialog.type === 'out') {
        url = `${baseUrl}/inventory/${stockDialog.productId}/out`;
        body = { quantity: parseFloat(stockQuantity), description: stockDescription };
      } else {
        url = `${baseUrl}/inventory/${stockDialog.productId}/adjust`;
        body = { newQuantity: parseFloat(stockQuantity), reason: stockDescription };
      }
      
      console.log('Sending request to:', url);
      console.log('Body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        // Пытаемся получить текст ошибки
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.message || JSON.stringify(errorData);
        } catch {
          errorText = await response.text();
        }
        console.error('Server error response:', errorText);
        throw new Error(errorText || 'Operation failed');
      }
      
      const result = await response.json();
      console.log('Operation successful:', result);
      
      setStockDialog({ ...stockDialog, open: false });
      setStockQuantity('');
      setStockDescription('');
      onRefresh();
    } catch (err: any) {
      console.error('Stock operation error:', err);
      alert(err.message || 'Ошибка при выполнении операции');
    } finally {
      setStockLoading(false);
    }
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
        {inventory.map((product) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          const EditIcon = ButtonIcons.Edit.icon;
          const isEditing = editingId === product.id;
          const typeConfig = getTypeIconAndColor(product.type);
          const stockStatus = getStockStatus(product.quantity);
          const StatusIcon = stockStatus.icon;
          
          return (
            <div
              key={product.id}
              className={`border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white ${!isEditing && onSelectProduct ? 'cursor-pointer' : ''}`}
              onClick={() => handleProductClick(product)}
            >
              <div className="p-4">
                {isEditing ? (
                  // Режим редактирования
                  <div onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Название</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => updateEditField('name', e.target.value)}
                          className="mt-1 h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Тип</Label>
                        <select
                          value={editData.type}
                          onChange={(e) => updateEditField('type', e.target.value as ProductType)}
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
                          onChange={(e) => updateEditField('unit', e.target.value)}
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
                          onChange={(e) => updateEditField('notes', e.target.value)}
                          placeholder="Дополнительная информация..."
                          rows={2}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(product.id)}
                          className="flex-1 h-8 gap-1"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Сохранить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          className="flex-1 h-8 gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Режим просмотра
                  <>
                    {/* Заголовок с названием и кнопками */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`flex-shrink-0 ${typeConfig.textColor}`}>
                            {typeConfig.icon}
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {product.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(product)}
                          className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                          title="Редактировать"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestDelete(product)}
                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                          title="Удалить"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Количество и кнопки операций */}
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-gray-900">
                        {product.quantity}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {product.unit}
                      </div>
                      
                      {/* Кнопки операций со складом */}
                      <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockDialog({ open: true, type: 'in', productId: product.id, productName: product.name, productUnit: product.unit })}
                          className="h-7 px-2 text-green-600 hover:bg-green-50 border-green-200"
                          title="Пополнение склада"
                        >
                          Приход
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockDialog({ open: true, type: 'out', productId: product.id, productName: product.name, productUnit: product.unit })}
                          className="h-7 px-2 text-red-600 hover:bg-red-50 border-red-200"
                          title="Списание со склада"
                        >
                          Расход
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStockDialog({ open: true, type: 'adjust', productId: product.id, productName: product.name, productUnit: product.unit })}
                          className="h-7 px-2 text-blue-600 hover:bg-blue-50 border-blue-200"
                          title="Корректировка остатка"
                        >
                          Коррекция
                        </Button>
                      </div>
                    </div>

                    {/* Статус запасов */}
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

                    {/* Примечания */}
                    {product.notes && (
                      <div className="bg-gray-50 rounded-lg p-2 mb-3">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {product.notes}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                      Обновлено: {new Date(product.updatedAt).toLocaleDateString('ru-RU')}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Диалог операций со складом */}
      <Dialog open={stockDialog.open} onOpenChange={(open: boolean) => setStockDialog({ ...stockDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockDialog.type === 'in' && 'Пополнение склада'}
              {stockDialog.type === 'out' && 'Списание со склада'}
              {stockDialog.type === 'adjust' && 'Корректировка остатка'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Препарат</Label>
              <p className="text-sm font-medium mt-1">{stockDialog.productName}</p>
            </div>
            <div>
              <Label>
                {stockDialog.type === 'adjust' ? 'Новое количество' : 'Количество'}
              </Label>
              <Input
                type="number"
                step="0.001"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder={stockDialog.type === 'adjust' ? 'Новый остаток' : '0.000'}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Единица измерения: {stockDialog.productUnit}</p>
            </div>
            <div>
              <Label>Основание / Примечание</Label>
              <Textarea
                value={stockDescription}
                onChange={(e) => setStockDescription(e.target.value)}
                placeholder="Например: Инвентаризация, Поступление, Списание..."
                rows={2}
                className="mt-1"
              />
            </div>
            <Button onClick={handleStockOperation} disabled={stockLoading} className="w-full">
              {stockLoading ? 'Выполняется...' : (
                <>
                  {stockDialog.type === 'in' && 'Добавить'}
                  {stockDialog.type === 'out' && 'Списать'}
                  {stockDialog.type === 'adjust' && 'Установить'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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