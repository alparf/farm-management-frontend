import { useCallback } from 'react';

export const useApi = () => {
  const getBaseUrl = useCallback((): string => {
    if (typeof window !== 'undefined') {
      return 'http://192.168.100.17:3000';
    }
    return 'http://localhost:3000';
  }, []); // Пустой массив зависимостей = стабильная функция

  return { getBaseUrl };
};