// src/hooks/useTreatmentFilters.ts
import { useMemo } from 'react';

export function useTreatmentFilters({
  treatments,
  cultureFilter,
  productTypeFilter,
  searchQuery,
  sortBy,
}: any) {
  return useMemo(() => {
    let filtered = treatments.filter((treatment: any) => {
      if (cultureFilter && treatment.culture !== cultureFilter) return false;
      if (productTypeFilter) {
        const hasProductType = treatment.chemicalProducts.some((product: any) => {
          return product.product?.type === productTypeFilter;
        });
        if (!hasProductType) return false;
      }
      if (searchQuery) {
        const matchesSearch = treatment.chemicalProducts.some((product: any) => {
          return product.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        });
        if (!matchesSearch) return false;
      }
      return true;
    });

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'dueDate':
          return (a.dueDate ? new Date(a.dueDate).getTime() : 0) - (b.dueDate ? new Date(b.dueDate).getTime() : 0);
        case 'dueDateDesc':
          return (b.dueDate ? new Date(b.dueDate).getTime() : 0) - (a.dueDate ? new Date(a.dueDate).getTime() : 0);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'createdAtAsc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'culture':
          return a.culture.localeCompare(b.culture);
        case 'area':
          return b.area - a.area;
        case 'areaAsc':
          return a.area - b.area;
        case 'status':
          return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
        case 'statusDesc':
          return (a.completed === b.completed) ? 0 : a.completed ? -1 : 1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [treatments, cultureFilter, productTypeFilter, searchQuery, sortBy]);
}