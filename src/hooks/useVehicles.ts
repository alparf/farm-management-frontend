'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/api';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
      console.error('Error loading vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newVehicle = await createVehicle(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create vehicle';
      setError(message);
      throw err;
    }
  };

  const updateVehicleItem = async (id: number, updates: Partial<Vehicle>) => {
    try {
      setError(null);
      await updateVehicle(id, updates);
      setVehicles(prev =>
        prev.map(vehicle =>
          vehicle.id === id ? { ...vehicle, ...updates, updatedAt: new Date() } : vehicle
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update vehicle';
      setError(message);
      throw err;
    }
  };

  const deleteVehicleItem = async (id: number) => {
    try {
      setError(null);
      await deleteVehicle(id);
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vehicle';
      setError(message);
      throw err;
    }
  };

  return {
    vehicles,
    isLoading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: loadVehicles,
  };
}