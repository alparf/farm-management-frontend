'use client';

import { useState, useMemo } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { TreatmentForm } from '@/components/treatment-form';
import { TreatmentList } from '@/components/treatment-list';
import { CompactTreatmentList } from '@/components/compact-treatment-list';
import { MinimalTreatmentList} from '@/components/minimal-treatment-list';
import { Stats } from '@/components/stats';
import { FilterSort } from '@/components/filter-sort';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export default function Home() {
  const { 
    treatments, 
    isLoading, 
    error, 
    addTreatment, 
    updateTreatment,
    deleteTreatment,
    refetch 
  } = useTreatments();
  
  const [showForm, setShowForm] = useState(false);
  
  // Состояния для фильтров
  const [cultureFilter, setCultureFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(false);

  // Фильтрация и сортировка
  const filteredTreatments = useMemo(() => {
    let filtered = treatments.filter(treatment => {
      // Фильтр по выполненности
      if (showCompleted && !treatment.completed) return false;
      
      // Фильтр по культуре
      if (cultureFilter && treatment.culture !== cultureFilter) return false;
      
      // Фильтр по типу препарата
      if (productTypeFilter && 
          !treatment.chemicalProducts.some(p => p.productType === productTypeFilter)) {
        return false;
      }
      
      // Поиск по названию препарата
      if (searchQuery && 
          !treatment.chemicalProducts.some(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )) {
        return false;
      }
      
      return true;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
        case 'createdAt':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'culture':
          return a.culture.localeCompare(b.culture);
        case 'area':
          return b.area - a.area;
        default:
          return 0;
      }
    });

    return filtered;
  }, [treatments, cultureFilter, productTypeFilter, searchQuery, sortBy, showCompleted]);

  const handleAddTreatment = async (treatmentData: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => {
    await addTreatment(treatmentData);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Загрузка обработок...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-red-800 font-medium">Ошибка загрузки</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <Button variant="outline" onClick={refetch}>
              Повторить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Учет химических обработок</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Новая обработка
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <Stats treatments={treatments} />

      {/* Фильтры и сортировка */}
      <FilterSort
        cultureFilter={cultureFilter}
        onCultureFilterChange={setCultureFilter}
        productTypeFilter={productTypeFilter}
        onProductTypeFilterChange={setProductTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
      />

      {/* Форма создания новой обработки */}
      {showForm && (
        <TreatmentForm 
          onSubmit={handleAddTreatment}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Список обработок */}
      <CompactTreatmentList 
        treatments={filteredTreatments}
        onUpdateTreatment={updateTreatment}
        onDeleteTreatment={deleteTreatment}
      />
    </div>
  );
}