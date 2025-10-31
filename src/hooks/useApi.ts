export const useApi = () => {
  const getBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return `http://${hostname}:3000`;
    }
    return 'http://localhost:3000';
  };

  return { getBaseUrl };
};