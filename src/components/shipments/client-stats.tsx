import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ClientStatsProps {
  shipments: any[];
}

export function ClientStats({ shipments }: ClientStatsProps) {
  const clientStats = useMemo(() => {
    const map = new Map<number, {
      clientId: number;
      clientName: string;
      shipmentCount: number;
      totalSum: number;
      totalItems: number;
    }>();

    shipments.forEach(shipment => {
      const clientId = shipment.clientId;
      const clientName = shipment.client?.name || `ID: ${clientId}`;
      const items = shipment.items || [];
      const sum = items.reduce((acc: number, item: any) => {
        const quantity = Number(item.quantity) || 0;
        const returnQty = Number(item.returnQuantity) || 0;
        const netQty = quantity - returnQty;
        const price = Number(item.pricePerUnit) || 0;
        return acc + netQty * price;
      }, 0);

      if (map.has(clientId)) {
        const entry = map.get(clientId)!;
        entry.shipmentCount += 1;
        entry.totalSum += sum;
        entry.totalItems += items.length;
      } else {
        map.set(clientId, {
          clientId,
          clientName,
          shipmentCount: 1,
          totalSum: sum,
          totalItems: items.length,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSum - a.totalSum);
  }, [shipments]);

  if (clientStats.length === 0) {
    return <div className="text-center text-gray-500 py-4">Нет данных по клиентам</div>;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      {clientStats.map((stat, index) => {
        const colorClass = bgColors[index % bgColors.length];
        return (
          <Card key={stat.clientId} className={`${colorClass} shadow-sm`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 truncate" title={stat.clientName}>
                    {stat.clientName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {stat.shipmentCount} отгрузок
                  </div>
                </div>
                <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
              <div className="mt-3 flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-500">Позиций</div>
                  <div className="text-lg font-bold">{stat.totalItems}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Сумма</div>
                  <div className="text-lg font-bold text-green-700">{stat.totalSum.toFixed(2)} BYN</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}