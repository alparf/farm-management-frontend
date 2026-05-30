'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { useCultureStats } from '@/hooks/useCultureStats';
import { CultureSelector } from '@/components/culture-selector';
import { TimelineChart } from '@/components/timeline-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CalendarDays, MapPin, Beaker, Calendar } from 'lucide-react';
import { ChemicalsUsageStats } from '@/components/chemicals-usage-stats'; // новый компонент

interface AnalyticsTabProps {
  treatments: ChemicalTreatment[];
}

export function AnalyticsTab({ treatments }: AnalyticsTabProps) {
  const [selectedCulture, setSelectedCulture] = useState<CultureType | ''>('');
  const { cultureStats, getTimelineData, getLastTreatmentDetails, getNextTreatmentDetails } = useCultureStats(treatments);

  const cultures = [...new Set(treatments.map(t => t.culture))] as CultureType[];

  const currentCulture = selectedCulture || (cultures.length > 0 ? cultures[0] : '');
  const currentCultureStats = cultureStats.find(s => s.culture === currentCulture);
  
  const lastTreatmentDetails = currentCulture ? getLastTreatmentDetails(currentCulture) : null;
  const nextTreatmentDetails = currentCulture ? getNextTreatmentDetails(currentCulture) : null;

  return (
    <div className="space-y-6">
      <CultureSelector
        cultures={cultures}
        selectedCulture={selectedCulture}
        onCultureChange={setSelectedCulture}
        stats={cultureStats}
      />

      {currentCulture ? (
        <>
          <TimelineChart timelineData={getTimelineData(currentCulture)} />

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

          {/* Три колонки: статистика СЗР, следующая обработка, последняя обработка */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Статистика применения препаратов */}
            <ChemicalsUsageStats culture={currentCulture} treatments={treatments} />

            {/* Следующая запланированная обработка */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Следующая обработка</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {nextTreatmentDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {nextTreatmentDetails.date.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          (через {Math.ceil((nextTreatmentDetails.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дней)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {nextTreatmentDetails.area} га
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        Запланировано
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        Препараты
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {nextTreatmentDetails.chemicalProducts.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 text-sm truncate block">
                                {product.productName}
                              </span>
                              <span className="text-gray-400 text-xs">
                                ({product.type})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="text-gray-600 font-mono text-xs bg-white px-2 py-0.5 rounded">
                                {product.ratePerHa} {product.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {nextTreatmentDetails.isTankMix && (
                      <div className="flex items-center gap-2 text-sm bg-gray-100 rounded-lg px-3 py-2">
                        <Beaker className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Баковая смесь</span>
                      </div>
                    )}

                    {nextTreatmentDetails.notes && (
                      <div className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-gray-600 line-clamp-2">{nextTreatmentDetails.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Нет запланированных обработок
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Последняя обработка */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Последняя обработка</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {lastTreatmentDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {lastTreatmentDetails.date.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({Math.floor((new Date().getTime() - lastTreatmentDetails.date.getTime()) / (1000 * 60 * 60 * 24))} дней назад)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {lastTreatmentDetails.area} га
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        Выполнено
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        Препараты
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {lastTreatmentDetails.chemicalProducts.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 text-sm truncate block">
                                {product.productName}
                              </span>
                              <span className="text-gray-400 text-xs">
                                ({product.type})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="text-gray-600 font-mono text-xs bg-white px-2 py-0.5 rounded">
                                {product.ratePerHa} {product.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {lastTreatmentDetails.isTankMix && (
                      <div className="flex items-center gap-2 text-sm bg-gray-100 rounded-lg px-3 py-2">
                        <Beaker className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">Баковая смесь</span>
                      </div>
                    )}

                    {lastTreatmentDetails.notes && (
                      <div className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-gray-600 line-clamp-2">{lastTreatmentDetails.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Нет выполненных обработок
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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