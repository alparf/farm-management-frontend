import { useState } from 'react';
import { Equipment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ButtonIcons, ButtonSizes } from '@/components/ui-icons';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

interface EquipmentListProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: number) => void;
}

export function EquipmentList({ equipment, onEdit, onDelete }: EquipmentListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; equipment: Equipment | null }>({
    isOpen: false,
    equipment: null
  });

  const isOverdue = (date: Date) => new Date() > date;
  const isExpiringSoon = (date: Date, daysThreshold: number = 30) => {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setDeleteConfirm({ isOpen: true, equipment });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.equipment) {
      onDelete(deleteConfirm.equipment.id);
      setDeleteConfirm({ isOpen: false, equipment: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, equipment: null });
  };

  // Функция для получения цвета фона по типу оборудования
  const getTypeBackground = (type: string) => {
    const colors: Record<string, string> = {
      'весы': 'bg-orange-50',
      'ph-метр': 'bg-blue-50',
      'термометр': 'bg-red-50',
      'влагоанализатор': 'bg-green-50',
      'анализатор': 'bg-purple-50',
      'дозатор': 'bg-cyan-50',
      'пипетка': 'bg-yellow-50',
      'другое': 'bg-gray-50',
    };
    return colors[type] || 'bg-gray-50';
  };

  // Функция для получения цвета рамки по типу оборудования
  const getTypeBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      'весы': 'border-orange-200',
      'ph-метр': 'border-blue-200',
      'термометр': 'border-red-200',
      'влагоанализатор': 'border-green-200',
      'анализатор': 'border-purple-200',
      'дозатор': 'border-cyan-200',
      'пипетка': 'border-yellow-200',
      'другое': 'border-gray-200',
    };
    return colors[type] || 'border-gray-200';
  };

  if (equipment.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">Оборудование не добавлено</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {equipment.map((item) => {
          const EditIcon = ButtonIcons.Edit.icon;
          const DeleteIcon = ButtonIcons.Delete.icon;
          
          const overdue = isOverdue(item.verificationDate);
          const expiringSoon = isExpiringSoon(item.verificationDate);
          const daysLeft = Math.ceil((item.verificationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card 
              key={item.id} 
              className={`${getTypeBackground(item.type)} ${getTypeBorderColor(item.type)} transition-all hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {overdue ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : expiringSoon ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>Тип: {item.type}</span>
                        {item.model && <span>• Модель: {item.model}</span>}
                      </div>
                      {item.serialNumber && <div>Серийный номер: {item.serialNumber}</div>}
                    </div>
                    
                    <div className={`flex items-center gap-1 text-sm ${
                      overdue ? 'text-red-600 font-medium' : 
                      expiringSoon ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      Поверка до: {item.verificationDate.toLocaleDateString('ru-RU')}
                      {overdue ? (
                        <span className="ml-2 font-medium">(ПРОСРОЧЕНО)</span>
                      ) : expiringSoon ? (
                        <span className="ml-2">(осталось {daysLeft} дней)</span>
                      ) : (
                        <span className="ml-2 text-green-600">(активно)</span>
                      )}
                    </div>
                    
                    {item.notes && (
                      <div className="text-sm text-gray-600">Примечания: {item.notes}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant={ButtonIcons.Edit.variant}
                      size="sm"
                      onClick={() => onEdit(item)}
                      title={ButtonIcons.Edit.title}
                    >
                      <EditIcon className={ButtonIcons.Edit.className} />
                    </Button>
                    <Button 
                      variant={ButtonIcons.Delete.variant}
                      size="sm" 
                      className={`${ButtonIcons.Delete.style}`}
                      onClick={() => handleDeleteClick(item)}
                      title={ButtonIcons.Delete.title}
                    >
                      <DeleteIcon className={ButtonIcons.Delete.className} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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