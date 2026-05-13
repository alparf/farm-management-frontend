'use client';

import { useMemo } from 'react'; 
import { ProductInventory, ProductType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Bug, 
  Flower2, 
  Droplets, 
  TrendingUp, 
  Sprout, 
  Leaf, 
  Beaker, 
  Package, 
  AlertTriangle, 
  PackageX,
  CheckCircle
} from 'lucide-react';

interface InventoryStatsProps {
  inventory: ProductInventory[];
}

export function InventoryStats({ inventory }: InventoryStatsProps) {
  const stats = useMemo(() => {
    // Общее количество по типам
    const byType = inventory.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Низкий запас (количество > 0 и <= 5) по типам
    const lowStockByType = inventory.reduce((acc, product) => {
      if (product.quantity > 0 && product.quantity <= 5) {
        acc[product.type] = (acc[product.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Отсутствие на складе (количество === 0) по типам
    const outOfStockByType = inventory.reduce((acc, product) => {
      if (product.quantity === 0) {
        acc[product.type] = (acc[product.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { 
      byType,
      lowStockByType,
      outOfStockByType,
    };
  }, [inventory]);

  const getTypeConfig = (type: string) => {
    const types: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string; label: string }> = {
      'фунгицид': { icon: <Shield className="h-4 w-4" />, bgColor: 'bg-purple-50', textColor: 'text-purple-600', label: 'Фунгициды' },
      'инсектицид': { icon: <Bug className="h-4 w-4" />, bgColor: 'bg-red-50', textColor: 'text-red-600', label: 'Инсектициды' },
      'гербицид': { icon: <Flower2 className="h-4 w-4" />, bgColor: 'bg-orange-50', textColor: 'text-orange-600', label: 'Гербициды' },
      'десикант': { icon: <Droplets className="h-4 w-4" />, bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', label: 'Десиканты' },
      'регулятор роста': { icon: <TrendingUp className="h-4 w-4" />, bgColor: 'bg-green-50', textColor: 'text-green-600', label: 'Регуляторы роста' },
      'удобрение': { icon: <Sprout className="h-4 w-4" />, bgColor: 'bg-blue-50', textColor: 'text-blue-600', label: 'Удобрения' },
      'биопрепарат': { icon: <Leaf className="h-4 w-4" />, bgColor: 'bg-teal-50', textColor: 'text-teal-600', label: 'Биопрепараты' },
      'адъювант': { icon: <Beaker className="h-4 w-4" />, bgColor: 'bg-gray-50', textColor: 'text-gray-600', label: 'Адъюванты' }
    };
    return types[type] || { icon: <Package className="h-4 w-4" />, bgColor: 'bg-gray-50', textColor: 'text-gray-600', label: type };
  };

  const productTypes: ProductType[] = [
    'фунгицид', 'инсектицид', 'гербицид', 'десикант',
    'регулятор роста', 'удобрение', 'биопрепарат', 'адъювант'
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {productTypes.map((type) => {
        const config = getTypeConfig(type);
        const total = stats.byType[type] || 0;
        const lowStock = stats.lowStockByType[type] || 0;
        const outOfStock = stats.outOfStockByType[type] || 0;
        
        // Пропускаем типы, которых нет на складе
        if (total === 0 && lowStock === 0 && outOfStock === 0) return null;
        
        return (
          <Card key={type} className={config.bgColor}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${config.textColor}`}>
                  {config.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {config.label}
                </span>
                <span className="text-xs font-bold text-gray-500 ml-auto">
                  {total}
                </span>
              </div>
              
              {/* Статус запасов с текстовым пояснением */}
              <div className="text-xs">
                {outOfStock > 0 && (
                  <div className="flex items-center gap-1.5 text-red-600 mt-1">
                    <PackageX className="h-3 w-3" />
                    <span>Нет в наличии: {outOfStock}</span>
                  </div>
                )}
                {lowStock > 0 && outOfStock === 0 && (
                  <div className="flex items-center gap-1.5 text-yellow-600 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Низкий запас: {lowStock}</span>
                  </div>
                )}
                {lowStock === 0 && outOfStock === 0 && total > 0 && (
                  <div className="flex items-center gap-1.5 text-green-600 mt-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>В наличии</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}