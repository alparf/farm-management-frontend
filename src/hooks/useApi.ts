// src/hooks/useApi.ts
export const useApi = () => {
  const getBaseUrl = (): string => {
    return 'http://localhost:3000';
  };

  return { getBaseUrl };
};