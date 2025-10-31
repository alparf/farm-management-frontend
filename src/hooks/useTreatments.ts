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
      const url = `${baseUrl}/treatments`;
      console.log('Fetching treatments from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем строки дат в Date объекты и area в числа
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
      const url = `${baseUrl}/treatments`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treatmentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      return processedTreatment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add treatment';
      setError(errorMessage);
      throw err;
    }
  };

  const updateTreatment = async (id: number, updates: Partial<ChemicalTreatment>) => {
    try {
      const baseUrl = getBaseUrl();
      
      if (updates.completed === true && !updates.actualDate) {
        const url = `${baseUrl}/treatments/${id}/complete`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
        
        return processedTreatment;
      } else {
        const url = `${baseUrl}/treatments/${id}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
        
        return processedTreatment;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update treatment';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTreatment = async (id: number) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/treatments/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTreatments(prev => prev.filter(treatment => treatment.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete treatment';
      setError(errorMessage);
      throw err;
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
    refetch: fetchTreatments,
  };
};