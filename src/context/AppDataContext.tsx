'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useApi } from '@/hooks/useApi';
import { Shipment, Treatment, ProductInventory, Vehicle, Equipment, MaintenanceRecord } from '@/types';

interface AppDataContextType {
  // Данные
  shipments: Shipment[];
  treatments: Treatment[];
  inventory: ProductInventory[];
  vehicles: Vehicle[];
  equipment: Equipment[];
  maintenance: MaintenanceRecord[];
  
  // Состояния загрузки
  shipmentsLoading: boolean;
  treatmentsLoading: boolean;
  inventoryLoading: boolean;
  vehiclesLoading: boolean;
  equipmentLoading: boolean;
  maintenanceLoading: boolean;
  
  // Состояния ошибок
  shipmentsError: string | null;
  treatmentsError: string | null;
  inventoryError: string | null;
  vehiclesError: string | null;
  equipmentError: string | null;
  maintenanceError: string | null;
  
  // CRUD операции
  refetchShipments: () => Promise<void>;
  refetchTreatments: () => Promise<void>;
  refetchInventory: () => Promise<void>;
  refetchVehicles: () => Promise<void>;
  refetchEquipment: () => Promise<void>;
  refetchMaintenance: () => Promise<void>;
  
  addShipment: (data: any) => Promise<void>;
  updateShipment: (id: number, data: any) => Promise<void>;
  deleteShipment: (id: number) => Promise<void>;

  addTreatment: (data: any) => Promise<void>;
  updateTreatment: (id: number, data: any) => Promise<void>;
  deleteTreatment: (id: number) => Promise<void>;
  completeTreatment: (id: number) => Promise<void>;
  uncompleteTreatment: (id: number) => Promise<void>;

  addInventory: (data: any) => Promise<void>;
  updateInventory: (id: number, data: any) => Promise<void>;
  deleteInventory: (id: number) => Promise<void>;

  addVehicle: (data: any) => Promise<void>;
  updateVehicle: (id: number, data: any) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;

  addEquipment: (data: any) => Promise<void>;
  updateEquipment: (id: number, data: any) => Promise<void>;
  deleteEquipment: (id: number) => Promise<void>;

