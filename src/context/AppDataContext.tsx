'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useShipments } from '@/hooks/useShipments';
import { useTreatments } from '@/hooks/useTreatments';
import { useInventory } from '@/hooks/useInventory';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useEquipment } from '@/hooks/useEquipment';

interface AppDataContextType {
  shipments: any[];
  shipmentsLoading: boolean;
  shipmentsError: string | null;
  refetchShipments: () => void;
  treatments: any[];
  treatmentsLoading: boolean;
  treatmentsError: string | null;
  refetchTreatments: () => void;
  inventory: any[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  refetchInventory: () => void;
  vehicles: any[];
  vehiclesLoading: boolean;
  vehiclesError: string | null;
  refetchVehicles: () => void;
  maintenance: any[];
  maintenanceLoading: boolean;
  maintenanceError: string | null;
  refetchMaintenance: () => void;
  equipment: any[];
  equipmentLoading: boolean;
  equipmentError: string | null;
  refetchEquipment: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  // Используем локальное состояние для хранения данных
  const [data, setData] = useState({
    shipments: [] as any[],
    shipmentsLoading: true,
    shipmentsError: null as string | null,
    treatments: [] as any[],
    treatmentsLoading: true,
    treatmentsError: null as string | null,
    inventory: [] as any[],
    inventoryLoading: true,
    inventoryError: null as string | null,
    vehicles: [] as any[],
    vehiclesLoading: true,
    vehiclesError: null as string | null,
    maintenance: [] as any[],
    maintenanceLoading: true,
    maintenanceError: null as string | null,
    equipment: [] as any[],
    equipmentLoading: true,
    equipmentError: null as string | null,
  });

  // Загружаем данные через хуки
  const shipmentsHook = useShipments();
  const treatmentsHook = useTreatments();
  const inventoryHook = useInventory();
  const vehiclesHook = useVehicles();
  const maintenanceHook = useMaintenance();
  const equipmentHook = useEquipment();

  // Обновляем состояние при изменении данных из хуков
  useEffect(() => {
    console.log('🔄 AppDataProvider - updating shipments:', shipmentsHook.shipments?.length);
    setData(prev => ({
      ...prev,
      shipments: shipmentsHook.shipments,
      shipmentsLoading: shipmentsHook.isLoading,
      shipmentsError: shipmentsHook.error,
    }));
  }, [shipmentsHook.shipments, shipmentsHook.isLoading, shipmentsHook.error]);

  useEffect(() => {
    setData(prev => ({
      ...prev,
      treatments: treatmentsHook.treatments,
      treatmentsLoading: treatmentsHook.isLoading,
      treatmentsError: treatmentsHook.error,
    }));
  }, [treatmentsHook.treatments, treatmentsHook.isLoading, treatmentsHook.error]);

  useEffect(() => {
    setData(prev => ({
      ...prev,
      inventory: inventoryHook.inventory,
      inventoryLoading: inventoryHook.isLoading,
      inventoryError: inventoryHook.error,
    }));
  }, [inventoryHook.inventory, inventoryHook.isLoading, inventoryHook.error]);

  useEffect(() => {
    setData(prev => ({
      ...prev,
      vehicles: vehiclesHook.vehicles,
      vehiclesLoading: vehiclesHook.isLoading,
      vehiclesError: vehiclesHook.error,
    }));
  }, [vehiclesHook.vehicles, vehiclesHook.isLoading, vehiclesHook.error]);

  useEffect(() => {
    setData(prev => ({
      ...prev,
      maintenance: maintenanceHook.maintenance,
      maintenanceLoading: maintenanceHook.isLoading,
      maintenanceError: maintenanceHook.error,
    }));
  }, [maintenanceHook.maintenance, maintenanceHook.isLoading, maintenanceHook.error]);

  useEffect(() => {
    setData(prev => ({
      ...prev,
      equipment: equipmentHook.equipment,
      equipmentLoading: equipmentHook.isLoading,
      equipmentError: equipmentHook.error,
    }));
  }, [equipmentHook.equipment, equipmentHook.isLoading, equipmentHook.error]);

  const value: AppDataContextType = {
    shipments: data.shipments,
    shipmentsLoading: data.shipmentsLoading,
    shipmentsError: data.shipmentsError,
    refetchShipments: shipmentsHook.refetch,
    treatments: data.treatments,
    treatmentsLoading: data.treatmentsLoading,
    treatmentsError: data.treatmentsError,
    refetchTreatments: treatmentsHook.refetch,
    inventory: data.inventory,
    inventoryLoading: data.inventoryLoading,
    inventoryError: data.inventoryError,
    refetchInventory: inventoryHook.refetch,
    vehicles: data.vehicles,
    vehiclesLoading: data.vehiclesLoading,
    vehiclesError: data.vehiclesError,
    refetchVehicles: vehiclesHook.refetch,
    maintenance: data.maintenance,
    maintenanceLoading: data.maintenanceLoading,
    maintenanceError: data.maintenanceError,
    refetchMaintenance: maintenanceHook.refetch,
    equipment: data.equipment,
    equipmentLoading: data.equipmentLoading,
    equipmentError: data.equipmentError,
    refetchEquipment: equipmentHook.refetch,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}