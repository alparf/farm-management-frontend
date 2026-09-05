import { useAppData } from '@/context/AppDataContext';
import { Vehicle } from '@/types';
import { useApi } from './useApi';

export const useVehicles = () => {
  const { 
    vehicles, 
    vehiclesLoading, 
    vehiclesError, 
    refetchVehicles: refetch,
    addVehicle: addVehicleGlobal,
    updateVehicle: updateVehicleGlobal,
    deleteVehicle: deleteVehicleGlobal
  } = useAppData();

  const { getBaseUrl } = useApi();

  return {
    vehicles,
    isLoading: vehiclesLoading,
    isLoaded: true,
    error: vehiclesError,
    addVehicle: addVehicleGlobal,
    updateVehicle: updateVehicleGlobal,
    deleteVehicle: deleteVehicleGlobal,
    refetch,
  };
};