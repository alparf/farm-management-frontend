'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Save } from 'lucide-react';

interface ClientFormProps {
  onSubmit: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Client;
}

export function ClientForm({ onSubmit, onCancel, initialData }: ClientFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      phone: phone || undefined,
      address: address || undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{initialData ? 'Редактировать клиента' : 'Новый клиент'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: ООО Агрофирма"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Населенный пункт, улица, дом"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-1">
              <X className="h-4 w-4" /> Отмена
            </Button>
            <Button type="submit" className="gap-1">
              <Save className="h-4 w-4" /> {initialData ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}