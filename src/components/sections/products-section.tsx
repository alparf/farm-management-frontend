'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductList } from '@/components/products/product-list';
import { ProductForm } from '@/components/products/product-form';
import { ProductFilters } from '@/components/products/product-filters';

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { getBaseUrl } = useApi();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getBaseUrl()}/products`);
      const data = await res.json();
      setProducts(data.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    await fetch(`${getBaseUrl()}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchData();
  };

  const handleUpdate = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProduct) return;
    await fetch(`${getBaseUrl()}/products/${editingProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditingProduct(undefined);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${getBaseUrl()}/products/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Товары ({filtered.length})</h2>
        <Button onClick={() => setShowForm(true)}>
          Новый товар
        </Button>
      </div>

      {showForm && (
        <ProductForm
          onSubmit={editingProduct ? handleUpdate : handleAdd}
          onCancel={handleCancel}
          initialData={editingProduct}
        />
      )}

      <ProductFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <ProductList products={filtered} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}