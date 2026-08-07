import { ProductInventory, ProductType } from '@/types';
import { Shield, Bug, Flower2, Droplets, TrendingUp, Sprout, Leaf, Beaker, Package, AlertTriangle, PackageX } from 'lucide-react';

export const getTypeIconAndColor = (type: ProductType) => {
  const types: Record<string, { icon: React.ReactNode; textColor: string }> = {
    'фунгицид': { icon: <Shield className="h-4 w-4" />, textColor: 'text-purple-600' },
    'инсектицид': { icon: <Bug className="h-4 w-4" />, textColor: 'text-red-600' },
    'гербицид': { icon: <Flower2 className="h-4 w-4" />, textColor: 'text-orange-600' },
    'десикант': { icon: <Droplets className="h-4 w-4" />, textColor: 'text-yellow-600' },
    'регулятор роста': { icon: <TrendingUp className="h-4 w-4" />, textColor: 'text-green-600' },
    'удобрение': { icon: <Sprout className="h-4 w-4" />, textColor: 'text-blue-600' },
    'биопрепарат': { icon: <Leaf className="h-4 w-4" />, textColor: 'text-teal-600' },
    'адъювант': { icon: <Beaker className="h-4 w-4" />, textColor: 'text-gray-600' }
  };
  return types[type] || { icon: <Package className="h-4 w-4" />, textColor: 'text-gray-600' };
};

export const getStockStatus = (quantity: number) => {
  if (quantity === 0) {
    return { status: 'out', icon: PackageX, color: 'text-red-500', text: 'Нет в наличии' };
  } else if (quantity <= 5) {
    return { status: 'low', icon: AlertTriangle, color: 'text-yellow-500', text: 'Низкий запас' };
  } else {
    return { status: 'normal', icon: Package, color: 'text-green-500', text: '' };
  }
};