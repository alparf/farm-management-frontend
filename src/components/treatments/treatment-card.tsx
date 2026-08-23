// components/treatments/treatment-card.tsx
'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCultureIcon, getIconColor, getCultureTextColor } from '@/lib/culture-icons';
import { CalendarDays, Edit2, Save, X, CheckCircle, Clock, Beaker, MapPin } from 'lucide-react';
import { ButtonIcons } from '@/components/ui-icons';

interface TreatmentCardProps {
  treatment: ChemicalTreatment;
  onUpdateTreatment: (id: number, updates: Partial<ChemicalTreatment>) => Promise<void>;
  onDeleteTreatment: (id: number) => Promise<void>;
  onCompleteTreatment?: (id: number) => Promise<void>;
  onUncompleteTreatment?: (id: number) => Promise<void>;
  onEdit: (treatment: ChemicalTreatment) => void;
  onDelete: (treatment: ChemicalTreatment) => void;
  onComplete: (id: number) => void;
  onUncomplete: (id: number) => void;
  isEditing: boolean;
  editData: {
    culture: CultureType;
    area: string;
    dueDate: string;
    actualDate: string;
    notes: string;
  };
  onEditChange: (field: string, value: any) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
}

export function TreatmentCard({
  treatment,
  isEditing,
  editData,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: TreatmentCardProps) {
  const culture = treatment.culture as CultureType;
  const isCompleted = treatment.completed;
  const DeleteIcon = ButtonIcons.Delete.icon;
  const EditIcon = ButtonIcons.Edit.icon;
  const CheckIcon = ButtonIcons.Check.icon;
  const UndoIcon = ButtonIcons.Undo.icon;
  const cultures: CultureType[] = ['груша', 'яблоко', 'черешня', 'слива', 'томаты', 'картофель', 'лук', 'свекла', 'морковь', 'капуста', 'другое'];

  const formatDisplayDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '—';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="border rounded-xl overflow-hidden transition-all bg-white border-gray-200 hover:shadow-md">
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600">Культура</Label>
              <select
                value={editData.culture}
                onChange={(e) => onEditChange('culture', e.target.value as CultureType)}
                className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {cultures.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Площадь (га)</Label>
              <Input
                type="number"
                step="0.1"
                value={editData.area}
                onChange={(e) => onEditChange('area', e.target.value)}
                className="mt-1 h-9"
                placeholder="0.0"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Плановая дата</Label>
              <Input
                type="date"
                value={editData.dueDate}
                onChange={(e) => onEditChange('dueDate', e.target.value)}
                className="mt-1 h-9"
              />
            </div>
            {isCompleted && (
              <div>
                <Label className="text-xs text-gray-600">Фактическая дата</Label>
                <Input
                  type="date"
                  value={editData.actualDate}
                  onChange={(e) => onEditChange('actualDate', e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            )}
            <div>
              <Label className="text-xs text-gray-600">Примечания</Label>
              <Textarea
                value={editData.notes}
                onChange={(e) => onEditChange('notes', e.target.value)}
                placeholder="Дополнительная информация..."
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onSaveEdit(treatment.id)}
                className="flex-1 h-8 gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                Сохранить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                className="flex-1 h-8 gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`${getIconColor(culture)}`}>
                    {getCultureIcon(culture, "h-6 w-6")}
                  </div>
                  <h3 className={`font-semibold text-base ${getCultureTextColor(culture)}`}>
                    {treatment.culture}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                  <MapPin className="h-3 w-3" />
                  {treatment.area} га
                </span>
                {treatment.isTankMix && (
                  <span className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                    <Beaker className="h-3 w-3" />
                    Баковая смесь
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isCompleted ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete(treatment.id)}
                    className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 border-green-200"
                    title="Выполнить"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUncomplete(treatment.id)}
                    className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50 border-orange-200"
                    title="Отменить выполнение"
                  >
                    <UndoIcon className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(treatment)}
                  className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                  title="Редактировать"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(treatment)}
                  className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                  title="Удалить"
                >
                  <DeleteIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5 text-blue-600 px-2 py-0.5">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  <span>План: {treatment.dueDate ? new Date(treatment.dueDate).toLocaleDateString('ru-RU') : '—'}</span>
                </span>
                {treatment.actualDate && (
                  <span className="inline-flex items-center gap-1.5 text-green-600 px-2 py-0.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Факт: {formatDisplayDate(treatment.actualDate)}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Выполнено</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Ожидает</span>
                  </span>
                )}
              </div>
            </div>

            {treatment.notes && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                  {treatment.notes}
                </p>
              </div>
            )}

            {/* Список препаратов на карточке */}
            {treatment.chemicalProducts.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {treatment.chemicalProducts.map((product, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      <span className="font-medium">{product.product?.name || `ID:${product.productId}`}</span>
                      <span className="text-gray-500">{product.ratePerHa} {product.unit || 'л/га'}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}