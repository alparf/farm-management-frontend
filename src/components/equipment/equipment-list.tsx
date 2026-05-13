import { useState } from 'react';
import { Equipment, EquipmentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons } from '@/components/ui-icons';
import { Calendar, AlertTriangle, CheckCircle, Scale, Droplets, Thermometer, Microscope, FlaskConical, Syringe, Settings, Save, X, StickyNote } from 'lucide-react';

interface EquipmentListProps {
  equipment: Equipment[];
  onUpdateEquipment: (id: number, updates: Partial<Equipment>) => Promise<void>;
  onDeleteEquipment: (id: number) => Promise<void>;
}

export function EquipmentList({ equipment, onUpdateEquipment, onDeleteEquipment }: EquipmentListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; equipment: Equipment | null }>({
    isOpen: false,
    equipment: null
  });

  const [editData, setEditData] = useState<{
    name: string;
    type: EquipmentType;
    model: string;
    serialNumber: string;
    verificationDate: Date;
    notes: string;
  }>({
    name: '',
    type: 'весы',
    model: '',
    serialNumber: '',
    verificationDate: new Date(),
    notes: '',
  });

  const isOverdue = (date: Date) => new Date() > date;
  const isExpiringSoon = (date: Date, daysThreshold: number = 30) => {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'весы': <Scale className="h-4 w-4" />,
      'ph-метр': <Droplets className="h-4 w-4" />,
      'термометр': <Thermometer className="h-4 w-4" />,
      'влагоанализатор': <Microscope className="h-4 w-4" />,
      'анализатор': <FlaskConical className="h-4 w-4" />,
      'дозатор': <Syringe className="h-4 w-4" />,
      'другое': <Settings className="h-4 w-4" />,
    };
    return icons[type] || <Settings className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'весы': 'text-orange-600',
      'ph-метр': 'text-blue-600',
      'термометр': 'text-red-600',
      'влагоанализатор': 'text-green-600',
      'анализатор': 'text-purple-600',
      'дозатор': 'text-cyan-600',
      'другое': 'text-gray-600',
    };
    return colors[type] || 'text-gray-600';
  };

  const equipmentTypes: EquipmentType[] = [
    'весы', 'ph-метр', 'термометр', 'влагоанализатор', 'анализатор', 'дозатор', 'другое'
  ];

  const startEdit = (item: Equipment) => {
    setEditingId(item.id);
    setEditData({
      name: item.name,
      type: item.type,
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      verificationDate: item.verificationDate,
      notes: item.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    try {
      await onUpdateEquipment(id, {
        name: editData.name,
        type: editData.type,
        model: editData.model || undefined,
        serialNumber: editData.serialNumber || undefined,
        verificationDate: editData.verificationDate,
        notes: editData.notes || undefined,
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating equipment:', error);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Функции для редактирования примечаний
  const startEditNotes = (item: Equipment) => {
    setEditingNotes(item.id);
    setEditNotesText(item.notes || '');
  };

  const saveNotes = async (id: number) => {
    try {
      await onUpdateEquipment(id, { notes: editNotesText || undefined });
      setEditingNotes(null);
      setEditNotesText('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const cancelEditNotes = () => {
    setEditingNotes(null);
    setEditNotesText('');
  };

  const handleDeleteClick = (item: Equipment) => {
    setDeleteConfirm({ isOpen: true, equipment: item });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.equipment) {
      onDeleteEquipment(deleteConfirm.equipment.id);
      setDeleteConfirm({ isOpen: false, equipment: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, equipment: null });
  };

  if (equipment.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Оборудование не добавлено</p>
        <p className="text-sm mt-1">Нажмите "Новое оборудование" чтобы начать</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((item) => {
          const DeleteIcon = ButtonIcons.Delete.icon;
          const EditIcon = ButtonIcons.Edit.icon;
          const isEditing = editingId === item.id;
          const isExpanded = expandedId === item.id;
          const isEditingNotes = editingNotes === item.id;
          
          const overdue = isOverdue(item.verificationDate);
          const expiringSoon = isExpiringSoon(item.verificationDate);
          const daysLeft = Math.ceil((item.verificationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md bg-white"
            >
              <div className="p-4">
                {isEditing ? (
                  // Режим редактирования
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
                        onChange={(e) => updateEditField('type', e.target.value as EquipmentType)}
                        className="w-full mt-1 h-9 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      >
                        {equipmentTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">Модель</Label>
                        <Input
                          value={editData.model}
                          onChange={(e) => updateEditField('model', e.target.value)}
                          className="mt-1 h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Серийный номер</Label>
                        <Input
                          value={editData.serialNumber}
                          onChange={(e) => updateEditField('serialNumber', e.target.value)}
                          className="mt-1 h-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Дата поверки</Label>
                      <DatePicker
                        value={editData.verificationDate}
                        onChange={(date) => date && updateEditField('verificationDate', date)}
                      />
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
                        onClick={() => saveEdit(item.id)}
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
                  // Режим просмотра
                  <>
                    {/* Заголовок с названием и кнопками */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`flex-shrink-0 ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.type}
                          </span>
                          {item.model && (
                            <span className="text-xs text-gray-400">
                              • {item.model}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(item)}
                          className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 border-blue-200"
                          title="Редактировать"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 border-red-200"
                          title="Удалить"
                        >
                          <DeleteIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Серийный номер */}
                    {item.serialNumber && (
                      <div className="text-xs text-gray-500 mb-2">
                        SN: {item.serialNumber}
                      </div>
                    )}

                    {/* Статус поверки - дата */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Поверка: {item.verificationDate.toLocaleDateString('ru-RU')}</span>
                    </div>

                    {/* Статус с иконкой */}
                    <div className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${
                      overdue ? 'text-red-600' : 
                      expiringSoon ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {overdue ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>ПРОСРОЧЕНО</span>
                        </>
                      ) : expiringSoon ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>ОСТАЛОСЬ {daysLeft} дней</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>АКТИВНО</span>
                        </>
                      )}
                    </div>

                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                      Обновлено: {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
                    </div>

                    {/* Кнопка раскрытия примечаний */}
                    {item.notes && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="w-full mt-2 pt-1 text-center text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        {isExpanded ? '▲ Скрыть примечания' : '▼ Показать примечания'}
                      </button>
                    )}

                    {/* Примечания (раскрываются по клику) */}
                    {isExpanded && item.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <StickyNote className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            {isEditingNotes ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editNotesText}
                                  onChange={(e) => setEditNotesText(e.target.value)}
                                  placeholder="Введите примечания..."
                                  rows={3}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => saveNotes(item.id)}
                                    className="gap-1"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                    Сохранить
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditNotes}
                                    className="gap-1"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Отмена
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                                  {item.notes}
                                </p>
                                <button
                                  onClick={() => startEditNotes(item)}
                                  className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-flex items-center gap-1"
                                >
                                  Редактировать
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Удалить оборудование"
        message={`Вы уверены, что хотите удалить оборудование "${deleteConfirm.equipment?.name}"? Это действие нельзя отменить.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="destructive"
      />
    </>
  );
}