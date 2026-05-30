// src/hooks/useCultureStats.ts
import { useMemo } from 'react';
import { ChemicalTreatment, CultureType, ProductType } from '@/types';

export interface CultureStats {
  culture: CultureType;
  totalTreatments: number;
  completedTreatments: number;
  plannedTreatments: number;
  lastTreatment: Date | null;
  nextTreatment: Date | null;
  productsUsed: string[];
  tankMixCount: number;
  tankMixTypes: ProductType[][];
}

export interface TimelineTreatment {
  id: number;
  date: Date;
  products: string[];
  type: ProductType | 'Баковая смесь';
  completed: boolean;
  isTankMix: boolean;
  tankMixTypes: ProductType[];
  notes?: string;
}

export interface TreatmentTimeline {
  culture: CultureType;
  treatments: TimelineTreatment[];
}

export interface LastTreatmentDetails {
  id: number;
  date: Date;
  area: number;
  isTankMix: boolean;
  notes?: string;
  chemicalProducts: {
    productName: string;
    type: string;
    ratePerHa: number;
    unit: string;
  }[];
}

export interface ChemicalUsage {
  productId: number;
  productName: string;
  productType: ProductType;
  totalAmount: number;   // сумма ratePerHa * area
  totalArea: number;     // общая площадь, на которой применялся
  treatmentCount: number;
  unit: string;          // л, кг и т.д.
}

