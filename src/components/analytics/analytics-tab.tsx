'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PeriodSelector } from './period-selector';
import { StatsOverview } from './stats-overview';
import { ProductAnalytics } from './product-analytics';
import { ClientAnalytics } from './client-analytics';
import { MonthlyChart } from './monthly-chart';

interface AnalyticsContentProps {
  shipments?: any[];
}

export function AnalyticsContent({ shipments = [] }: AnalyticsContentProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Фильтрация по периоду
  const filteredShipments = useMemo(() => {
    if (!shipments || shipments.length === 0) return [];

    let filtered = [...shipments];

    if (selectedYear !== 'all') {
      filtered = filtered.filter(s => new Date(s.date).getFullYear() === selectedYear);
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(s => new Date(s.date).getMonth() === selectedMonth);
    }

    return filtered;
  }, [shipments, selectedYear, selectedMonth]);

  if (!shipments || shipments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Нет данных по отгрузкам</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PeriodSelector
        shipments={shipments}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <StatsOverview shipments={filteredShipments} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductAnalytics shipments={filteredShipments} />
        <ClientAnalytics shipments={filteredShipments} />
      </div>

      <MonthlyChart shipments={filteredShipments} />
    </div>
  );
}