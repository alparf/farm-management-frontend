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