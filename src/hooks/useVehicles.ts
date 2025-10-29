// hooks/useVehicles.ts
import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем строки дат в Date объекты
      const processedData = data.map((vehicle: any) => ({
        ...vehicle,
        createdAt: new Date(vehicle.createdAt),
        updatedAt: new Date(vehicle.updatedAt),
        insuranceDate: vehicle.insuranceDate ? new Date(vehicle.insuranceDate) : undefined,
        roadLegalUntil: vehicle.roadLegalUntil ? new Date(vehicle.roadLegalUntil) : undefined,
      }));
      
      setVehicles(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicles';
      setError(errorMessage);
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newVehicle = await response.json();
      
      // Преобразуем даты
      const processedVehicle = {
        ...newVehicle,
        createdAt: new Date(newVehicle.createdAt),
        updatedAt: new Date(newVehicle.updatedAt),
        insuranceDate: newVehicle.insuranceDate ? new Date(newVehicle.insuranceDate) : undefined,
        roadLegalUntil: newVehicle.roadLegalUntil ? new Date(newVehicle.roadLegalUntil) : undefined,
      };

      setVehicles(prev => [...prev, processedVehicle]);
      return processedVehicle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add vehicle';
      setError(errorMessage);
      throw err;
    }
  };

  const updateVehicle = async (id: number, updates: Partial<Vehicle>) => {
    try {
      // Используем PATCH вместо PUT
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PATCH', // Изменено с PUT на PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedVehicle = await response.json();
      
      // Преобразуем даты
      const processedVehicle = {
        ...updatedVehicle,
        createdAt: new Date(updatedVehicle.createdAt),
        updatedAt: new Date(updatedVehicle.updatedAt),
        insuranceDate: updatedVehicle.insuranceDate ? new Date(updatedVehicle.insuranceDate) : undefined,
        roadLegalUntil: updatedVehicle.roadLegalUntil ? new Date(updatedVehicle.roadLegalUntil) : undefined,
      };

      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === id ? processedVehicle : vehicle
        )
      );
      
      return processedVehicle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vehicle';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteVehicle = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vehicle';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    isLoading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles,
  };
};