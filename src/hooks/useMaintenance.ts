'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRecord } from '@/types';
import { fetchMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } from '@/lib/api';

export function useMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMaintenance();
  }, []);

  const loadMaintenance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchMaintenance();
      setMaintenance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance');
      console.error('Error loading maintenance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addMaintenance = async (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newRecord = await createMaintenance(recordData);
      setMaintenance(prev => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create maintenance record';
      setError(message);
      throw err;
    }
  };

  const updateMaintenanceItem = async (id: number, updates: Partial<MaintenanceRecord>) => {
    try {
      setError(null);
      await updateMaintenance(id, updates);
      setMaintenance(prev =>
        prev.map(record =>
          record.id === id ? { ...record, ...updates } : record
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update maintenance record';
      setError(message);
      throw err;
    }
  };

  const deleteMaintenanceItem = async (id: number) => {
    try {
      setError(null);
      await deleteMaintenance(id);
      setMaintenance(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete maintenance record';
      setError(message);
      throw err;
    }
  };

  return {
    maintenance,
    isLoading,
    error,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    refetch: loadMaintenance,
  };
}