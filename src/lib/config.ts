const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Если на клиенте - используем тот же хост, но порт 3000
    const hostname = window.location.hostname;
    return `http://${hostname}:3000`;
  }
  // Если на сервере - используем localhost
  return 'http://localhost:3000';
};

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || getApiBaseUrl(),
  timeout: 10000,
};

export const ENDPOINTS = {
  treatments: '/treatments',
  inventory: '/inventory', 
  vehicles: '/vehicles',
  maintenance: '/maintenance',
  analytics: '/analytics',
};