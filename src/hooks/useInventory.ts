'use client';

import { useState, useEffect } from 'react';
import { ProductInventory } from '@/types';
import { fetchInventory, createInventoryProduct, updateInventoryProduct, deleteInventoryProduct } from '@/lib/api';

export function useInventory() {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInventory();
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (productData: Omit<ProductInventory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newProduct = await createInventoryProduct(productData);
      setInventory(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      throw err;
    }
  };

  const updateProduct = async (id: number, updates: Partial<ProductInventory>) => {
    try {
      setError(null);
      await updateInventoryProduct(id, updates);
      setInventory(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...updates, updatedAt: new Date() } : product
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setError(null);
      await deleteInventoryProduct(id);
      setInventory(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      throw err;
    }
  };

  return {
    inventory,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: loadInventory,
  };
}