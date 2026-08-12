'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { Truck, Users, Box } from 'lucide-react';
import { ClientStats } from './client-stats';
import { ShipmentsSection } from '@/components/sections/shipments-section';
import { ClientsSection } from '@/components/sections/clients-section';
import { ProductsSection } from '@/components/sections/products-section';

export function ShipmentsTab() {
  const { shipments, shipmentsLoading } = useAppData();
  const [subTab, setSubTab] = useState<'shipments' | 'clients' | 'products'>('shipments');

  if (shipmentsLoading) return <div className="text-center py-8">Загрузка отгрузок...</div>;

  return (
    <div>
      <ClientStats shipments={shipments} />

      <div className="flex gap-4 border-b border-gray-200 mt-6 mb-4">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            subTab === 'shipments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSubTab('shipments')}
        >
          <Truck className="inline-block h-4 w-4 mr-2" />
          Отгрузки
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            subTab === 'clients'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSubTab('clients')}
        >
          <Users className="inline-block h-4 w-4 mr-2" />
          Клиенты
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            subTab === 'products'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setSubTab('products')}
        >
          <Box className="inline-block h-4 w-4 mr-2" />
          Товары
        </button>
      </div>

      {subTab === 'shipments' && <ShipmentsSection />}
      {subTab === 'clients' && <ClientsSection />}
      {subTab === 'products' && <ProductsSection />}
    </div>
  );
}