export const useCultureStats = (treatments: ChemicalTreatment[]) => {
  const cultureStats = useMemo((): CultureStats[] => {
    const statsMap = new Map<CultureType, Omit<CultureStats, 'culture'>>();
    
    treatments.forEach(treatment => {
      const culture = treatment.culture as CultureType;
      
      if (!statsMap.has(culture)) {
        statsMap.set(culture, {
          totalTreatments: 0,
          completedTreatments: 0,
          plannedTreatments: 0,
          lastTreatment: null,
          nextTreatment: null,
          productsUsed: [],
          tankMixCount: 0,
          tankMixTypes: [],
        });
      }
      
      const stats = statsMap.get(culture)!;
      stats.totalTreatments++;
      
      // Статус выполнения
      if (treatment.completed) {
        stats.completedTreatments++;
        
        // Последняя выполненная обработка (по actualDate)
        if (treatment.actualDate) {
          const actualDate = new Date(treatment.actualDate);
          if (!stats.lastTreatment || actualDate > stats.lastTreatment) {
            stats.lastTreatment = actualDate;
          }
        }
      } else {
        stats.plannedTreatments++;
        
        // Ближайшая запланированная обработка (по dueDate) - даже если просрочена
        if (treatment.dueDate) {
          const dueDate = new Date(treatment.dueDate);
          if (!stats.nextTreatment || dueDate < stats.nextTreatment) {
            stats.nextTreatment = dueDate;
          }
        }
      }
      
      // Уникальные названия препаратов
      treatment.chemicalProducts?.forEach(product => {
        const productName = product.product?.name;
        if (productName && !stats.productsUsed.includes(productName)) {
          stats.productsUsed.push(productName);
        }
      });

      // Баковая смесь
      if (treatment.isTankMix) {
        stats.tankMixCount++;
        
        const mixTypes = treatment.chemicalProducts
          ?.map(p => p.product?.type)
          .filter((type): type is ProductType => Boolean(type)) || [];
        
        if (mixTypes.length > 0) {
          const sortedMixTypes = [...mixTypes].sort();
          const isDuplicate = stats.tankMixTypes.some(existing => {
            const sortedExisting = [...existing].sort();
            return sortedExisting.length === sortedMixTypes.length &&
              sortedExisting.every((val, idx) => val === sortedMixTypes[idx]);
          });
          
          if (!isDuplicate) {
            stats.tankMixTypes.push(mixTypes);
          }
        }
      }
    });
    
    return Array.from(statsMap.entries())
      .map(([culture, data]) => ({
        culture,
        ...data,
      }))
      .sort((a, b) => b.totalTreatments - a.totalTreatments);
  }, [treatments]);

  const getTimelineData = (culture: CultureType): TreatmentTimeline => {
    const cultureTreatments = treatments.filter(t => t.culture === culture);
    
    const timelineTreatments: TimelineTreatment[] = [];
    
    for (const treatment of cultureTreatments) {
      let treatmentType: ProductType | 'Баковая смесь';
      let tankMixTypes: ProductType[] = [];
      
      if (treatment.isTankMix) {
        treatmentType = 'Баковая смесь';
        tankMixTypes = treatment.chemicalProducts
          ?.map(p => p.product?.type)
          .filter((type): type is ProductType => Boolean(type)) || [];
      } else {
        treatmentType = treatment.chemicalProducts?.[0]?.product?.type || 'удобрение';
      }
      
      const products = treatment.chemicalProducts
        ?.map(p => p.product?.name)
        .filter((name): name is string => Boolean(name)) || [];
      
      if (treatment.completed && treatment.actualDate) {
        timelineTreatments.push({
          id: treatment.id,
          date: new Date(treatment.actualDate),
          products,
          type: treatmentType,
          completed: true,
          isTankMix: treatment.isTankMix,
          tankMixTypes,
          notes: treatment.notes,
        });
      } else if (treatment.dueDate) {
        timelineTreatments.push({
          id: treatment.id,
          date: new Date(treatment.dueDate),
          products,
          type: treatmentType,
          completed: false,
          isTankMix: treatment.isTankMix,
          tankMixTypes,
          notes: treatment.notes,
        });
      }
    }
    
    timelineTreatments.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return {
      culture,
      treatments: timelineTreatments,
    };
  };

  const getLastTreatmentDetails = (culture: CultureType): LastTreatmentDetails | null => {
    const cultureTreatments = treatments.filter(t => 
      t.culture === culture && t.completed === true && t.actualDate
    );
    
    if (cultureTreatments.length === 0) return null;
    
    const lastTreatment = cultureTreatments.reduce((latest, current) => {
      return new Date(current.actualDate!) > new Date(latest.actualDate!) ? current : latest;
    });
    
    return {
      id: lastTreatment.id,
      date: new Date(lastTreatment.actualDate!),
      area: lastTreatment.area,
      isTankMix: lastTreatment.isTankMix,
      notes: lastTreatment.notes,
      chemicalProducts: lastTreatment.chemicalProducts.map(p => ({
        productName: p.product?.name || `ID: ${p.productId}`,
        type: p.product?.type || 'unknown',
        ratePerHa: p.ratePerHa,
        unit: p.unit
      }))
    };
  };

  const getNextTreatmentDetails = (culture: CultureType): LastTreatmentDetails | null => {
    const cultureTreatments = treatments.filter(t => 
      t.culture === culture && 
      t.completed === false && 
      t.dueDate
    );
    
    if (cultureTreatments.length === 0) return null;
    
    const nextTreatment = cultureTreatments.reduce((nearest, current) => {
      return new Date(current.dueDate!) < new Date(nearest.dueDate!) ? current : nearest;
    });
    
    return {
      id: nextTreatment.id,
      date: new Date(nextTreatment.dueDate!),
      area: nextTreatment.area,
      isTankMix: nextTreatment.isTankMix,
      notes: nextTreatment.notes,
      chemicalProducts: nextTreatment.chemicalProducts.map(p => ({
        productName: p.product?.name || `ID: ${p.productId}`,
        type: p.product?.type || 'unknown',
        ratePerHa: p.ratePerHa,
        unit: p.unit
      }))
    };
  };

  // Новая функция: агрегированная статистика по препаратам для конкретной культуры
  const getChemicalsUsage = (culture: CultureType): ChemicalUsage[] => {
    const cultureTreatments = treatments.filter(t => t.culture === culture && t.completed === true);
    const usageMap = new Map<number, ChemicalUsage>();

    for (const treatment of cultureTreatments) {
      const area = treatment.area;
      for (const chem of treatment.chemicalProducts) {
        const product = chem.product;
        if (!product) continue;
        const productId = product.id;
        const rate = chem.ratePerHa;
        const amount = rate * area;

        const existing = usageMap.get(productId);
        if (existing) {
          existing.totalAmount += amount;
          existing.totalArea += area;
          existing.treatmentCount += 1;
        } else {
          usageMap.set(productId, {
            productId,
            productName: product.name,
            productType: product.type,
            totalAmount: amount,
            totalArea: area,
            treatmentCount: 1,
            unit: product.unit,
          });
        }
      }
    }

    // Сортируем по общему расходу (от большего к меньшему)
    return Array.from(usageMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  return {
    cultureStats,
    getTimelineData,
    getLastTreatmentDetails,
    getNextTreatmentDetails,
    getChemicalsUsage, // новый метод
  };
};