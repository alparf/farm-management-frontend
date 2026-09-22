'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { PeriodSelector } from './period-selector';
import { StatsOverview } from './stats-overview';
import { ProductAnalytics } from './product-analytics';
import { ClientAnalytics } from './client-analytics';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsContent() {
  const { shipments, shipmentsLoading, shipmentsError } = useAppData();

  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Автовыбор последнего сезона при первой загрузке отгрузок
  useEffect(() => {
    if (selectedYear !== 'all') return;
    if (!shipments || shipments.length === 0) return;

    const years = shipments.map((s) => new Date(s.date).getFullYear());
    const latestYear = Math.max(...years);
    setSelectedYear(latestYear);
  }, [shipments, selectedYear]);

  const filteredShipments = useMemo(() => {
    if (selectedYear === 'all') return [];
    if (!shipments || shipments.length === 0) return [];

    let filtered = shipments.filter(
      (s) => new Date(s.date).getFullYear() === selectedYear,
    );

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(
        (s) => new Date(s.date).getMonth() === selectedMonth,
      );
    }

    return filtered;
  }, [shipments, selectedYear, selectedMonth]);

  if (shipmentsLoading) {
    return <div className="text-center py-8">Загрузка аналитики...</div>;
  }

  if (shipmentsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Ошибка загрузки данных</p>
            <p className="text-xs mt-2">{shipmentsError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!shipments || shipments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Нет данных по отгрузкам</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const yearSelected = selectedYear !== 'all';

  return (
    <div className="space-y-6">
      <PeriodSelector
        shipments={shipments}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        filteredCount={yearSelected ? filteredShipments.length : undefined}
      />

      {!yearSelected && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-base font-medium">Выберите сезон (год)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {yearSelected && (
        <>
          <StatsOverview shipments={filteredShipments} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductAnalytics shipments={filteredShipments} />
            <ClientAnalytics shipments={filteredShipments} />
          </div>
        </>
      )}
    </div>
  );
}