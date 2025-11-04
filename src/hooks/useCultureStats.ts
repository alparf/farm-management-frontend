import { useMemo } from 'react';
import { ChemicalTreatment, CultureType, CultureStats, TreatmentTimeline, ProductType } from '@/types';

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
          tankMixCount: 0,
          tankMixTypes: [],
        });
      }
      
      const stats = statsMap.get(culture)!;
      stats.totalTreatments++;
      
      if (treatment.completed) {
        stats.completedTreatments++;
        if (treatment.actualDate) {
          const treatmentDate = new Date(treatment.actualDate);
          if (!stats.lastTreatment || treatmentDate > stats.lastTreatment) {
            stats.lastTreatment = treatmentDate;
          }
        }
      } else {
        stats.plannedTreatments++;
      }
      
      treatment.chemicalProducts?.forEach(product => {
        if (product.name && !stats.productsUsed.includes(product.name)) {
          stats.productsUsed.push(product.name);
        }
      });

      if (treatment.isTankMix) {
        stats.tankMixCount++;
        
        const mixTypes = treatment.chemicalProducts
          ?.map(p => p.productType)
          .filter(Boolean) as ProductType[];
        
        const typesKey = mixTypes.sort().join(',');
        if (!stats.tankMixTypes.some(existing => existing.sort().join(',') === typesKey)) {
          stats.tankMixTypes.push(mixTypes);
        }
      }
    });
    
    return Array.from(statsMap.values()).sort((a, b) => 
      b.totalTreatments - a.totalTreatments
    );
  }, [treatments]);

  const getTimelineData = (culture: CultureType): TreatmentTimeline => {
    const cultureTreatments = treatments.filter(t => t.culture === culture);
    
    const timelineTreatments = cultureTreatments.flatMap(treatment => {
      const treatments = [];
      
      // Определяем тип обработки - используем русское название
      let treatmentType: ProductType | 'Баковая смесь';
      let tankMixTypes: ProductType[] = [];
      
      if (treatment.isTankMix) {
        treatmentType = 'Баковая смесь'; // Используем русское название
        tankMixTypes = treatment.chemicalProducts
          ?.map(p => p.productType)
          .filter(Boolean) as ProductType[];
      } else {
        treatmentType = treatment.chemicalProducts?.[0]?.productType || 'удобрение';
      }
      
      // Добавляем запланированные обработки
      if (treatment.dueDate && !treatment.completed) {
        treatments.push({
          id: treatment.id,
          date: new Date(treatment.dueDate),
          products: treatment.chemicalProducts?.map(p => p.name).filter(Boolean) || [],
          type: treatmentType,
          completed: false,
          isTankMix: treatment.isTankMix,
          tankMixTypes: tankMixTypes,
        });
      }
      
      // Добавляем выполненные обработки
      if (treatment.actualDate && treatment.completed) {
        treatments.push({
          id: treatment.id,
          date: new Date(treatment.actualDate),
          products: treatment.chemicalProducts?.map(p => p.name).filter(Boolean) || [],
          type: treatmentType,
          completed: true,
          isTankMix: treatment.isTankMix,
          tankMixTypes: tankMixTypes,
        });
      }
      
      return treatments;
    });
    
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