'use client';

import { Shipment, Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface ShipmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
  products: Product[];
}

export function ShipmentDetailsModal({ open, onOpenChange, shipment, products }: ShipmentDetailsModalProps) {
  if (!shipment) return null;

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || `ID: ${productId}`;
  };

  const getProductUnit = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.unit || '';
  };

  const totalCost = shipment.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const returnQty = Number(item.returnQuantity) || 0;
    const netQty = qty - returnQty;
    const price = Number(item.pricePerUnit) || 0;
    return sum + netQty * price;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Детали отгрузки</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Дата:</span> {format(new Date(shipment.date), 'dd.MM.yyyy')}
            </div>
            <div>
              <span className="font-medium">Клиент:</span> {shipment.client?.name || `ID: ${shipment.clientId}`}
            </div>
            {shipment.notes && (
              <div className="col-span-2">
                <span className="font-medium">Примечания:</span> {shipment.notes}
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Кол-во</TableHead>
                <TableHead>Возврат</TableHead>
                <TableHead>Цена за ед.</TableHead>
                <TableHead>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipment.items.map((item, idx) => {
                const qty = Number(item.quantity) || 0;
                const returnQty = Number(item.returnQuantity) || 0;
                const netQty = qty - returnQty;
                const price = Number(item.pricePerUnit) || 0;
                const total = netQty * price;
                return (
                  <TableRow key={idx}>
                    <TableCell>{getProductName(item.productId)}</TableCell>
                    <TableCell>{qty}</TableCell>
                    <TableCell>{returnQty > 0 ? returnQty : '—'}</TableCell>
                    <TableCell>{price.toFixed(2)}</TableCell>
                    <TableCell>{total.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Итого:</TableCell>
                <TableCell className="font-bold">{totalCost.toFixed(2)} BYN</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}