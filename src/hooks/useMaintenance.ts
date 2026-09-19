import { useAppData } from '@/context/AppDataContext';

export const useMaintenance = () => {
  const {
    maintenance,
    maintenanceLoading,
    maintenanceError,
    refetchMaintenance: refetch,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    completeMaintenance,
    uncompleteMaintenance,
  } = useAppData();

  return {
    maintenance,
    isLoading: maintenanceLoading,
    isLoaded: true,
    error: maintenanceError,
    addMaintenance,
    updateMaintenance,
    completeMaintenance,
    uncompleteMaintenance,
    deleteMaintenance,
    refetch,
  };
};