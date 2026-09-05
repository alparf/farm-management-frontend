import { useAppData } from '@/context/AppDataContext';
import { Equipment } from '@/types';
import { useApi } from './useApi';

export const useEquipment = () => {
  const { 
    equipment, 
    equipmentLoading, 
    equipmentError, 
    refetchEquipment: refetch,
    addEquipment: addEquipmentGlobal,
    updateEquipment: updateEquipmentGlobal,
    deleteEquipment: deleteEquipmentGlobal
  } = useAppData();

  const { getBaseUrl } = useApi();

  return {
    equipment,
    isLoading: equipmentLoading,
    isLoaded: true,
    error: equipmentError,
    addEquipment: addEquipmentGlobal,
    updateEquipment: updateEquipmentGlobal,
    deleteEquipment: deleteEquipmentGlobal,
    refetch,
  };
};