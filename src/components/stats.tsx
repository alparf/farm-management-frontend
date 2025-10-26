// components/stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChemicalTreatment } from '@/types';

interface StatsProps {
  treatments: ChemicalTreatment[];
}

export function Stats({ treatments }: StatsProps) {
  // Преобразуем area в числа и суммируем
  const totalArea = treatments.reduce((sum, treatment) => {
    const area = typeof treatment.area === 'string' 
      ? parseFloat(treatment.area) 
      : Number(treatment.area) || 0;
    return sum + area;
  }, 0);

  const completedArea = treatments.reduce((sum, treatment) => {
    if (!treatment.completed) return sum;
    const area = typeof treatment.area === 'string' 
      ? parseFloat(treatment.area) 
      : Number(treatment.area) || 0;
    return sum + area;
  }, 0);

  const completedTreatments = treatments.filter(t => t.completed).length;
  const upcomingTreatments = treatments.filter(t => 
    !t.completed && t.dueDate && new Date(t.dueDate) > new Date()
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общая площадь</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalArea.toFixed(1)} га</div>
          <p className="text-xs text-gray-500">
            {completedArea.toFixed(1)} га обработано
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего обработок</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{treatments.length}</div>
          <p className="text-xs text-gray-500">
            {completedTreatments} завершено
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Предстоящие</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingTreatments}</div>
          <p className="text-xs text-gray-500">
            обработки по плану
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Эффективность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalArea > 0 ? ((completedArea / totalArea) * 100).toFixed(0) : 0}%
          </div>
          <p className="text-xs text-gray-500">
            выполнено от плана
          </p>
        </CardContent>
      </Card>
    </div>
  );
}