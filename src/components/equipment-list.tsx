// components/equipment-list.tsx
import { Equipment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, Edit, Trash2 } from 'lucide-react';

interface EquipmentListProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: number) => void;
}

export function EquipmentList({ equipment, onEdit, onDelete }: EquipmentListProps) {
  const isOverdue = (date: Date) => new Date() > date;

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
    <div className="grid gap-4">
      {equipment.map((item) => {
        const overdue = isOverdue(item.verificationDate);
        const daysLeft = Math.ceil((item.verificationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <Card key={item.id} className={overdue ? 'border-red-200 bg-red-50' : daysLeft <= 30 ? 'border-yellow-200 bg-yellow-50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    {overdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>Тип: {item.type}</div>
                    {item.model && <div>Модель: {item.model}</div>}
                    {item.serialNumber && <div>Серийный номер: {item.serialNumber}</div>}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    Поверка до: {item.verificationDate.toLocaleDateString('ru-RU')}
                    {overdue ? (
                      <span className="text-red-600 ml-2 font-medium">(ПРОСРОЧЕНО)</span>
                    ) : daysLeft <= 30 ? (
                      <span className="text-yellow-600 ml-2 font-medium">(осталось {daysLeft} дней)</span>
                    ) : (
                      <span className="text-green-600 ml-2 font-medium">(активно)</span>
                    )}
                  </div>
                  
                  {item.notes && (
                    <div className="text-sm text-gray-600">Примечания: {item.notes}</div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}