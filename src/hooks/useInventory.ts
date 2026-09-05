import { useAppData } from '@/context/AppDataContext';
import { ProductInventory } from '@/types';
import { useApi } from './useApi';

export const useInventory = () => {
  const { 
    inventory, 
    inventoryLoading, 
    inventoryError, 
    refetchInventory: refetch,
    addInventory: addProductGlobal,
    updateInventory: updateProductGlobal,
    deleteInventory: deleteProductGlobal
  } = useAppData();

  const { getBaseUrl } = useApi();

  return {
    inventory,
    isLoading: inventoryLoading,
    isLoaded: true,
    error: inventoryError,
    addProduct: addProductGlobal,
    updateProduct: updateProductGlobal,
    deleteProduct: deleteProductGlobal,
    refetch,
  };
};