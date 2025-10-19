'use client';

import { useMemo } from 'react';
import { ChemicalTreatment, CultureStats, TreatmentTimeline } from '@/types';

export function useCultureStats(treatments: ChemicalTreatment[]) {
  const cultureStats = useMemo((): CultureStats[] => {
    const cultures = [...new Set(treatments.map(t => t.culture))];
    
    return cultures.map(culture => {
      const cultureTreatments = treatments.filter(t => t.culture === culture);
      const completedTreatments = cultureTreatments.filter(t => t.completed);
      const lastTreatment = completedTreatments
        .filter(t => t.actualDate)
        .sort((a, b) => new Date(b.actualDate!).getTime() - new Date(a.actualDate!).getTime())[0]?.actualDate;

      const productsUsed = Array.from(
        new Set(
          cultureTreatments.flatMap(t => 
            t.chemicalProducts.map(p => p.name)
          )
        )
      );

      return {
        culture,
        totalTreatments: cultureTreatments.length,
        completedTreatments: completedTreatments.length,
        lastTreatment,
        productsUsed: productsUsed.slice(0, 5), // Берем первые 5 препаратов
      };
    });
  }, [treatments]);

  const getTimelineData = (culture: string): TreatmentTimeline => {
    const nineMonthsAgo = new Date();
    nineMonthsAgo.setMonth(nineMonthsAgo.getMonth() - 9);

    const cultureTreatments = treatments
      .filter(t => t.culture === culture && t.actualDate && t.actualDate >= nineMonthsAgo)
      .sort((a, b) => new Date(a.actualDate!).getTime() - new Date(b.actualDate!).getTime());

    return {
      culture: culture as any,
      treatments: cultureTreatments.map(treatment => ({
        id: treatment.id,
        date: treatment.actualDate!,
        products: treatment.chemicalProducts.map(p => p.name),
        type: treatment.chemicalProducts[0]?.productType || 'другое',
        completed: treatment.completed,
      }))
    };
  };

  return { cultureStats, getTimelineData };
}