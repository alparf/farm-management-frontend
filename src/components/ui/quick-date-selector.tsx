'use client';

import { Button } from '@/components/ui/button';

interface QuickDateSelectorProps {
  onDateSelect: (date: Date) => void;
}

export function QuickDateSelector({ onDateSelect }: QuickDateSelectorProps) {
  const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDateSelect(getFutureDate(1))}
      >
        Завтра
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDateSelect(getFutureDate(3))}
      >
        Через 3 дня
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onDateSelect(getFutureDate(7))}
      >
        Через неделю
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const date = new Date();
          date.setDate(date.getDate() + 14);
          onDateSelect(date);
        }}
      >
        Через 2 недели
      </Button>
    </div>
  );
}