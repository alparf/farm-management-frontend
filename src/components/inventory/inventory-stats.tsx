'use client';

import { useMemo } from 'react'; 
import { ProductInventory } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Shield, 
  Bug, 
  Flower2, 
  Droplets, 
  TrendingUp, 
  Sprout, 
  Leaf, 
  Beaker, 
  AlertTriangle, 
  PackageX 
} from 'lucide-react';

interface InventoryStatsProps {
  inventory: ProductInventory[];
}

export function InventoryStats({ inventory }: InventoryStatsProps) {
  const stats = useMemo(() => {
    const totalProducts = inventory.length;
    const byType = inventory.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lowStockCount = inventory.filter(product => product.quantity > 0 && product.quantity <= 5).length;
    const outOfStockCount = inventory.filter(product => product.quantity === 0).length;

    return { 
      totalProducts, 
      byType,
      lowStockCount,
      outOfStockCount
    };
  }, [inventory]);

  // Функция для получения иконки и цвета по типу СЗР
  const getTypeIconAndColor = (type: string) => {
    const types: Record<string, { icon: React.ReactNode; bgColor: string; borderColor: string; textColor: string }> = {
      'фунгицид': { 
        icon: <Shield className="h-5 w-5 text-purple-600" />, 
        bgColor: 'bg-purple-50', 
        borderColor: 'border-purple-200',
        textColor: 'text-purple-600'
      },
      'инсектицид': { 
        icon: <Bug className="h-5 w-5 text-red-600" />, 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200',
        textColor: 'text-red-600'
      },
      'гербицид': { 
        icon: <Flower2 className="h-5 w-5 text-orange-600" />, 
        bgColor: 'bg-orange-50', 
        borderColor: 'border-orange-200',
        textColor: 'text-orange-600'
      },
      'десикант': { 
        icon: <Droplets className="h-5 w-5 text-yellow-600" />, 
        bgColor: 'bg-yellow-50', 
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-600'
      },
      'регулятор роста': { 
        icon: <TrendingUp className="h-5 w-5 text-green-600" />, 
        bgColor: 'bg-green-50', 
        borderColor: 'border-green-200',
        textColor: 'text-green-600'
      },
      'удобрение': { 
        icon: <Sprout className="h-5 w-5 text-blue-600" />, 
        bgColor: 'bg-blue-50', 
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600'
      },
      'биопрепарат': { 
        icon: <Leaf className="h-5 w-5 text-teal-600" />, 
        bgColor: 'bg-teal-50', 
        borderColor: 'border-teal-200',
        textColor: 'text-teal-600'
      },
      'адъювант': { 
        icon: <Beaker className="h-5 w-5 text-gray-600" />, 
        bgColor: 'bg-gray-50', 
        borderColor: 'border-gray-200',
        textColor: 'text-gray-600'
      }
    };
    return types[type] || { 
      icon: <Package className="h-5 w-5 text-gray-600" />, 
      bgColor: 'bg-gray-50', 
      borderColor: 'border-gray-200',
      textColor: 'text-gray-600'
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-600 font-medium">Всего</div>
              <div className="text-lg font-bold text-blue-800">{stats.totalProducts}</div>
            </div>
            <Package className="h-6 w-6 text-blue-600 opacity-60" />
          </div>
        </CardContent>
      </Card>
      
      {Object.entries(stats.byType).map(([type, count]) => {
        const typeConfig = getTypeIconAndColor(type);
        
        return (
          <Card key={type} className={`${typeConfig.bgColor} ${typeConfig.borderColor}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-medium ${typeConfig.textColor} capitalize truncate`}>
                    {type}
                  </div>
                  <div className="text-lg font-bold text-gray-800">{count}</div>
                </div>
                {typeConfig.icon}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Карточки для низких запасов */}
      <Card className={`${stats.lowStockCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-medium ${stats.lowStockCount > 0 ? 'text-yellow-700' : 'text-gray-600'}`}>
                Низкий запас
              </div>
              <div className={`text-lg font-bold ${stats.lowStockCount > 0 ? 'text-yellow-800' : 'text-gray-800'}`}>
                {stats.lowStockCount}
              </div>
            </div>
            <AlertTriangle className={`h-5 w-5 ${stats.lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-500'}`} />
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${stats.outOfStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-medium ${stats.outOfStockCount > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                Нет в наличии
              </div>
              <div className={`text-lg font-bold ${stats.outOfStockCount > 0 ? 'text-red-800' : 'text-gray-800'}`}>
                {stats.outOfStockCount}
              </div>
            </div>
            <PackageX className={`h-5 w-5 ${stats.outOfStockCount > 0 ? 'text-red-600' : 'text-gray-500'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}