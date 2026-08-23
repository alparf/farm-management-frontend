'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UsersRound } from 'lucide-react';

interface ClientStatsProps {
  shipments: any[];
  onClientClick?: (clientId: number | 'all') => void;
}

export function ClientStats({ shipments, onClientClick }: ClientStatsProps) {
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

  // Общая статистика по всем клиентам
  const totalStats = useMemo(() => {
    return {
      totalClients: clientStats.length,
      totalShipments: clientStats.reduce((acc, stat) => acc + stat.shipmentCount, 0),
      totalSum: clientStats.reduce((acc, stat) => acc + stat.totalSum, 0),
      totalItems: clientStats.reduce((acc, stat) => acc + stat.totalItems, 0),
    };
  }, [clientStats]);

  const handleCardClick = (clientId: number | 'all') => {
    if (onClientClick) {
      onClientClick(clientId);
    }
  };

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-4">
      {/* Карточка "Все клиенты" - первая */}
      <Card 
        className="bg-gray-50 border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCardClick('all')}
      >
        <CardContent className="p-2.5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 truncate">
                Все клиенты
              </div>
              <div className="text-[10px] text-gray-500">
                {totalStats.totalShipments} отгр.
              </div>
            </div>
            <UsersRound className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          </div>
          <div className="mt-1 flex justify-between items-end">
            <div>
              <div className="text-[10px] text-gray-500">Клиентов</div>
              <div className="text-sm font-bold">{totalStats.totalClients}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500">Сумма</div>
              <div className="text-xs font-bold text-green-700">{totalStats.totalSum.toFixed(0)} BYN</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Карточки клиентов */}
      {clientStats.map((stat, index) => {
        const colorClass = bgColors[index % bgColors.length];
        return (
          <Card 
            key={stat.clientId} 
            className={`${colorClass} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => handleCardClick(stat.clientId)}
          >
            <CardContent className="p-2.5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 truncate" title={stat.clientName}>
                    {stat.clientName}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {stat.shipmentCount} отгр.
                  </div>
                </div>
                <Users className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              </div>
              <div className="mt-1 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-gray-500">Поз.</div>
                  <div className="text-sm font-bold">{stat.totalItems}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">Сумма</div>
                  <div className="text-xs font-bold text-green-700">{stat.totalSum.toFixed(0)} BYN</div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}