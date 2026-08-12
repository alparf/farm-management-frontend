'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PeriodSelectorProps {
  shipments: any[];
  selectedYear: number | 'all';
  onYearChange: (year: number | 'all') => void;
  selectedMonth: number | 'all';
  onMonthChange: (month: number | 'all') => void;
  filteredCount?: number;
}

const MONTHS = [
  { value: 0, label: 'Январь' },
  { value: 1, label: 'Февраль' },
  { value: 2, label: 'Март' },
  { value: 3, label: 'Апрель' },
  { value: 4, label: 'Май' },
  { value: 5, label: 'Июнь' },
  { value: 6, label: 'Июль' },
  { value: 7, label: 'Август' },
  { value: 8, label: 'Сентябрь' },
  { value: 9, label: 'Октябрь' },
  { value: 10, label: 'Ноябрь' },
  { value: 11, label: 'Декабрь' },
];

export function PeriodSelector({
  shipments,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  filteredCount,
}: PeriodSelectorProps) {
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    shipments.forEach(s => {
      years.add(new Date(s.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [shipments]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-sm">Сезон (год)</Label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-32 h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
            >
              <option value="all">Все сезоны</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm">Месяц </Label>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-36 h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
            >
              <option value="all">Все месяцы </option>
              {MONTHS.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>

          {filteredCount !== undefined && (
            <div className="text-sm text-gray-500 ml-auto">
              Отгрузок: <span className="font-semibold">{filteredCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}