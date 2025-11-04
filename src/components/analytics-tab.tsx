'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { useCultureStats } from '@/hooks/useCultureStats';
import { CultureSelector } from '@/components/culture-selector';
import { TimelineChart } from '@/components/timeline-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCultureIcon, getIconColor } from '@/lib/culture-icons';

interface AnalyticsTabProps {
  treatments: ChemicalTreatment[];
}

export function AnalyticsTab({ treatments }: AnalyticsTabProps) {
  const [selectedCulture, setSelectedCulture] = useState<CultureType | ''>('');
  const { cultureStats, getTimelineData } = useCultureStats(treatments);

  const cultures = [...new Set(treatments.map(t => t.culture))] as CultureType[];

  // Автоматически выбираем первую культуру если ничего не выбрано
  const currentCulture = selectedCulture || (cultures.length > 0 ? cultures[0] : '');

  const currentCultureStats = cultureStats.find(s => s.culture === currentCulture);

  return (
    <div className="space-y-6">
      {/* Выбор культуры */}
      <CultureSelector
        cultures={cultures}
        selectedCulture={currentCulture}
        onCultureChange={setSelectedCulture}
        stats={cultureStats}
      />

      {currentCulture ? (
        <>
          {/* Временная шкала */}
          <TimelineChart timelineData={getTimelineData(currentCulture)} />

          {/* Заголовок с иконкой культуры */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`${getIconColor(currentCulture)}`}>
              {getCultureIcon(currentCulture, "h-8 w-8")}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              Аналитика по культуре: {currentCulture}
            </h2>
          </div>

          {/* Статистика по культуре */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Всего обработок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentCultureStats?.totalTreatments || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {currentCultureStats?.completedTreatments || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {currentCultureStats?.totalTreatments ? 
                    Math.round((currentCultureStats.completedTreatments / currentCultureStats.totalTreatments) * 100) 
                    : 0
                  }% выполнено
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Запланировано</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {currentCultureStats?.plannedTreatments || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  предстоящие обработки
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Баковая смесь</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {currentCultureStats?.tankMixCount || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  обработок смесью
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Используемые препараты и смеси */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Препараты */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Часто используемые препараты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentCultureStats?.productsUsed && currentCultureStats.productsUsed.length > 0 ? (
                    currentCultureStats.productsUsed.map((product, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {product}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Нет данных о препаратах</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Баковая смесь */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Баковая смесь</CardTitle>
              </CardHeader>
              <CardContent>
                {currentCultureStats?.tankMixCount && currentCultureStats.tankMixCount > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {currentCultureStats.tankMixCount} обработок баковой смесью
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Комбинации препаратов:</h4>
                      {currentCultureStats.tankMixTypes && currentCultureStats.tankMixTypes.length > 0 ? (
                        currentCultureStats.tankMixTypes.map((types, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200">
                              {types.join(' + ')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Нет данных о комбинациях</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-gray-500">Нет обработок баковой смесью</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Последняя обработка */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Последняя обработка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {currentCultureStats?.lastTreatment
                      ? currentCultureStats.lastTreatment.toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Нет данных'
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Дата последней выполненной обработки
                  </p>
                </div>
                {currentCultureStats?.lastTreatment && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      Выполнено
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.floor((new Date().getTime() - currentCultureStats.lastTreatment.getTime()) / (1000 * 60 * 60 * 24))} дней назад
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Нет данных по обработкам для отображения аналитики
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}