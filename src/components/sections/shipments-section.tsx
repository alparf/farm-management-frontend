'use client';

import { useState, useEffect, useRef } from 'react';
import { Shipment, Client, Product } from '@/types';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ShipmentList } from '@/components/shipments/shipment-list';
import { ShipmentForm } from '@/components/shipments/shipment-form';
import { ShipmentFilters } from '@/components/shipments/shipment-filters';
import { generateShipmentsReport } from '@/utils/reportShipments';

interface ShipmentsSectionProps {
  clientFilter?: string;
  productFilter?: string;
  onClearClientFilter?: () => void;
  onClientFilterChange?: (clientId: string) => void;
}

export function ShipmentsSection({ 
  clientFilter = '', 
  productFilter = '',
  onClearClientFilter,
  onClientFilterChange 
}: ShipmentsSectionProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilterLocal, setClientFilterLocal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { getBaseUrl } = useApi();

  // Реф для прокрутки к форме
  const formRef = useRef<HTMLDivElement>(null);

  // Эффект для синхронизации фильтра из родителя
  useEffect(() => {
    if (clientFilter) {
      setClientFilterLocal(clientFilter);
    }
  }, [clientFilter]);

  // Эффект для сброса фильтра при клике на "Все клиенты"
  useEffect(() => {
    if (clientFilter === '' && clientFilterLocal !== '') {
      // Если фильтр сброшен в родителе, сбрасываем локальный
      setClientFilterLocal('');
    }
  }, [clientFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, clientsRes, productsRes] = await Promise.all([
        fetch(`${getBaseUrl()}/shipments`),
        fetch(`${getBaseUrl()}/clients`),
        fetch(`${getBaseUrl()}/products`),
      ]);
      const shipmentsData = await shipmentsRes.json();
      const clientsData = await clientsRes.json();
      const productsData = await productsRes.json();

      setShipments(
        shipmentsData.map((s: any) => ({
          ...s,
          date: new Date(s.date),
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          items: s.items.map((item: any) => ({
            ...item,
            pricePerUnit: Number(item.pricePerUnit) || 0,
            returnQuantity: item.returnQuantity !== undefined && item.returnQuantity !== null ? Number(item.returnQuantity) : null,
          })),
        }))
      );
      setClients(
        clientsData.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) }))
      );
      setProducts(
        productsData.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Эффект для прокрутки к форме, когда она появляется
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [showForm]);

  const handleAdd = async (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const payload = {
        clientId: data.clientId,
        date: data.date.toISOString(),
        notes: data.notes || null,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          pricePerUnit: Number(item.pricePerUnit) || 0,
          ...(item.returnQuantity && Number(item.returnQuantity) > 0 ? { returnQuantity: Number(item.returnQuantity) } : {}),
        })),
      };
      await fetch(`${getBaseUrl()}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Ошибка создания отгрузки:', error);
    }
  };

  const handleUpdate = async (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingShipment) return;
    try {
      const payload = {
        clientId: data.clientId,
        date: data.date.toISOString(),
        notes: data.notes || null,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          pricePerUnit: Number(item.pricePerUnit) || 0,
          ...(item.returnQuantity && Number(item.returnQuantity) > 0 ? { returnQuantity: Number(item.returnQuantity) } : {}),
        })),
      };
      const response = await fetch(`${getBaseUrl()}/shipments/${editingShipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }
      setEditingShipment(undefined);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Ошибка обновления отгрузки:', error);
      alert('Не удалось сохранить изменения. Проверьте консоль.');
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${getBaseUrl()}/shipments/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingShipment(undefined);
  };

  const handleClientFilterChange = (value: string) => {
    setClientFilterLocal(value);
    // Сообщаем родителю об изменении фильтра
    if (onClientFilterChange) {
      onClientFilterChange(value);
    }
    // Если выбрали "Все клиенты" в выпадающем списке, сбрасываем фильтр в родителе
    if (value === '' && onClearClientFilter) {
      onClearClientFilter();
    }
  };

  // Определяем активный фильтр (из родителя или локальный)
  const activeClientFilter = clientFilter || clientFilterLocal;

  const filtered = shipments.filter(shipment => {
    const client = clients.find(c => c.id === shipment.clientId);
    
    // Поиск
    const matchSearch =
      (client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shipment.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Фильтр по клиенту
    const matchClient = activeClientFilter ? shipment.clientId === parseInt(activeClientFilter) : true;
    
    // Фильтр по продукту (из пропса)
    let matchProduct = true;
    if (productFilter) {
      matchProduct = shipment.items.some(item => String(item.productId) === productFilter);
    }
    
    // Фильтр по дате
    const matchDateFrom = dateFrom ? new Date(shipment.date) >= new Date(dateFrom) : true;
    const matchDateTo = dateTo ? new Date(shipment.date) <= new Date(dateTo) : true;
    
    return matchSearch && matchClient && matchProduct && matchDateFrom && matchDateTo;
  });

  const handleGenerateReport = () => {
    generateShipmentsReport({
      shipments: filtered,
      clients,
      products,
      filters: {
        searchQuery,
        clientFilter: activeClientFilter,
        dateFrom,
        dateTo,
        productFilter,
      },
    });
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      {/* Контейнер для формы с рефом */}
      <div ref={formRef}>
        {showForm && (
          <ShipmentForm
            onSubmit={editingShipment ? handleUpdate : handleAdd}
            onCancel={handleCancel}
            clients={clients}
            products={products}
            initialData={editingShipment}
          />
        )}
      </div>

      <ShipmentFilters
        clients={clients}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        clientFilter={activeClientFilter}
        onClientFilterChange={handleClientFilterChange}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onGenerateReport={handleGenerateReport}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Отгрузки ({filtered.length})</h2>
        <Button onClick={() => setShowForm(true)} disabled={clients.length === 0 || products.length === 0}>
          Новая отгрузка
        </Button>
      </div>

      <ShipmentList
        shipments={filtered}
        clients={clients}
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}