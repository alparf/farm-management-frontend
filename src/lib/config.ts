// lib/config.ts
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
};

export const ENDPOINTS = {
  treatments: '/treatments',
  inventory: '/inventory', 
  vehicles: '/vehicles',
  maintenance: '/maintenance',
  analytics: '/analytics',
};