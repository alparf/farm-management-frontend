import { useState, useEffect } from 'react';
import { useApi } from './useApi';

// Если у вас есть тип Shipment, импортируйте его, иначе используйте any
export interface Shipment {
  id: number;
  // добавьте другие поля по необходимости
  createdAt: Date;
  updatedAt: Date;
}

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
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
      
      // Проверяем, что пришёл массив
      if (!Array.isArray(data)) {
        throw new Error('Сервер вернул не массив');
      }

      // Преобразуем даты (если есть)
      const processedData = data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        // если есть другие поля с датами, добавьте их
      }));

      setShipments(processedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shipments';
      setError(errorMessage);
      console.error('Error fetching shipments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Можно добавить методы для добавления/обновления/удаления, если нужно
  // Но для счётчика достаточно refetch

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