import { ChemicalTreatment } from '@/types';

const API_BASE = '/api';

export async function fetchTreatments(): Promise<ChemicalTreatment[]> {
  const response = await fetch(`${API_BASE}/treatments`);
  if (!response.ok) {
    throw new Error('Failed to fetch treatments');
  }
  const data = await response.json();
  
  // Преобразуем строки в Date объекты
  return data.map((treatment: any) => ({
    ...treatment,
    createdAt: new Date(treatment.createdAt),
    dueDate: treatment.dueDate ? new Date(treatment.dueDate) : undefined,
    actualDate: treatment.actualDate ? new Date(treatment.actualDate) : undefined,
  }));
}

export async function createTreatment(
  treatment: Omit<ChemicalTreatment, 'id' | 'createdAt'>
): Promise<ChemicalTreatment> {
  const response = await fetch(`${API_BASE}/treatments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(treatment),
  });

  if (!response.ok) {
    throw new Error('Failed to create treatment');
  }

  const data = await response.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    actualDate: data.actualDate ? new Date(data.actualDate) : undefined,
  };
}

export async function updateTreatment(
  id: number,
  updates: Partial<ChemicalTreatment>
): Promise<void> {
  const response = await fetch(`${API_BASE}/treatments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update treatment');
  }
}

export async function deleteTreatment(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/treatments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete treatment');
  }
}

// Inventory API
export async function fetchInventory(): Promise<ProductInventory[]> {
  const response = await fetch(`${API_BASE}/inventory`);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }
  const data = await response.json();
  
  return data.map((product: any) => ({
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));
}

export async function createInventoryProduct(
  product: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ProductInventory> {
  const response = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error('Failed to create product');
  }

  const data = await response.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function updateInventoryProduct(
  id: number,
  updates: Partial<ProductInventory>
): Promise<void> {
  const response = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update product');
  }
}

export async function deleteInventoryProduct(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
}

// Vehicles API
export async function fetchVehicles(): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE}/vehicles`);
  if (!response.ok) {
    throw new Error('Failed to fetch vehicles');
  }
  const data = await response.json();
  
  return data.map((vehicle: any) => ({
    ...vehicle,
    createdAt: new Date(vehicle.createdAt),
    updatedAt: new Date(vehicle.updatedAt),
  }));
}

export async function createVehicle(
  vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vehicle> {
  const response = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vehicle),
  });

  if (!response.ok) {
    throw new Error('Failed to create vehicle');
  }

  const data = await response.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function updateVehicle(
  id: number,
  updates: Partial<Vehicle>
): Promise<void> {
  const response = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update vehicle');
  }
}

export async function deleteVehicle(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete vehicle');
  }
}

// Maintenance API
export async function fetchMaintenance(): Promise<MaintenanceRecord[]> {
  const response = await fetch(`${API_BASE}/maintenance`);
  if (!response.ok) {
    throw new Error('Failed to fetch maintenance');
  }
  const data = await response.json();
  
  return data.map((record: any) => ({
    ...record,
    date: new Date(record.date),
    createdAt: new Date(record.createdAt),
  }));
}

export async function createMaintenance(
  record: Omit<MaintenanceRecord, 'id' | 'createdAt'>
): Promise<MaintenanceRecord> {
  const response = await fetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error('Failed to create maintenance record');
  }

  const data = await response.json();
  return {
    ...data,
    date: new Date(data.date),
    createdAt: new Date(data.createdAt),
  };
}

export async function updateMaintenance(
  id: number,
  updates: Partial<MaintenanceRecord>
): Promise<void> {
  const response = await fetch(`${API_BASE}/maintenance/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update maintenance record');
  }
}

export async function deleteMaintenance(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/maintenance/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete maintenance record');
  }
}