// src/hooks/useTreatments.ts
import { useState, useEffect } from 'react';
import { ChemicalTreatment } from '@/types';
import { useApi } from './useApi';

export const useTreatments = () => {
  const [treatments, setTreatments] = useState<ChemicalTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBaseUrl } = useApi();

  const fetchTreatments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/treatments`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const processedData = data.map((treatment: any) => ({
        ...treatment,
        area: typeof treatment.area === 'string' 
          ? parseFloat(treatment.area) 
          : Number(treatment.area) || 0,
        createdAt: new Date(treatment.createdAt),
        dueDate: treatment.dueDate ? new Date(treatment.dueDate) : undefined,
        actualDate: treatment.actualDate ? new Date(treatment.actualDate) : undefined,
      }));
      
      setTreatments(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch treatments';
      setError(errorMessage);
      console.error('Error fetching treatments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTreatment = async (treatmentData: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/treatments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      });

      if (!response.ok) {
        let errorMessage = `Ошибка ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            // Убираем возможные символы перевода строки
            errorMessage = errorText.replace(/\n/g, ' ').trim();
          }
        }
        setError(errorMessage);
        return null;
      }

      const newTreatment = await response.json();
      
      const processedTreatment = {
        ...newTreatment,
        area: typeof newTreatment.area === 'string' 
          ? parseFloat(newTreatment.area) 
          : Number(newTreatment.area) || 0,
        createdAt: new Date(newTreatment.createdAt),
        dueDate: newTreatment.dueDate ? new Date(newTreatment.dueDate) : undefined,
        actualDate: newTreatment.actualDate ? new Date(newTreatment.actualDate) : undefined,
      };

      setTreatments(prev => [...prev, processedTreatment]);
      setError(null);
      return processedTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add treatment';
      setError(errorMessage);
      return null;
    }
  };

  const updateTreatment = async (id: number, updates: Partial<ChemicalTreatment>) => {
    try {
      const baseUrl = getBaseUrl();
      
      const preparedUpdates: any = { ...updates };
      
      if (preparedUpdates.chemicalProducts) {
        preparedUpdates.chemicalProducts = preparedUpdates.chemicalProducts.map((p: any) => ({
          productId: p.productId,
          ratePerHa: typeof p.ratePerHa === 'string' ? parseFloat(p.ratePerHa) : p.ratePerHa,
          unit: p.unit
        }));
      }
      
      const response = await fetch(`${baseUrl}/treatments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preparedUpdates),
      });

      if (!response.ok) {
        let errorMessage = `Ошибка ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.replace(/\n/g, ' ').trim();
          }
        }
        setError(errorMessage);
        return null;
      }

      const updatedTreatment = await response.json();
      
      const processedTreatment = {
        ...updatedTreatment,
        area: typeof updatedTreatment.area === 'string' 
          ? parseFloat(updatedTreatment.area) 
          : Number(updatedTreatment.area) || 0,
        createdAt: new Date(updatedTreatment.createdAt),
        dueDate: updatedTreatment.dueDate ? new Date(updatedTreatment.dueDate) : undefined,
        actualDate: updatedTreatment.actualDate ? new Date(updatedTreatment.actualDate) : undefined,
      };

      setTreatments(prev => 
        prev.map(treatment => 
          treatment.id === id ? processedTreatment : treatment
        )
      );
      setError(null);
      return processedTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update treatment';
      setError(errorMessage);
      return null;
    }
  };

  const completeTreatment = async (id: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/treatments/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Ошибка ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.replace(/\n/g, ' ').trim();
          }
        }
        setError(errorMessage);
        return null;
      }

      const updatedTreatment = await response.json();
      
      const processedTreatment = {
        ...updatedTreatment,
        area: typeof updatedTreatment.area === 'string' 
          ? parseFloat(updatedTreatment.area) 
          : Number(updatedTreatment.area) || 0,
        createdAt: new Date(updatedTreatment.createdAt),
        dueDate: updatedTreatment.dueDate ? new Date(updatedTreatment.dueDate) : undefined,
        actualDate: updatedTreatment.actualDate ? new Date(updatedTreatment.actualDate) : undefined,
      };

      setTreatments(prev => 
        prev.map(treatment => 
          treatment.id === id ? processedTreatment : treatment
        )
      );
      setError(null);
      return processedTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete treatment';
      setError(errorMessage);
      return null;
    }
  };

  const uncompleteTreatment = async (id: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/treatments/${id}/uncomplete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `Ошибка ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.replace(/\n/g, ' ').trim();
          }
        }
        setError(errorMessage);
        return null;
      }

      const updatedTreatment = await response.json();
      
      const processedTreatment = {
        ...updatedTreatment,
        area: typeof updatedTreatment.area === 'string' 
          ? parseFloat(updatedTreatment.area) 
          : Number(updatedTreatment.area) || 0,
        createdAt: new Date(updatedTreatment.createdAt),
        dueDate: updatedTreatment.dueDate ? new Date(updatedTreatment.dueDate) : undefined,
        actualDate: updatedTreatment.actualDate ? new Date(updatedTreatment.actualDate) : undefined,
      };

      setTreatments(prev => 
        prev.map(treatment => 
          treatment.id === id ? processedTreatment : treatment
        )
      );
      setError(null);
      return processedTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to uncomplete treatment';
      setError(errorMessage);
      return null;
    }
  };

  const deleteTreatment = async (id: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/treatments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = `Ошибка ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.replace(/\n/g, ' ').trim();
          }
        }
        setError(errorMessage);
        return;
      }

      setTreatments(prev => prev.filter(treatment => treatment.id !== id));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete treatment';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  return {
    treatments,
    isLoading,
    error,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    completeTreatment,
    uncompleteTreatment,
    refetch: fetchTreatments,
  };
};