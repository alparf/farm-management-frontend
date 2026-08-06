'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { useCultureStats } from '@/hooks/useCultureStats';
import { CultureSelector } from '@/components/culture-selector';
import { TimelineChart } from '@/components/timeline-chart';
import { Card, CardContent } from '@/components/ui/card';
import { ProductStats } from '@/components/shipments/product-stats';
import { MonthlyShipmentChart } from './monthly-shipment-chart';

interface AnalyticsContentProps {
  treatments: ChemicalTreatment[];
  shipments?: any[];
}

export function AnalyticsContent({ treatments, shipments }: AnalyticsContentProps) {
  const [selectedCulture, setSelectedCulture] = useState<CultureType | ''>('');
  const { cultureStats, getTimelineData } = useCultureStats(treatments);

  const cultures = [...new Set(treatments.map(t => t.culture))] as CultureType[];
  const currentCulture = selectedCulture || (cultures.length > 0 ? cultures[0] : null);

  const hasTreatments = treatments.length > 0;
  const hasShipments = shipments && shipments.length > 0;

  return (
    <div className="space-y-8">
      {/* Блок обработок: селектор культур и график */}
      {hasTreatments ? (
        <div className="space-y-6">
          <CultureSelector
            cultures={cultures}
            selectedCulture={selectedCulture}
            onCultureChange={setSelectedCulture}
            stats={cultureStats}
          />

          {currentCulture ? (
            <TimelineChart timelineData={getTimelineData(currentCulture)} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">Нет доступных культур для отображения графика</div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Нет данных по обработкам</div>
          </CardContent>
        </Card>
      )}

      {/* Блок отгрузок */}
      {hasShipments ? (
        <div className="space-y-6 border-t border-gray-200 pt-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Статистика по отгруженной продукции</h3>
            <ProductStats shipments={shipments} />
          </div>
          <MonthlyShipmentChart shipments={shipments} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Нет данных по отгрузкам</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}