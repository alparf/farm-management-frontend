'use client';

import { useState, useMemo } from 'react';
import { useEquipment } from '@/hooks/useEquipment';
import { Equipment, EquipmentType } from '@/types';
import { EquipmentList } from './equipment-list';
import { EquipmentForm } from './equipment-form';
import { EquipmentFilters } from './equipment-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export function EquipmentTab() {
  const { equipment, isLoading, error, addEquipment, updateEquipment, deleteEquipment, refetch } = useEquipment();
  
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | ''>('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const handleAddEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addEquipment(equipmentData);
    setShowForm(false);
    refetch();
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const isOverdue = (date: Date) => new Date() > date;
  const isExpiringSoon = (date: Date, daysThreshold: number = 30) => {
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff > 0 && daysDiff <= daysThreshold;
  };

  // Функции для применения фильтров при клике на карточку статистики
  const applyStatusFilter = (filter: string) => {
    setStatusFilter(filter);
    setSearchQuery('');
    setTypeFilter('');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStatusFilter('all');
  };

  const filteredEquipment = useMemo(() => {
    let filtered = equipment.filter(item => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (typeFilter && item.type !== typeFilter) {
        return false;
      }
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

  const expiredCount = equipment.filter(item => isOverdue(item.verificationDate)).length;
  const expiringSoonCount = equipment.filter(item => 
    !isOverdue(item.verificationDate) && isExpiringSoon(item.verificationDate)
  ).length;
  const activeCount = equipment.length - expiredCount - expiringSoonCount;

  if (isLoading) return <div className="text-center py-8">Загрузка оборудования...</div>;

  return (
    <div className="space-y-6">
      {/* Статистика - кликабельные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Всего единиц */}
        <Card 
          className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={clearAllFilters}
        >
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

        {/* Активных */}
        <Card 
          className="bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => applyStatusFilter('active')}
        >
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

        {/* Скоро истекает */}
        <Card 
          className={`${expiringSoonCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => {
            if (expiringSoonCount > 0) {
              applyStatusFilter('expiring');
            }
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium ${expiringSoonCount > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                  Скоро истекает
                </div>
                <div className={`text-lg font-bold ${expiringSoonCount > 0 ? 'text-yellow-800' : 'text-gray-800'}`}>
                  {expiringSoonCount}
                </div>
              </div>
              <AlertTriangle className={`h-6 w-6 ${expiringSoonCount > 0 ? 'text-yellow-600' : 'text-gray-500'} opacity-60`} />
            </div>
          </CardContent>
        </Card>

        {/* Просрочено */}
        <Card 
          className={`${expiredCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => {
            if (expiredCount > 0) {
              applyStatusFilter('overdue');
            }
          }}
        >
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Оборудование ({filteredEquipment.length} из {equipment.length})
        </h2>
        <Button onClick={() => setShowForm(true)}>Новое оборудование</Button>
      </div>

      {showForm && (
        <EquipmentForm
          onSubmit={handleAddEquipment}
          onCancel={handleCancel}
        />
      )}

      <EquipmentList
        equipment={filteredEquipment}
        onUpdateEquipment={updateEquipment}
        onDeleteEquipment={deleteEquipment}
      />
    </div>
  );
}