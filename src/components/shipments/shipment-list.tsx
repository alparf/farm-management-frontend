'use client';

import { useState } from 'react';
import { Shipment, Client, Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Edit2, Trash2, User, Package, Truck, FileText, Eye } from 'lucide-react';
import { ShipmentDetailsModal } from './shipment-details-modal';

interface ShipmentListProps {
  shipments: Shipment[];
  clients: Client[];
  products: Product[];
  onEdit: (shipment: Shipment) => void;
  onDelete: (id: number) => void;
}

export function ShipmentList({ shipments, clients, products, onEdit, onDelete }: ShipmentListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; shipment: Shipment | null }>({ open: false, shipment: null });

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Неизвестный клиент';
  };

  const getTotalCost = (items: Shipment['items']) => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const returnQty = Number(item.returnQuantity) || 0;
      const netQuantity = quantity - returnQty;
      const price = Number(item.pricePerUnit) || 0;
      return sum + netQuantity * price;
    }, 0);
  };

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Нет отгрузок</p>
        <p className="text-sm mt-1">Добавьте первую отгрузку</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shipments.map((shipment) => {
          const totalCost = getTotalCost(shipment.items);
          return (
            <Card key={shipment.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2 truncate">
                      <Truck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span>
                        {new Date(shipment.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 truncate">
                      <User className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{getClientName(shipment.clientId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Package className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{shipment.items.length} позиций</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mt-1">
                      <span className="text-green-700">{totalCost.toFixed(2)} BYN</span>
                    </div>
                    {shipment.notes && (
                      <div className="flex items-start gap-1 text-sm text-gray-600 mt-1">
                        <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 break-words">{shipment.notes}</span>
                      </div>
                    )}
                  </div>
                  {/* Кнопки идентичны обработкам */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                      onClick={() => onEdit(shipment)}
                      title="Редактировать"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-gray-600 hover:bg-gray-50 border-gray-200"
                      onClick={() => setDetailsModal({ open: true, shipment })}
                      title="Детали"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => setDeleteConfirm({ open: true, id: shipment.id })}
                      title="Удалить"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Удаление отгрузки"
        message="Вы уверены, что хотите удалить эту отгрузку?"
        onConfirm={() => {
          if (deleteConfirm.id) onDelete(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: null });
        }}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />

      <ShipmentDetailsModal
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
        shipment={detailsModal.shipment}
        products={products}
      />
    </>
  );
}