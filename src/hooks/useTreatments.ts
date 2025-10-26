// hooks/useTreatments.ts (обновленная версия)
import { useState, useEffect } from 'react';
import { ChemicalTreatment } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useTreatments = () => {
  const [treatments, setTreatments] = useState<ChemicalTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatments = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const response = await fetch(`${API_BASE_URL}/treatments`);
    
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

  // ... остальные методы остаются такими же
  const addTreatment = async (treatmentData: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/treatments`, {
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
      
      // Преобразуем даты
      const processedTreatment = {
        ...newTreatment,
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
      const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTreatment = await response.json();
      
      // Преобразуем даты
      const processedTreatment = {
        ...updatedTreatment,
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update treatment';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteTreatment = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/treatments/${id}`, {
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