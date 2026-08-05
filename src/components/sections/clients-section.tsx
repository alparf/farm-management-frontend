'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientList } from '@/components/clients/client-list';
import { ClientForm } from '@/components/clients/client-form';
import { ClientFilters } from '@/components/clients/client-filters';

export function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { getBaseUrl } = useApi();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getBaseUrl()}/clients`);
      const data = await res.json();
      setClients(data.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    await fetch(`${getBaseUrl()}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchData();
  };

  const handleUpdate = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingClient) return;
    await fetch(`${getBaseUrl()}/clients/${editingClient.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingClient(undefined);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${getBaseUrl()}/clients/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Клиенты ({filtered.length})</h2>
        <Button onClick={() => setShowForm(true)}>
          Новый клиент
        </Button>
      </div>

      {showForm && (
        <ClientForm
          onSubmit={editingClient ? handleUpdate : handleAdd}
          onCancel={handleCancel}
          initialData={editingClient}
        />
      )}

      <ClientFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <ClientList clients={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}