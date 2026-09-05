'use client';

import { useState } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { useInventory } from '@/hooks/useInventory';
import { useTreatmentFilters } from '@/hooks/useTreatmentFilters';
import { CompactTreatmentList } from './treatments-list';
import { TreatmentForm } from './treatments-form';
import { Stats } from './treatments-stats';
import { FilterSort } from './treatments-filters';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/common';
import { generateTreatmentsReport } from '@/utils/reportTreatments';

function TreatmentsTab() {
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [cultureFilter, setCultureFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDateDesc');

  const { treatments, isLoading, error, addTreatment, updateTreatment, deleteTreatment, completeTreatment, uncompleteTreatment, refetch } = useTreatments();
  const { inventory } = useInventory();

  const applyCultureFilter = (culture: string) => {
    setCultureFilter(culture);
    setSearchQuery('');
    setProductTypeFilter('');
  };

  const filteredTreatments = useTreatmentFilters({
    treatments,
    cultureFilter,
    productTypeFilter,
    searchQuery,
    sortBy,
  });

  const handleAddTreatment = async (treatmentData: any) => {
    await addTreatment(treatmentData);
    setShowTreatmentForm(false);
  };

  const handleGenerateReport = () => {
    generateTreatmentsReport({
      treatments: filteredTreatments,
      inventory,
      filters: { searchQuery, cultureFilter, productTypeFilter, sortBy },
    });
  };

  if (isLoading) return <div className="text-center py-8">Загрузка обработок...</div>;

  return (
    <>
      {error && <ErrorState error={error} onRetry={refetch} />}
      
      <Stats 
        treatments={treatments} 
        onCultureClick={applyCultureFilter}
      />

      <FilterSort
        cultureFilter={cultureFilter}
        onCultureFilterChange={setCultureFilter}
        productTypeFilter={productTypeFilter}
        onProductTypeFilterChange={setProductTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onGenerateReport={handleGenerateReport}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Обработки ({filteredTreatments.length} из {treatments.length})</h2>
        <Button onClick={() => setShowTreatmentForm(true)}>Новая обработка</Button>
      </div>

      {showTreatmentForm && (
        <TreatmentForm
          onSubmit={handleAddTreatment}
          onCancel={() => setShowTreatmentForm(false)}
          inventory={inventory}
        />
      )}

      <CompactTreatmentList
        treatments={filteredTreatments}
        onUpdateTreatment={updateTreatment}
        onDeleteTreatment={deleteTreatment}
        onCompleteTreatment={completeTreatment}
        onUncompleteTreatment={uncompleteTreatment}
      />
    </>
  );
}

export default TreatmentsTab;