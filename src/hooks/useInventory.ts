// hooks/useInventory.ts
import { useState, useEffect } from 'react';
import { ProductInventory } from '@/types';

const API_BASE_URL = 'http://localhost:3000';

export const useInventory = () => {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/inventory`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем строки дат в Date объекты
      const processedData = data.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      }));
      
      setInventory(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (productData: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newProduct = await response.json();
      
      // Преобразуем даты
      const processedProduct = {
        ...newProduct,
        createdAt: new Date(newProduct.createdAt),
        updatedAt: new Date(newProduct.updatedAt),
      };

      setInventory(prev => [...prev, processedProduct]);
      return processedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: number, updates: Partial<ProductInventory>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProduct = await response.json();
      
      // Преобразуем даты
      const processedProduct = {
        ...updatedProduct,
        createdAt: new Date(updatedProduct.createdAt),
        updatedAt: new Date(updatedProduct.updatedAt),
      };

      setInventory(prev => 
        prev.map(product => 
          product.id === id ? processedProduct : product
        )
      );
      
      return processedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setInventory(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchInventory,
  };
};