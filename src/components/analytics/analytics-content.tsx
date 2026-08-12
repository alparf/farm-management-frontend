'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { PeriodSelector } from './period-selector';
import { StatsOverview } from './stats-overview';
import { ProductAnalytics } from './product-analytics';
import { ClientAnalytics } from './client-analytics';
import { MonthlyChart } from './monthly-chart';

export function AnalyticsContent() {
  const { shipments, shipmentsLoading, shipmentsError } = useAppData();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  useEffect(() => {
    console.log('📊 AnalyticsContent - shipments updated:', shipments?.length);
  }, [shipments]);

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

  if (shipmentsLoading) {
    return <div className="text-center py-8">Загрузка аналитики...</div>;
  }

  if (shipmentsError) {
    return <div className="text-center py-8 text-red-500">Ошибка: {shipmentsError}</div>;
  }

  if (!shipments || shipments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Нет данных по отгрузкам</p>
            <p className="text-xs mt-2 text-gray-400">
              Получено: {shipments?.length || 0} записей
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StatsOverview shipments={filteredShipments} />

      <PeriodSelector
        shipments={shipments}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        filteredCount={filteredShipments.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductAnalytics shipments={filteredShipments} />
        <ClientAnalytics shipments={filteredShipments} />
      </div>

      <MonthlyChart shipments={filteredShipments} />
    </div>
  );
}