'use client';

import { useState, useEffect } from 'react';
import { ChemicalTreatment } from '@/types';
import { fetchTreatments, createTreatment, updateTreatment, deleteTreatment } from '@/lib/api';

export function useTreatments() {
  const [treatments, setTreatments] = useState<ChemicalTreatment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTreatments();
      setTreatments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treatments');
      console.error('Error loading treatments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTreatment = async (treatmentData: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newTreatment = await createTreatment(treatmentData);
      setTreatments(prev => [...prev, newTreatment]);
      return newTreatment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create treatment';
      setError(message);
      throw err;
    }
  };

  const updateTreatmentItem = async (id: number, updates: Partial<ChemicalTreatment>) => {
    try {
      setError(null);
      await updateTreatment(id, updates);
      setTreatments(prev =>
        prev.map(treatment =>
          treatment.id === id ? { ...treatment, ...updates } : treatment
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update treatment';
      setError(message);
      throw err;
    }
  };

  const deleteTreatmentItem = async (id: number) => {
    try {
      setError(null);
      await deleteTreatment(id);
      setTreatments(prev => prev.filter(treatment => treatment.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete treatment';
      setError(message);
      throw err;
    }
  };

  return {
    treatments,
    isLoading,
    error,
    addTreatment,
    updateTreatment: updateTreatmentItem,
    deleteTreatment: deleteTreatmentItem,
    refetch: loadTreatments,
  };
}