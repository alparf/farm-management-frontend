'use client';

import { TreatmentTimeline } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineChartProps {
  timelineData: TreatmentTimeline;
}

export function TimelineChart({ timelineData }: TimelineChartProps) {
  const { culture, treatments } = timelineData;

  // Получаем последние 9 месяцев
  const getLastNineMonths = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 8; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      months.push({
        name: date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
        date: new Date(date.getFullYear(), date.getMonth(), 1),
      });
    }
    
    return months;
  };

  const months = getLastNineMonths();
  const currentMonth = new Date().getMonth();

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'фунгицид': 'bg-purple-500',
      'инсектицид': 'bg-red-500',
      'гербицид': 'bg-orange-500',
      'десикант': 'bg-yellow-500',
      'регулятор роста': 'bg-green-500',
      'удобрение': 'bg-blue-500',
      'биопрепарат': 'bg-teal-500',
      'адъювант': 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-400';
  };

  const getTreatmentPosition = (treatmentDate: Date) => {
    const treatmentMonth = treatmentDate.getMonth();
    const treatmentYear = treatmentDate.getFullYear();
    
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      if (month.date.getMonth() === treatmentMonth && month.date.getFullYear() === treatmentYear) {
        // Позиция внутри месяца (условно по неделям)
        const week = Math.floor(treatmentDate.getDate() / 7);
        return i * 4 + week; // 4 позиции на месяц
      }
    }
    
    return -1;
  };

  const maxPosition = months.length * 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Временная шкала обработок: {culture}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Шкала месяцев */}
          <div className="flex justify-between relative pb-8">
            {months.map((month, index) => (
              <div key={month.name} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-600 text-center mb-2">
                  {month.name.split(' ')[0]}
                  <br />
                  {month.name.split(' ')[1]}
                </div>
                <div className="w-full h-1 bg-gray-200 relative">
                  {/* Деления на недели */}
                  {[0, 1, 2, 3].map(week => (
                    <div
                      key={week}
                      className="absolute w-0.5 h-3 bg-gray-300 -top-1"
                      style={{ left: `${week * 25}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Обработки */}
          <div className="relative" style={{ height: `${treatments.length * 40 + 20}px` }}>
            {/* Линия времени */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 transform -translate-y-1/2" />
            
            {treatments.map((treatment, index) => {
              const position = getTreatmentPosition(treatment.date);
              const left = position >= 0 ? `${(position / maxPosition) * 100}%` : '0%';
              
              return (
                <div
                  key={treatment.id}
                  className="absolute transform -translate-y-1/2"
                  style={{ 
                    left, 
                    top: `${(index + 1) * 40}px`,
                    zIndex: 10 
                  }}
                >
                  <div className="flex items-center gap-2 group">
                    <div
                      className={`w-4 h-4 rounded-full ${getTypeColor(treatment.type)} border-2 border-white shadow-lg`}
                      title={`${treatment.type} - ${treatment.date.toLocaleDateString('ru-RU')}`}
                    />
                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-48">
                      <div className="text-sm font-semibold text-gray-900">
                        {treatment.date.toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {treatment.type}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {treatment.products.slice(0, 2).join(', ')}
                        {treatment.products.length > 2 && `... (+${treatment.products.length - 2})`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Линия к оси */}
                  <div 
                    className="absolute w-0.5 h-8 bg-gray-300 top-4 left-2 transform -translate-x-1/2"
                    style={{ height: `${Math.abs(20 - (index + 1) * 40)}px` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Легенда */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span>Фунгициды</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Инсектициды</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span>Гербициды</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Регуляторы роста</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Удобрения</span>
            </div>
          </div>
        </div>

        {treatments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет выполненных обработок за последние 9 месяцев
          </div>
        )}
      </CardContent>
    </Card>
  );
}