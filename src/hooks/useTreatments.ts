import { useAppData } from '@/context/AppDataContext';
import { ChemicalTreatment } from '@/types';
import { useApi } from './useApi';

export const useTreatments = () => {
  const { 
    treatments, 
    treatmentsLoading, 
    treatmentsError, 
    refetchTreatments: refetch,
    addTreatment: addTreatmentGlobal,
    updateTreatment: updateTreatmentGlobal,
    deleteTreatment: deleteTreatmentGlobal,
    completeTreatment: completeTreatmentGlobal,
    uncompleteTreatment: uncompleteTreatmentGlobal
  } = useAppData();

  const { getBaseUrl } = useApi();

  // Возвращаем глобальные данные и методы
  return {
    treatments,
    isLoading: treatmentsLoading,
    isLoaded: true, // Данные загружены глобально
    error: treatmentsError,
    addTreatment: addTreatmentGlobal,
    updateTreatment: updateTreatmentGlobal,
    deleteTreatment: deleteTreatmentGlobal,
    completeTreatment: completeTreatmentGlobal,
    uncompleteTreatment: uncompleteTreatmentGlobal,
    refetch,
  };
};