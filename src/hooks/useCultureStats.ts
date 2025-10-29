// hooks/useCultureStats.ts
import { useMemo } from 'react';
import { ChemicalTreatment, CultureType, CultureStats, TreatmentTimeline } from '@/types';

export const useCultureStats = (treatments: ChemicalTreatment[]) => {
  const cultureStats = useMemo(() => {
    const statsMap = new Map<CultureType, CultureStats>();
    
    treatments.forEach(treatment => {
      const culture = treatment.culture as CultureType;
      
      if (!statsMap.has(culture)) {
        statsMap.set(culture, {
          culture,
          totalTreatments: 0,
          completedTreatments: 0,
          plannedTreatments: 0,
          lastTreatment: undefined,
          productsUsed: [],
        });
      }
      
      const stats = statsMap.get(culture)!;
      stats.totalTreatments++;
      
      if (treatment.completed) {
        stats.completedTreatments++;
        // Обновляем последнюю дату выполнения
        if (treatment.actualDate) {
          const treatmentDate = new Date(treatment.actualDate);
          if (!stats.lastTreatment || treatmentDate > stats.lastTreatment) {
            stats.lastTreatment = treatmentDate;
          }
        }
      } else {
        stats.plannedTreatments++;
      }
      
      // Собираем уникальные продукты
      treatment.chemicalProducts?.forEach(product => {
        if (product.name && !stats.productsUsed.includes(product.name)) {
          stats.productsUsed.push(product.name);
        }
      });
    });
    
    return Array.from(statsMap.values()).sort((a, b) => 
      b.totalTreatments - a.totalTreatments
    );
  }, [treatments]);

  const getTimelineData = (culture: CultureType): TreatmentTimeline => {
    const cultureTreatments = treatments.filter(t => t.culture === culture);
    
    const timelineTreatments = cultureTreatments.flatMap(treatment => {
      const treatments = [];
      
      // Добавляем запланированные обработки (если есть dueDate)
      if (treatment.dueDate && !treatment.completed) {
        treatments.push({
          id: treatment.id,
          date: new Date(treatment.dueDate),
          products: treatment.chemicalProducts?.map(p => p.name).filter(Boolean) || [],
          type: treatment.chemicalProducts?.[0]?.productType || 'unknown',
          completed: false,
        });
      }
      
      // Добавляем выполненные обработки (если есть actualDate)
      if (treatment.actualDate && treatment.completed) {
        treatments.push({
          id: treatment.id,
          date: new Date(treatment.actualDate),
          products: treatment.chemicalProducts?.map(p => p.name).filter(Boolean) || [],
          type: treatment.chemicalProducts?.[0]?.productType || 'unknown',
          completed: true,
        });
      }
      
      return treatments;
    });
    
    // Сортируем по дате
    timelineTreatments.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return {
      culture,
      treatments: timelineTreatments,
    };
  };

  return {
    cultureStats,
    getTimelineData,
  };
};