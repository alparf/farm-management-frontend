export const useApi = () => {
  const getBaseUrl = (): string => {
    return 'http://192.168.100.17:3000';
  };

  return { getBaseUrl };
};