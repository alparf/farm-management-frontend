'use client';

import { useState } from 'react';
import { ChemicalTreatment, CultureType } from '@/types';
import { useCultureStats } from '@/hooks/useCultureStats';
import { CultureSelector } from '@/components/culture-selector';
import { TimelineChart } from '@/components/timeline-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CalendarDays, MapPin, Beaker } from 'lucide-react';

interface AnalyticsTabProps {
  treatments: ChemicalTreatment[];
}

export function AnalyticsTab({ treatments }: AnalyticsTabProps) {
  const [selectedCulture, setSelectedCulture] = useState<CultureType | ''>('');
  const { cultureStats, getTimelineData, getLastTreatmentDetails } = useCultureStats(treatments);

  const cultures = [...new Set(treatments.map(t => t.culture))] as CultureType[];

  const currentCulture = selectedCulture || (cultures.length > 0 ? cultures[0] : '');
  const currentCultureStats = cultureStats.find(s => s.culture === currentCulture);
  
  // ✅ Проверяем, что currentCulture не пустая строка перед вызовом
  const lastTreatmentDetails = currentCulture ? getLastTreatmentDetails(currentCulture) : null;

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Последняя обработка - расширенная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Последняя обработка</CardTitle>
            </CardHeader>
            <CardContent>
              {lastTreatmentDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        📅 {lastTreatmentDetails.date.toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor((new Date().getTime() - lastTreatmentDetails.date.getTime()) / (1000 * 60 * 60 * 24))} дней назад
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        Выполнено
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3" />
                        {lastTreatmentDetails.area} га
                      </div>
                    </div>
                  </div>

                  {/* Препараты с дозировками */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      Использованные препараты
                    </h4>
                    <div className="space-y-2">
                      {lastTreatmentDetails.chemicalProducts.map((product, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">
                              {product.productName}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">
                              ({product.type})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-mono text-sm bg-white px-2 py-0.5 rounded">
                              {product.ratePerHa} {product.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Баковая смесь */}
                  {lastTreatmentDetails.isTankMix && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-indigo-500" />
                        Баковая смесь
                      </h4>
                      <div className="bg-indigo-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-indigo-700">
                          Обработка проводилась баковой смесью
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Примечания */}
                  {lastTreatmentDetails.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Примечания</h4>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm text-gray-600">{lastTreatmentDetails.notes}</p>
                      </div>
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