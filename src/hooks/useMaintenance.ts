import { useAppData } from '@/context/AppDataContext';
import { MaintenanceRecord } from '@/types';
import { useApi } from './useApi';

export const useMaintenance = () => {
  const { 
    maintenance, 
    maintenanceLoading, 
    maintenanceError, 
    refetchMaintenance: refetch,
    addMaintenance: addMaintenanceGlobal,
    updateMaintenance: updateMaintenanceGlobal,
    deleteMaintenance: deleteMaintenanceGlobal
  } = useAppData();

  return {
    maintenance,
    isLoading: maintenanceLoading,
    isLoaded: true,
    error: maintenanceError,
    addMaintenance: addMaintenanceGlobal,
    updateMaintenance: updateMaintenanceGlobal,
    deleteMaintenance: deleteMaintenanceGlobal,
    refetch,
  };
};