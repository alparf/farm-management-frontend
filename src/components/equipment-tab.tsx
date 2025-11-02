import { useState } from 'react';
import { Equipment } from '@/types';
import { EquipmentList } from './equipment-list';
import { EquipmentForm } from './equipment-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react';

interface EquipmentTabProps {
  equipment: Equipment[];
  onAddEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateEquipment: (id: number, updates: Partial<Equipment>) => Promise<void>;
  onDeleteEquipment: (id: number) => Promise<void>;
}

export function EquipmentTab({ 
  equipment, 
  onAddEquipment, 
  onUpdateEquipment, 
  onDeleteEquipment 
}: EquipmentTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    await onAddEquipment(equipmentData);
    setShowForm(false);
  };

  const handleUpdateEquipment = async (id: number, updates: Partial<Equipment>) => {
    await onUpdateEquipment(id, updates);
    setEditingEquipment(null);
  };

  const handleDeleteEquipment = async (id: number) => {
    try {
      setIsDeleting(true);
      await onDeleteEquipment(id);
    } catch (error) {
      console.error('Error deleting equipment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEquipment(null);
  };

  // Статистика
  const expiredCount = equipment.filter(item => new Date() > item.verificationDate).length;
  const activeCount = equipment.length - expiredCount;

  return (
    <div className="space-y-6">
      {/* Статистика - ОБНОВЛЕННЫЙ БЛОК */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Всего единиц</p>
                <p className="text-2xl font-bold text-blue-800">{equipment.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Активных</p>
                <p className="text-2xl font-bold text-green-800">{activeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${expiredCount > 0 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${expiredCount > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  Просрочено
                </p>
                <p className={`text-2xl font-bold ${expiredCount > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                  {expiredCount}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${expiredCount > 0 ? 'text-red-600' : 'text-orange-600'} opacity-60`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Заголовок и кнопка */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Оборудование</h2>
        <Button 
          onClick={() => setShowForm(true)}
          disabled={isDeleting}
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить оборудование
        </Button>
      </div>

      {/* Формы */}
      {showForm && (
        <EquipmentForm
          onSubmit={handleAddEquipment}
          onCancel={handleCancel}
        />
      )}

      {editingEquipment && (
        <EquipmentForm
          equipment={editingEquipment}
          onSubmit={(data) => handleUpdateEquipment(editingEquipment.id, data)}
          onCancel={handleCancel}
        />
      )}

      {/* Список оборудования */}
      <EquipmentList
        equipment={equipment}
        onEdit={handleEdit}
        onDelete={handleDeleteEquipment}
      />
    </div>
  );
}