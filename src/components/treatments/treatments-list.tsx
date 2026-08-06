'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons } from '@/components/ui-icons';
import { getCultureIcon, getIconColor, getCultureTextColor } from '@/lib/culture-icons';
import { Calendar, MapPin, Package, StickyNote, CalendarDays, Edit2, Save, X, CheckCircle, Clock, Beaker, Eye } from 'lucide-react';
import { TreatmentDetailsModal } from './treatment-details-modal';

interface CompactTreatmentListProps {
  treatments: ChemicalTreatment[];
  onUpdateTreatment: (id: number, updates: Partial<ChemicalTreatment>) => Promise<void>;
  onDeleteTreatment: (id: number) => Promise<void>;
  onCompleteTreatment?: (id: number) => Promise<void>;
  onUncompleteTreatment?: (id: number) => Promise<void>;
}

export function CompactTreatmentList({ 
  treatments, 
  onUpdateTreatment, 
  onDeleteTreatment,
  onCompleteTreatment,
  onUncompleteTreatment 
}: CompactTreatmentListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingActualDate, setEditingActualDate] = useState<number | null>(null);
  const [tempActualDateStr, setTempActualDateStr] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<{ treatmentId: number; productIndex: number } | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [editProductData, setEditProductData] = useState<{ ratePerHa: number; unit: string }>({
    ratePerHa: 0,
    unit: 'л/га'
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; treatment: ChemicalTreatment | null }>({
    isOpen: false,
    treatment: null
  });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; treatment: ChemicalTreatment | null }>({
    open: false,
    treatment: null
  });
  
  const [editData, setEditData] = useState<{
    culture: CultureType;
    area: string;
  }>({
    culture: 'яблоко',
    area: '',
  });

  const getCardStyle = () => {
    return 'bg-white border-gray-200 hover:shadow-md transition-shadow';
  };

  const markAsPending = async (id: number) => {
    if (onUncompleteTreatment) {
      await onUncompleteTreatment(id);
    } else {
      await onUpdateTreatment(id, {
        completed: false,
        actualDate: undefined
      });
    }
  };

  const markAsCompleted = async (id: number) => {
    if (onCompleteTreatment) {
      await onCompleteTreatment(id);
    } else {
      await onUpdateTreatment(id, {
        completed: true,
        actualDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const updateActualDate = async (id: number, dateStr: string | undefined) => {
    await onUpdateTreatment(id, { actualDate: dateStr });
  };

  const startEditNotes = (treatment: ChemicalTreatment) => {
    setEditingNotes(treatment.id);
    setEditNotesText(treatment.notes || '');
  };

  const saveNotes = async (id: number) => {
    await onUpdateTreatment(id, { notes: editNotesText || undefined });
    setEditingNotes(null);
    setEditNotesText('');
  };

  const cancelEditNotes = () => {
    setEditingNotes(null);
    setEditNotesText('');
  };

  const startEditProduct = (treatmentId: number, productIndex: number, currentRate: number, currentUnit: string) => {
    setEditingProduct({ treatmentId, productIndex });
    setEditProductData({
      ratePerHa: currentRate,
      unit: currentUnit
    });
  };

  const saveProductEdit = async (treatmentId: number, productIndex: number) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    if (treatment) {
      const newChemicalProducts = [...treatment.chemicalProducts];
      newChemicalProducts[productIndex] = {
        ...newChemicalProducts[productIndex],
        ratePerHa: editProductData.ratePerHa,
        unit: editProductData.unit as 'л/га' | 'кг/га'
      };
      
      await onUpdateTreatment(treatmentId, {
        chemicalProducts: newChemicalProducts.map(p => ({
          productId: p.productId,
          ratePerHa: p.ratePerHa,
          unit: p.unit
        }))
      });
    }
    setEditingProduct(null);
  };

  const cancelProductEdit = () => {
    setEditingProduct(null);
  };

  const startEdit = (treatment: ChemicalTreatment) => {
    setEditingId(treatment.id);
    setEditData({
      culture: treatment.culture,
      area: treatment.area.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateTreatment(id, {
        culture: editData.culture,
        area: parseFloat(editData.area),
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating treatment:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const openDetails = (treatment: ChemicalTreatment) => {
    setDetailsModal({ open: true, treatment });
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Нет созданных обработок</p>
        <p className="text-sm mt-1">Нажмите "Новая обработка" чтобы добавить</p>
      </div>
    );
  }

  const requestDelete = (treatment: ChemicalTreatment) => {
    setDeleteConfirm({
      isOpen: true,
      treatment
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.treatment) {
      try {
        await onDeleteTreatment(deleteConfirm.treatment.id);
        setDeleteConfirm({ isOpen: false, treatment: null });
      } catch (error) {
        console.error('Error deleting treatment:', error);
        setDeleteConfirm({ isOpen: false, treatment: null });
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, treatment: null });
  };

  const cultures: CultureType[] = ['груша', 'яблоко', 'черешня', 'слива', 'томаты', 'картофель', 'лук', 'свекла', 'морковь', 'капуста', 'другое'];

  const formatDisplayDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '—';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDateForInput = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {treatments.map((treatment) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          const EditIcon = ButtonIcons.Edit.icon;
          const CheckIcon = ButtonIcons.Check.icon;
          const UndoIcon = ButtonIcons.Undo.icon;
          const culture = treatment.culture as CultureType;
          const isEditing = editingId === treatment.id;
          const isCompleted = treatment.completed;

          return (
            <div
              key={treatment.id}
              className={`border rounded-xl overflow-hidden transition-all ${getCardStyle()}`}
            >
              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Культура</Label>
                      <select
                        value={editData.culture}
                        onChange={(e) => updateEditField('culture', e.target.value as CultureType)}
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
                        onChange={(e) => updateEditField('area', e.target.value)}
                        className="mt-1 h-9"
                        placeholder="0.0"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(treatment.id)}
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
                ) : (
                  <>
                    {/* Заголовок */}
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
                            onClick={() => markAsCompleted(treatment.id)}
                            className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 border-green-200"
                            title="Выполнить"
                          >
                            <CheckIcon className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsPending(treatment.id)}
                            className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50 border-orange-200"
                            title="Отменить выполнение"
                          >
                            <UndoIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(treatment)}
                          className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                          title="Редактировать"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-600 hover:bg-gray-50 border-gray-200"
                          onClick={() => openDetails(treatment)}
                          title="Детали"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestDelete(treatment)}
                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                          title="Удалить"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Даты и статус */}
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
                        
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                          <Package className="h-3.5 w-3.5" />
                          <span>{treatment.chemicalProducts.length} препарата</span>
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удаление обработки"
        message={`Вы уверены, что хотите удалить обработку для "${deleteConfirm.treatment?.culture}"? Это действие нельзя отменить. Препараты будут возвращены на склад.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />

      <TreatmentDetailsModal
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
        treatment={detailsModal.treatment}
      />
    </>
  );
}