  addMaintenance: (data: any) => Promise<void>;
  updateMaintenance: (id: number, data: any) => Promise<void>;
  deleteMaintenance: (id: number) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { getBaseUrl } = useApi();
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [treatmentsLoading, setTreatmentsLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  
  const [shipmentsError, setShipmentsError] = useState<string | null>(null);
  const [treatmentsError, setTreatmentsError] = useState<string | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [equipmentError, setEquipmentError] = useState<string | null>(null);
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  // ============ FETCH FUNCTIONS ============
  const fetchShipments = useCallback(async () => {
    setShipmentsLoading(true);
    setShipmentsError(null);
    try {
      const res = await fetch(`${getBaseUrl()}/shipments`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setShipments(data.map((s: any) => ({ ...s, date: new Date(s.date), createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) })));
    } catch (err) {
      setShipmentsError(err instanceof Error ? err.message : 'Failed to fetch shipments');
    } finally {
      setShipmentsLoading(false);
    }
  }, [getBaseUrl]);

  const fetchTreatments = useCallback(async () => {
    setTreatmentsLoading(true);
    setTreatmentsError(null);
    try {
      const res = await fetch(`${getBaseUrl()}/treatments`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTreatments(data.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt), dueDate: t.dueDate ? new Date(t.dueDate) : undefined, actualDate: t.actualDate ? new Date(t.actualDate) : undefined })));
    } catch (err) {
      setTreatmentsError(err instanceof Error ? err.message : 'Failed to fetch treatments');
    } finally {
      setTreatmentsLoading(false);
    }
  }, [getBaseUrl]);

  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const res = await fetch(`${getBaseUrl()}/inventory`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setInventory(data.map((p: any) => ({ ...p, quantity: Number(p.quantity) || 0, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })));
    } catch (err) {
      setInventoryError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setInventoryLoading(false);
    }
  }, [getBaseUrl]);

  const fetchVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    setVehiclesError(null);
    try {
      const res = await fetch(`${getBaseUrl()}/vehicles`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setVehicles(data.map((v: any) => ({ ...v, createdAt: new Date(v.createdAt), updatedAt: new Date(v.updatedAt), insuranceDate: v.insuranceDate ? new Date(v.insuranceDate) : undefined, roadLegalUntil: v.roadLegalUntil ? new Date(v.roadLegalUntil) : undefined })));
    } catch (err) {
      setVehiclesError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setVehiclesLoading(false);
    }
  }, [getBaseUrl]);

  const fetchEquipment = useCallback(async () => {
    setEquipmentLoading(true);
    setEquipmentError(null);
    try {
      const res = await fetch(`${getBaseUrl()}/equipment`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setEquipment(data.map((e: any) => ({ ...e, verificationDate: new Date(e.verificationDate), createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt) })));
    } catch (err) {
      setEquipmentError(err instanceof Error ? err.message : 'Failed to fetch equipment');
    } finally {
      setEquipmentLoading(false);
    }
  }, [getBaseUrl]);

  const fetchMaintenance = useCallback(async () => {
    setMaintenanceLoading(true);
    setMaintenanceError(null);
    try {
      const res = await fetch(`${getBaseUrl()}/maintenance`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMaintenance(data.map((m: any) => ({ ...m, date: new Date(m.date), createdAt: new Date(m.createdAt) })));
    } catch (err) {
      setMaintenanceError(err instanceof Error ? err.message : 'Failed to fetch maintenance');
    } finally {
      setMaintenanceLoading(false);
    }
  }, [getBaseUrl]);

  // ============ ИНИЦИАЛИЗАЦИЯ ДАННЫХ ============
  useEffect(() => {
    fetchShipments();
    fetchTreatments();
    fetchInventory();
    fetchVehicles();
    fetchEquipment();
    fetchMaintenance();
  }, [fetchShipments, fetchTreatments, fetchInventory, fetchVehicles, fetchEquipment, fetchMaintenance]);

  // ============ CRUD OPERATIONS ============
  
  // Shipments
  const addShipment = useCallback(async (data: any) => {
    const res = await fetch(`${getBaseUrl()}/shipments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add shipment');
    await fetchShipments();
  }, [getBaseUrl, fetchShipments]);

  const updateShipment = useCallback(async (id: number, data: any) => {
    const res = await fetch(`${getBaseUrl()}/shipments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update shipment');
    await fetchShipments();
  }, [getBaseUrl, fetchShipments]);

  const deleteShipment = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/shipments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete shipment');
    await fetchShipments();
  }, [getBaseUrl, fetchShipments]);

  // Treatments
  const addTreatment = useCallback(async (data: any) => {
    const res = await fetch(`${getBaseUrl()}/treatments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add treatment');
    await fetchTreatments();
  }, [getBaseUrl, fetchTreatments]);

  const updateTreatment = useCallback(async (id: number, data: any) => {
    const res = await fetch(`${getBaseUrl()}/treatments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update treatment');
    await fetchTreatments();
  }, [getBaseUrl, fetchTreatments]);

  const deleteTreatment = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/treatments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete treatment');
    await fetchTreatments();
  }, [getBaseUrl, fetchTreatments]);

  const completeTreatment = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/treatments/${id}/complete`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to complete treatment');
    await fetchTreatments();
  }, [getBaseUrl, fetchTreatments]);

  const uncompleteTreatment = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/treatments/${id}/uncomplete`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to uncomplete treatment');
    await fetchTreatments();
  }, [getBaseUrl, fetchTreatments]);

  // Inventory
  const addInventory = useCallback(async (data: any) => {
    const res = await fetch(`${getBaseUrl()}/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add inventory item');
    await fetchInventory();
  }, [getBaseUrl, fetchInventory]);

  const updateInventory = useCallback(async (id: number, data: any) => {
    const res = await fetch(`${getBaseUrl()}/inventory/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update inventory item');
    await fetchInventory();
  }, [getBaseUrl, fetchInventory]);

  const deleteInventory = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete inventory item');
    await fetchInventory();
  }, [getBaseUrl, fetchInventory]);

  // Vehicles
  const addVehicle = useCallback(async (data: any) => {
    const res = await fetch(`${getBaseUrl()}/vehicles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add vehicle');
    await fetchVehicles();
  }, [getBaseUrl, fetchVehicles]);

  const updateVehicle = useCallback(async (id: number, data: any) => {
    const res = await fetch(`${getBaseUrl()}/vehicles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update vehicle');
    await fetchVehicles();
  }, [getBaseUrl, fetchVehicles]);

  const deleteVehicle = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/vehicles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vehicle');
    await fetchVehicles();
  }, [getBaseUrl, fetchVehicles]);

  // Equipment
  const addEquipment = useCallback(async (data: any) => {
    const res = await fetch(`${getBaseUrl()}/equipment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add equipment');
    await fetchEquipment();
  }, [getBaseUrl, fetchEquipment]);

  const updateEquipment = useCallback(async (id: number, data: any) => {
    const res = await fetch(`${getBaseUrl()}/equipment/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update equipment');
    await fetchEquipment();
  }, [getBaseUrl, fetchEquipment]);

  const deleteEquipment = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/equipment/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete equipment');
    await fetchEquipment();
  }, [getBaseUrl, fetchEquipment]);

  // Maintenance
  const addMaintenance = useCallback(async (data: any) => {
    const res = await fetch(`${getBaseUrl()}/maintenance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to add maintenance record');
    await fetchMaintenance();
  }, [getBaseUrl, fetchMaintenance]);

  const updateMaintenance = useCallback(async (id: number, data: any) => {
    const res = await fetch(`${getBaseUrl()}/maintenance/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed to update maintenance record');
    await fetchMaintenance();
  }, [getBaseUrl, fetchMaintenance]);

  const deleteMaintenance = useCallback(async (id: number) => {
    const res = await fetch(`${getBaseUrl()}/maintenance/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete maintenance record');
    await fetchMaintenance();
  }, [getBaseUrl, fetchMaintenance]);

  return (
    <AppDataContext.Provider
      value={{
        shipments, treatments, inventory, vehicles, equipment, maintenance,
        shipmentsLoading, treatmentsLoading, inventoryLoading, vehiclesLoading, equipmentLoading, maintenanceLoading,
        shipmentsError, treatmentsError, inventoryError, vehiclesError, equipmentError, maintenanceError,
        refetchShipments: fetchShipments,
        refetchTreatments: fetchTreatments,
        refetchInventory: fetchInventory,
        refetchVehicles: fetchVehicles,
        refetchEquipment: fetchEquipment,
        refetchMaintenance: fetchMaintenance,
        addShipment, updateShipment, deleteShipment,
        addTreatment, updateTreatment, deleteTreatment, completeTreatment, uncompleteTreatment,
        addInventory, updateInventory, deleteInventory,
        addVehicle, updateVehicle, deleteVehicle,
        addEquipment, updateEquipment, deleteEquipment,
        addMaintenance, updateMaintenance, deleteMaintenance,
      }}
    >
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