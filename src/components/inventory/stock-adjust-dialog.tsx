'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productUnit: string;
  onAdjust: (newQuantity: number, reason: string) => Promise<void>;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  productName,
  productUnit,
  onAdjust,
}: StockAdjustDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onAdjust(parseFloat(quantity), reason);
      setQuantity('');
      setReason('');
      onOpenChange(false);
    } catch (error) {
      console.error('Adjust error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Корректировка остатка</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Препарат</Label>
            <p className="text-sm font-medium mt-1">{productName}</p>
          </div>
          <div>
            <Label>Новое количество</Label>
            <Input
              type="number"
              step="0.001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Новый остаток"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Единица измерения: {productUnit}</p>
          </div>
          <div>
            <Label>Основание / Примечание</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: Инвентаризация, Пересчет..."
              rows={2}
              className="mt-1"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Выполняется...' : 'Установить остаток'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}