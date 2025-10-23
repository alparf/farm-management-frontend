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
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      });
    }
    
    return months;
  };

  const months = getLastNineMonths();
  const maxPosition = 100; // 100% ширины

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
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      if (treatmentDate >= month.startDate && treatmentDate <= month.endDate) {
        // Позиция внутри месяца в процентах (0-100% для каждого месяца)
        const daysInMonth = month.endDate.getDate();
        const dayOfMonth = treatmentDate.getDate();
        const positionInMonth = (dayOfMonth / daysInMonth) * 100;
        
        // Общая позиция: позиция месяца + позиция внутри месяца
        const monthPosition = (i / months.length) * 100;
        const positionInTimeline = monthPosition + (positionInMonth / months.length);
        
        return Math.min(positionInTimeline, 100);
      }
    }
    
    return -1;
  };

  // Сортируем обработки по дате для правильного отображения
  const sortedTreatments = [...treatments].sort((a, b) => a.date.getTime() - b.date.getTime());

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

          {/* Обработки - все на одной линии */}
          <div className="relative h-20">
            {/* Линия времени */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-200 transform -translate-y-1/2" />
            
            {sortedTreatments.map((treatment) => {
              const position = getTreatmentPosition(treatment.date);
              if (position < 0) return null;
              
              return (
                <div
                  key={treatment.id}
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
                    className={`w-4 h-4 rounded-full ${getTypeColor(treatment.type)} border-2 border-white shadow-lg cursor-pointer relative z-10`}
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
                      {treatment.products.slice(0, 2).join(', ')}
                      {treatment.products.length > 2 && `... (+${treatment.products.length - 2})`}
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