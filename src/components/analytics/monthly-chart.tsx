'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyChartProps {
  shipments: any[];
}

export function MonthlyChart({ shipments }: MonthlyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 200 });

  const chartData = useMemo(() => {
    if (!shipments || shipments.length === 0) return { points: [], maxValue: 0 };

    const monthMap = new Map<string, number>();
    shipments.forEach(s => {
      const date = new Date(s.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const sum = s.items.reduce((acc: number, item: any) => {
        const qty = Number(item.quantity) || 0;
        const returnQty = Number(item.returnQuantity) || 0;
        const netQty = qty - returnQty;
        const price = Number(item.pricePerUnit) || 0;
        return acc + netQty * price;
      }, 0);
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + sum);
    });

    const sortedMonths = Array.from(monthMap.keys()).sort();
    const maxValue = Math.max(...Array.from(monthMap.values()), 0);
    const points = sortedMonths.map(month => ({
      label: (() => {
        const [year, monthNum] = month.split('-').map(Number);
        return new Date(year, monthNum - 1, 1).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
      })(),
      value: monthMap.get(month) || 0,
    }));

    return { points, maxValue };
  }, [shipments]);

  const drawChart = (width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const { points, maxValue } = chartData;
    if (points.length === 0) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Нет данных', width / 2, height / 2);
      return;
    }

    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    if (maxValue === 0 || points.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Нет данных', width / 2, height / 2);
      return;
    }

    const coords = points.map((p, i) => {
      const x = padding.left + (i / (points.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (p.value / maxValue) * chartHeight;
      return { x, y, value: p.value, label: p.label };
    });

    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    coords.forEach((c, i) => {
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.stroke();

    coords.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(c.value.toFixed(0), c.x, c.y - 6);

      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(c.label, c.x, height - padding.bottom + 4);
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        setDimensions({
          width: rect.width || 600,
          height: 200,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width > 0) {
      drawChart(dimensions.width, dimensions.height);
    }
  }, [chartData, dimensions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Динамика отгрузок по месяцам</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '200px' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
}