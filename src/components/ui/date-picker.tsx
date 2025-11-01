// components/ui/date-picker.tsx
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
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, 'yyyy-MM-dd') : ''
  );

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, 'yyyy-MM-dd'));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
    if (date) {
      setInputValue(format(date, 'yyyy-MM-dd'));
    } else {
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    } else if (value === '') {
      onChange(undefined);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={handleButtonClick}
        className={cn(
          'w-full justify-start text-left font-normal h-10',
          !value && 'text-muted-foreground'
        )}
        type="button"
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
              value={inputValue}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onKeyDown={handleInputKeyDown}
              className="w-full p-2 border border-gray-300 rounded-md"
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
}