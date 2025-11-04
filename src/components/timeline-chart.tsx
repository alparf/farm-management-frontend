// [file name]: timeline-chart.tsx
'use client';

import { TreatmentTimeline } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineChartProps {
  timelineData: TreatmentTimeline;
}

export function TimelineChart({ timelineData }: TimelineChartProps) {
  const { culture, treatments } = timelineData;

  // Получаем диапазон дат для таймлайна
  const getTimelineRange = () => {
    if (treatments.length === 0) {
      const now = new Date();
      const start = new Date(now);
      start.setMonth(now.getMonth() - 8);
      return { start, end: now };
    }

    const dates = treatments.map(t => t.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    const start = new Date(minDate);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(maxDate);
    end.setMonth(end.getMonth() + 1);
    
    return { start, end };
  };

  const { start, end } = getTimelineRange();
  
  // Создаем месяцы для отображения
  const getMonths = () => {
    const months = [];
    const current = new Date(start);
    current.setDate(1);
    
    while (current <= end) {
      months.push({
        name: current.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
        date: new Date(current),
        startDate: new Date(current),
        endDate: new Date(current.getFullYear(), current.getMonth() + 1, 0)
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const months = getMonths();
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'фунгицид': 'bg-purple-500',
    'инсектицид': 'bg-red-500',
    'гербицид': 'bg-orange-500',
    'десикант': 'bg-yellow-500',
    'регулятор роста': 'bg-green-500',
    'удобрение': 'bg-blue-500',
    'биопрепарат': 'bg-pink-500',
    'адъювант': 'bg-gray-500',
    'Баковая смесь': 'bg-teal-500',
  };
  return colors[type] || 'bg-gray-400';
};

const getTypeLabel = (type: string, treatment: any) => {
  if (type === 'Баковая смесь' && treatment.tankMixTypes) {
    return `Баковая смесь: ${treatment.tankMixTypes.join(', ')}`;
  }
  const labels: Record<string, string> = {
      'фунгицид': 'Фунгициды',
      'инсектицид': 'Инсектициды',
      'гербицид': 'Гербициды',
      'десикант': 'Десиканты',
      'регулятор роста': 'Регуляторы роста',
      'удобрение': 'Удобрения',
      'биопрепарат': 'Биопрепараты',
      'адъювант': 'Адъюванты',
      'Баковая смесь': 'Баковая смесь'
    };
    return labels[type] || type;
};

  const getTreatmentPosition = (treatmentDate: Date) => {
    const daysFromStart = (treatmentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const position = (daysFromStart / totalDays) * 100;
    return Math.max(0, Math.min(100, position));
  };

  // Сортируем обработки по дате
  const sortedTreatments = [...treatments].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Временная шкала обработок: {culture}
        </CardTitle>
        <div className="text-sm text-gray-500">
          Всего обработок: {treatments.length}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Шкала месяцев */}
          <div className="flex justify-between relative pb-12">
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
          <div className="relative h-20">
            {/* Линия времени */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 transform -translate-y-1/2" />
            
            {sortedTreatments.map((treatment, index) => {
              const position = getTreatmentPosition(treatment.date);
              
              return (
                <div
                  key={`${treatment.id}-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ 
                    left: `${position}%`,
                    top: '50%'
                  }}
                >
                  {/* Линия к оси */}
                  <div className="absolute w-0.5 h-8 bg-gray-300 -top-8 left-1/2 transform -translate-x-1/2" />
                  
                  {/* Метка обработки */}
                  <div
                    className={`w-4 h-4 rounded-full ${getTypeColor(treatment.type)} border-2 border-white shadow-lg cursor-pointer relative z-10 ${
                      treatment.completed ? 'ring-2 ring-green-400' : 'ring-2 ring-yellow-400'
                    }`}
                    title={`${treatment.type} - ${treatment.date.toLocaleDateString('ru-RU')}`}
                  />
                  
                  {/* Всплывающая подсказка */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-48 z-20">
                    <div className="text-sm font-semibold text-gray-900">
                      {treatment.date.toLocaleDateString('ru-RU')}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {treatment.type}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {treatment.products.join(', ')}
                    </div>
                    
                    <div className={`text-xs mt-1 ${treatment.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {treatment.completed ? '✅ Выполнено' : '⏳ Запланировано'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Легенда */}
          <div className="flex flex-wrap gap-4 justify-center text-xs">
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Десиканты</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full" />
              <span>Биопрепараты</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
              <span>Адъюванты</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full" />
              <span>Баковая смесь</span>
            </div>
          </div>

          {/* Статус выполнения */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-300" />
              <span className="text-sm text-gray-600">Выполнено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-300" />
              <span className="text-sm text-gray-600">Запланировано</span>
            </div>
          </div>
        </div>

        {treatments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет выполненных обработок
          </div>
        )}
      </CardContent>
    </Card>
  );
}