'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyShipmentChartProps {
  shipments: any[];
}

const CLIENT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-fuchsia-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-red-500',
  'bg-slate-500',
  'bg-stone-500',
  'bg-neutral-500',
];

export function MonthlyShipmentChart({ shipments }: MonthlyShipmentChartProps) {
  const { monthlyData, clientNames, maxSum } = useMemo(() => {
    if (!shipments || shipments.length === 0) {
      return { monthlyData: [], clientNames: [], maxSum: 0 };
    }

    const monthMap = new Map<string, Map<number, number>>();
    const clientIdToName = new Map<number, string>();

    shipments.forEach(s => {
      const date = new Date(s.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const clientId = s.clientId;
      const clientName = s.client?.name || `ID: ${clientId}`;
      clientIdToName.set(clientId, clientName);

      const sum = s.items.reduce((acc: number, item: any) => {
        const qty = Number(item.quantity) || 0;
        const returnQty = Number(item.returnQuantity) || 0;
        const netQty = qty - returnQty;
        const price = Number(item.pricePerUnit) || 0;
        return acc + netQty * price;
      }, 0);

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, new Map());
      }
      const clientMap = monthMap.get(monthKey)!;
      clientMap.set(clientId, (clientMap.get(clientId) || 0) + sum);
    });

    const sortedMonths = Array.from(monthMap.keys()).sort();

    const uniqueClientIds = Array.from(
      new Set(
        Array.from(monthMap.values()).flatMap(clientMap => Array.from(clientMap.keys()))
      )
    );

    uniqueClientIds.sort((a, b) => (clientIdToName.get(a) || '').localeCompare(clientIdToName.get(b) || ''));

    const monthlyData = sortedMonths.map(monthKey => {
      const clientMap = monthMap.get(monthKey)!;
      const totalMonthSum = Array.from(clientMap.values()).reduce((a, b) => a + b, 0);
      const clients = uniqueClientIds.map(clientId => ({
        clientId,
        clientName: clientIdToName.get(clientId) || `ID: ${clientId}`,
        sum: clientMap.get(clientId) || 0,
      }));
      return {
        month: monthKey,
        totalSum: totalMonthSum,
        clients,
      };
    });

    const maxSum = Math.max(...monthlyData.map(d => d.totalSum), 0);
    const clientNames = uniqueClientIds.map(id => clientIdToName.get(id) || `ID: ${id}`);

    return { monthlyData, clientNames, maxSum };
  }, [shipments]);

  const clientColorMap = useMemo(() => {
    const map = new Map<string, string>();
    clientNames.forEach((name, index) => {
      map.set(name, CLIENT_COLORS[index % CLIENT_COLORS.length]);
    });
    return map;
  }, [clientNames]);

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Динамика отгрузок по месяцам (в разрезе клиентов)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">Нет данных по отгрузкам</div>
        </CardContent>
      </Card>
    );
  }

  const monthLabels = monthlyData.map(d => {
    const [year, month] = d.month.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Динамика отгрузок по месяцам (в разрезе клиентов)</CardTitle>
      </CardHeader>
      <CardContent>
        {clientNames.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {clientNames.map(name => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${clientColorMap.get(name) || 'bg-gray-300'}`} />
                <span className="text-gray-700 truncate max-w-[100px]" title={name}>{name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end justify-around h-64 gap-2">
          {monthlyData.map((item, index) => {
            const total = item.totalSum;
            const columnHeight = maxSum > 0 ? (total / maxSum) * 100 : 0;
            const segments = item.clients
              .map(client => ({
                clientName: client.clientName,
                color: clientColorMap.get(client.clientName) || 'bg-gray-300',
                height: total > 0 ? (client.sum / total) * 100 : 0,
                sum: client.sum,
              }))
              .filter(seg => seg.height > 0);

            return (
              <div key={item.month} className="flex flex-col items-center w-full">
                <div className="text-xs text-gray-600 mb-1">{total.toFixed(0)} BYN</div>
                <div
                  className="w-full max-w-[60px] bg-gray-100 rounded-t flex flex-col justify-end overflow-hidden"
                  style={{ height: `${Math.max(columnHeight, 4)}px`, minHeight: '20px' }}
                >
                  {segments.map((seg, idx) => (
                    <div
                      key={idx}
                      className={`${seg.color} w-full transition-all`}
                      style={{ height: `${seg.height}%` }}
                      title={`${seg.clientName}: ${seg.sum.toFixed(0)} BYN`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  {monthLabels[index]}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}