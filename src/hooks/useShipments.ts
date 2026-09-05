import { useAppData } from '@/context/AppDataContext';
import { Shipment } from '@/types';
import { useApi } from './useApi';

export const useShipments = () => {
  const { 
    shipments, 
    shipmentsLoading, 
    shipmentsError, 
    refetchShipments: refetch
  } = useAppData();

  return {
    shipments,
    isLoading: shipmentsLoading,
    isLoaded: true,
    error: shipmentsError,
    refetch,
  };
};