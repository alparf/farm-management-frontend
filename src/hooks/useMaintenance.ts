import { useState, useEffect } from 'react';
import { MaintenanceRecord } from '@/types';
import { useApi } from './useApi';

export const useMaintenance = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBaseUrl } = useApi();

  const fetchMaintenance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/maintenance`);
      
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
      const baseUrl = getBaseUrl();
      
      // Подготавливаем данные для отправки - преобразуем Date в ISO строки
      const payload = {
        ...maintenanceData,
        date: maintenanceData.date.toISOString(), // Преобразуем в ISO строку
        hours: maintenanceData.hours || null,
        notes: maintenanceData.notes || null,
      };

      console.log('Sending maintenance data:', payload);

      const response = await fetch(`${baseUrl}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
      }

      const newRecord = await response.json();
      
      // Преобразуем даты обратно в Date объекты
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
      console.error('Error adding maintenance:', err);
      throw err;
    }
  };

  const updateMaintenance = async (id: number, updates: Partial<MaintenanceRecord>) => {
    try {
      const baseUrl = getBaseUrl();
      
      // Подготавливаем данные для обновления
      const payload: any = { ...updates };
      if (payload.date) payload.date = payload.date.toISOString();
      if (payload.hours === undefined) payload.hours = null;
      if (payload.notes === undefined) payload.notes = null;

      const response = await fetch(`${baseUrl}/maintenance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
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
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/maintenance/${id}`, {
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