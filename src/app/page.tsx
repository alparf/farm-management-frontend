'use client';

import { useState, useMemo } from 'react';
import { ChemicalTreatment } from '@/types';
import { TreatmentForm } from '@/components/treatment-form';
import { TreatmentList } from '@/components/treatment-list';
import { Stats } from '@/components/stats';
import { FilterSort } from '@/components/filter-sort';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const [treatments, setTreatments] = useState<ChemicalTreatment[]>([]);
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

  const addTreatment = (treatment: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => {
    const newTreatment: ChemicalTreatment = {
      ...treatment,
      id: Date.now(),
      createdAt: new Date(),
    };
    setTreatments(prev => [...prev, newTreatment]);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Учет химических обработок</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Новая обработка
        </Button>
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
          onSubmit={addTreatment}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Список обработок */}
      <TreatmentList 
        treatments={filteredTreatments}
        onUpdate={setTreatments}
      />
    </div>
  );
}