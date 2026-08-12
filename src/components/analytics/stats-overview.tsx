'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Users, Package, TrendingUp, Coins } from 'lucide-react';

interface StatsOverviewProps {
  shipments: any[];
}

export function StatsOverview({ shipments }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const totalShipments = shipments.length;
    let totalSum = 0;
    let totalItems = 0;
    const clients = new Set<number>();

    shipments.forEach(s => {
      clients.add(s.clientId);
      s.items.forEach((item: any) => {
        const qty = Number(item.quantity) || 0;
        const returnQty = Number(item.returnQuantity) || 0;
        const netQty = qty - returnQty;
        const price = Number(item.pricePerUnit) || 0;
        totalSum += netQty * price;
        totalItems += 1;
      });
    });

    const avgCheck = totalShipments > 0 ? totalSum / totalShipments : 0;

    return {
      totalShipments,
      totalSum,
      totalItems,
      clients: clients.size,
      avgCheck,
    };
  }, [shipments]);

  const statCards = [
    {
      label: 'Всего отгрузок',
      value: stats.totalShipments,
      icon: Truck,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Общая сумма',
      value: `${stats.totalSum.toFixed(2)} BYN`,
      icon: Coins,
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      label: 'Клиентов',
      value: stats.clients,
      icon: Users,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Позиций',
      value: stats.totalItems,
      icon: Package,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    {
      label: 'Средний чек',
      value: `${stats.avgCheck.toFixed(2)} BYN`,
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {statCards.map((card, index) => (
        <Card key={index} className={`${card.color} border`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium opacity-70">{card.label}</div>
                <div className="text-lg font-bold">{card.value}</div>
              </div>
              <card.icon className="h-5 w-5 opacity-60" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}