import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Box } from 'lucide-react';

interface ProductStatsProps {
  shipments: any[];
}

export function ProductStats({ shipments }: ProductStatsProps) {
  const productStats = useMemo(() => {
    const map = new Map<number, {
      productId: number;
      productName: string;
      unit: string;
      netQuantity: number;
      totalSum: number;
    }>();

    shipments.forEach(shipment => {
      shipment.items.forEach((item: any) => {
        const product = item.product;
        if (!product) return;
        const productId = product.id;
        const quantity = Number(item.quantity) || 0;
        const returnQty = Number(item.returnQuantity) || 0;
        const netQty = quantity - returnQty;
        const price = Number(item.pricePerUnit) || 0;
        const sum = netQty * price;

        if (map.has(productId)) {
          const entry = map.get(productId)!;
          entry.netQuantity += netQty;
          entry.totalSum += sum;
        } else {
          map.set(productId, {
            productId,
            productName: product.name || `ID: ${productId}`,
            unit: product.unit || 'шт',
            netQuantity: netQty,
            totalSum: sum,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalSum - a.totalSum);
  }, [shipments]);

  if (productStats.length === 0) {
    return <div className="text-center text-gray-500 py-4">Нет данных по отгруженным товарам</div>;
  }

  const bgColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-purple-50 border-purple-200',
    'bg-yellow-50 border-yellow-200',
    'bg-indigo-50 border-indigo-200',
    'bg-rose-50 border-rose-200',
    'bg-orange-50 border-orange-200',
    'bg-teal-50 border-teal-200',
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
      {productStats.map((stat, index) => {
        const colorClass = bgColors[index % bgColors.length];
        return (
          <Card key={stat.productId} className={`${colorClass} shadow-sm`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800 truncate" title={stat.productName}>
                    {stat.productName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {stat.unit}
                  </div>
                </div>
                <Box className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Отгружено</div>
                  <div className="text-base font-bold">{stat.netQuantity.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Сумма</div>
                  <div className="text-base font-bold text-green-700">{stat.totalSum.toFixed(2)} BYN</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}