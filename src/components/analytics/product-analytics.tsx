'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface ProductAnalyticsProps {
  shipments: any[];
}

export function ProductAnalytics({ shipments }: ProductAnalyticsProps) {
  const productStats = useMemo(() => {
    const map = new Map<number, {
      productId: number;
      productName: string;
      unit: string;
      quantity: number;
      sum: number;
    }>();

    shipments.forEach(s => {
      s.items.forEach((item: any) => {
        const product = item.product;
        if (!product) return;
        const id = product.id;
        const qty = Number(item.quantity) || 0;
        const returnQty = Number(item.returnQuantity) || 0;
        const netQty = qty - returnQty;
        const price = Number(item.pricePerUnit) || 0;

        if (map.has(id)) {
          const entry = map.get(id)!;
          entry.quantity += netQty;
          entry.sum += netQty * price;
        } else {
          map.set(id, {
            productId: id,
            productName: product.name || `ID: ${id}`,
            unit: product.unit || 'шт',
            quantity: netQty,
            sum: netQty * price,
          });
        }
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 10);
  }, [shipments]);

  if (productStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Топ продуктов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Нет данных</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Топ продуктов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productStats.map((item, index) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="w-6 text-sm font-medium text-gray-400">#{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.productName}</div>
                <div className="text-xs text-gray-500">
                  {item.quantity.toFixed(1)} {item.unit}
                </div>
              </div>
              <div className="text-sm font-semibold text-green-700">{item.sum.toFixed(2)} BYN</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}