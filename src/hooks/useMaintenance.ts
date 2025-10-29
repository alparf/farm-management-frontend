// hooks/useMaintenance.ts
import { useState, useEffect } from 'react';
import { MaintenanceRecord } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useMaintenance = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/maintenance`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем строки дат в Date объекты
      const processedData = data.map((record: any) => ({
        ...record,
        date: new Date(record.date),
        createdAt: new Date(record.createdAt),
      }));
      
      setMaintenance(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch maintenance records';
      setError(errorMessage);
      console.error('Error fetching maintenance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addMaintenance = async (maintenanceData: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newRecord = await response.json();
      
      // Преобразуем даты
      const processedRecord = {
        ...newRecord,
        date: new Date(newRecord.date),
        createdAt: new Date(newRecord.createdAt),
      };

      setMaintenance(prev => [...prev, processedRecord]);
      return processedRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add maintenance record';
      setError(errorMessage);
      throw err;
    }
  };

  const updateMaintenance = async (id: number, updates: Partial<MaintenanceRecord>) => {
    try {
      // Используем PATCH вместо PUT
      const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
        method: 'PATCH', // Изменено с PUT на PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedRecord = await response.json();
      
      // Преобразуем даты
      const processedRecord = {
        ...updatedRecord,
        date: new Date(updatedRecord.date),
        createdAt: new Date(updatedRecord.createdAt),
      };

      setMaintenance(prev => 
        prev.map(record => 
          record.id === id ? processedRecord : record
        )
      );
      
      return processedRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update maintenance record';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteMaintenance = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMaintenance(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete maintenance record';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  return {
    maintenance,
    isLoading,
    error,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    refetch: fetchMaintenance,
  };
};