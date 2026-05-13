import { useState, useMemo } from 'react';
import { Equipment, EquipmentType } from '@/types';
import { EquipmentList } from './equipment-list';
import { EquipmentForm } from './equipment-form';
import { EquipmentFilters } from './equipment-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, AlertTriangle, CheckCircle, Package } from 'lucide-react';

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

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | ''>('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const handleAddEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    await onAddEquipment(equipmentData);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  // Функции для определения статуса оборудования
  const isOverdue = (date: Date) => new Date() > date;
  const isExpiringSoon = (date: Date, daysThreshold: number = 30) => {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  // Фильтрация оборудования
  const filteredEquipment = useMemo(() => {
    let filtered = equipment.filter(item => {
      // Фильтр по поиску
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Фильтр по типу
      if (typeFilter && item.type !== typeFilter) {
        return false;
      }
      
      // Фильтр по статусу
      if (statusFilter === 'active' && (isOverdue(item.verificationDate) || isExpiringSoon(item.verificationDate))) {
        return false;
      }
      if (statusFilter === 'expiring' && !isExpiringSoon(item.verificationDate)) {
        return false;
      }
      if (statusFilter === 'overdue' && !isOverdue(item.verificationDate)) {
        return false;
      }
      
      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'verificationDate':
          return a.verificationDate.getTime() - b.verificationDate.getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [equipment, searchQuery, typeFilter, statusFilter, sortBy]);

  // Статистика
  const expiredCount = equipment.filter(item => isOverdue(item.verificationDate)).length;
  const expiringSoonCount = equipment.filter(item => 
    !isOverdue(item.verificationDate) && isExpiringSoon(item.verificationDate)
  ).length;
  const activeCount = equipment.length - expiredCount - expiringSoonCount;

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 font-medium">Всего единиц</div>
                <div className="text-lg font-bold text-blue-800">{equipment.length}</div>
              </div>
              <Package className="h-6 w-6 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600 font-medium">Активных</div>
                <div className="text-lg font-bold text-green-800">{activeCount}</div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-yellow-600 font-medium">Скоро истекает</div>
                <div className="text-lg font-bold text-yellow-800">{expiringSoonCount}</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-yellow-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className={`${expiredCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${expiredCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  Просрочено
                </div>
                <div className={`text-lg font-bold ${expiredCount > 0 ? 'text-red-800' : 'text-gray-800'}`}>
                  {expiredCount}
                </div>
              </div>
              <AlertTriangle className={`h-6 w-6 ${expiredCount > 0 ? 'text-red-600' : 'text-gray-500'} opacity-60`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <EquipmentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Заголовок и кнопка */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Оборудование ({filteredEquipment.length} из {equipment.length})
        </h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить оборудование
        </Button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <EquipmentForm
          onSubmit={handleAddEquipment}
          onCancel={handleCancel}
        />
      )}

      {/* Список оборудования - теперь с inline-редактированием */}
      <EquipmentList
        equipment={filteredEquipment}
        onUpdateEquipment={onUpdateEquipment}
        onDeleteEquipment={onDeleteEquipment}
      />
    </div>
  );
}