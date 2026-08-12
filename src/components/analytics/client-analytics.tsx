'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ClientAnalyticsProps {
  shipments: any[];
}

export function ClientAnalytics({ shipments }: ClientAnalyticsProps) {
  const clientStats = useMemo(() => {
    const map = new Map<number, {
      clientId: number;
      clientName: string;
      shipments: number;
      items: number;
      sum: number;
    }>();

    shipments.forEach(s => {
      const id = s.clientId;
      const name = s.client?.name || `ID: ${id}`;
      const items = s.items.length;

      if (map.has(id)) {
        const entry = map.get(id)!;
        entry.shipments += 1;
        entry.items += items;
        entry.sum += s.items.reduce((acc: number, item: any) => {
          const qty = Number(item.quantity) || 0;
          const returnQty = Number(item.returnQuantity) || 0;
          const netQty = qty - returnQty;
          const price = Number(item.pricePerUnit) || 0;
          return acc + netQty * price;
        }, 0);
      } else {
        map.set(id, {
          clientId: id,
          clientName: name,
          shipments: 1,
          items: items,
          sum: s.items.reduce((acc: number, item: any) => {
            const qty = Number(item.quantity) || 0;
            const returnQty = Number(item.returnQuantity) || 0;
            const netQty = qty - returnQty;
            const price = Number(item.pricePerUnit) || 0;
            return acc + netQty * price;
          }, 0),
        });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 10);
  }, [shipments]);

  if (clientStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Топ клиентов</CardTitle>
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
          <Users className="h-5 w-5" />
          Топ клиентов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clientStats.map((item, index) => (
            <div key={item.clientId} className="flex items-center gap-3">
              <div className="w-6 text-sm font-medium text-gray-400">#{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.clientName}</div>
                <div className="text-xs text-gray-500">
                  {item.shipments} отгрузок · {item.items} позиций
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