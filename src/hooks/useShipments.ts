// src/hooks/useShipments.ts
import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useShipments = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBaseUrl } = useApi();

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/shipments`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 useShipments - raw data length:', data?.length);
      
      if (!Array.isArray(data)) {
        throw new Error('Сервер вернул не массив');
      }

      const processedData = data.map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date) : new Date(),
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      }));

      console.log('✅ useShipments - processed data length:', processedData.length);
      setShipments(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shipments';
      setError(errorMessage);
      console.error('❌ useShipments - error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return {
    shipments,
    isLoading,
    error,
    refetch: fetchShipments,
  };
};  