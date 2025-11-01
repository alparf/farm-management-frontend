import { useState, useEffect } from 'react';
import { Equipment } from '@/types';
import { useApi } from './useApi';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBaseUrl } = useApi();

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/equipment`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем строки дат в Date объекты
      const processedData = data.map((item: any) => ({
        ...item,
        verificationDate: new Date(item.verificationDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
      
      setEquipment(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch equipment';
      setError(errorMessage);
      console.error('Error fetching equipment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newEquipment = await response.json();
      const processedEquipment = {
        ...newEquipment,
        verificationDate: new Date(newEquipment.verificationDate),
        createdAt: new Date(newEquipment.createdAt),
        updatedAt: new Date(newEquipment.updatedAt),
      };

      setEquipment(prev => [...prev, processedEquipment]);
      return processedEquipment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add equipment';
      setError(errorMessage);
      throw err;
    }
  };

  const updateEquipment = async (id: number, updates: Partial<Equipment>) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/equipment/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedEquipment = await response.json();
      const processedEquipment = {
        ...updatedEquipment,
        verificationDate: new Date(updatedEquipment.verificationDate),
        createdAt: new Date(updatedEquipment.createdAt),
        updatedAt: new Date(updatedEquipment.updatedAt),
      };

      setEquipment(prev => 
        prev.map(item => item.id === id ? processedEquipment : item)
      );
      
      return processedEquipment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update equipment';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteEquipment = async (id: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/equipment/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete equipment';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    isLoading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    refetch: fetchEquipment,
  };
};