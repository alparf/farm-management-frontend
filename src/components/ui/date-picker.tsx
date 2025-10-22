'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Не делаем ничего при ручном вводе, чтобы не мешать форме
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={handleInputClick}
        className={cn(
          'w-full justify-start text-left font-normal h-8',
          !value && 'text-muted-foreground'
        )}
        type="button" // Важно: type="button" чтобы не отправлять форму
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, 'PPP', { locale: ru }) : <span>Выберите дату</span>}
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1 p-3 bg-white border border-gray-200 rounded-md shadow-lg">
            <input
              type="date"
              value={value ? format(value, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                handleDateSelect(newDate);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие
            />
          </div>
        </>
      )}
    </div>
  );
}