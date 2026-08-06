'use client';

import { ChemicalTreatment } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Package, Beaker, StickyNote, CheckCircle, Clock } from 'lucide-react';

interface TreatmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: ChemicalTreatment | null;
}

export function TreatmentDetailsModal({ open, onOpenChange, treatment }: TreatmentDetailsModalProps) {
  if (!treatment) return null;

  const isCompleted = treatment.completed;
  const statusIcon = isCompleted ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-orange-500" />;
  const statusText = isCompleted ? 'Выполнено' : 'Ожидает';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Детали обработки</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-2 text-sm flex-shrink-0">
            <div>
              <span className="font-medium">Культура:</span> {treatment.culture}
            </div>
            <div>
              <span className="font-medium">Площадь:</span> {treatment.area} га
            </div>
            <div>
              <span className="font-medium">Статус:</span>{' '}
              <span className={`inline-flex items-center gap-1 ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                {statusIcon} {statusText}
              </span>
            </div>
            <div>
              <span className="font-medium">Баковая смесь:</span> {treatment.isTankMix ? 'Да' : 'Нет'}
            </div>
            <div>
              <span className="font-medium">Плановая дата:</span>{' '}
              {treatment.dueDate ? format(new Date(treatment.dueDate), 'dd.MM.yyyy') : '—'}
            </div>
            {treatment.actualDate && (
              <div>
                <span className="font-medium">Фактическая дата:</span>{' '}
                {format(new Date(treatment.actualDate), 'dd.MM.yyyy')}
              </div>
            )}
            {treatment.notes && (
              <div className="col-span-2">
                <span className="font-medium">Примечания:</span> {treatment.notes}
              </div>
            )}
          </div>

          {/* Таблица препаратов */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Препарат</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Норма расхода</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatment.chemicalProducts.map((product, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{product.product?.name || `ID: ${product.productId}`}</TableCell>
                    <TableCell>{product.product?.type || '—'}</TableCell>
                    <TableCell>{product.ratePerHa}</TableCell>
                    <TableCell>{product.unit || 'л/га'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}