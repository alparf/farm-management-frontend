'use client';

import { useState, Suspense, lazy } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { TabButton } from '@/components/common';
import { RefreshCw, Package, Sprout, BarChart3, Car, Gauge, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyTabContent } from '@/components/LazyTabContent';

const TreatmentsTab = lazy(() => import('@/components/treatments/treatments-tab'));
const InventoryTab = lazy(() => import('@/components/inventory/inventory-tab'));
const AnalyticsTab = lazy(() => import('@/components/analytics/analytics-content'));
const VehiclesTab = lazy(() => import('@/components/vehicles/vehicles-tab'));
const EquipmentTab = lazy(() => import('@/components/equipment/equipment-tab'));
const ShipmentsTab = lazy(() => import('@/components/shipments/shipments-tab'));

type TabType = 'analytics' | 'treatments' | 'inventory' | 'vehicles' | 'equipment' | 'shipments';

const TabLoader = () => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
    <p className="mt-2 text-gray-500">Загрузка...</p>
  </div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [loadedTabs, setLoadedTabs] = useState<Set<TabType>>(new Set(['analytics']));
  
  const {
    shipments,
    treatments,
    inventory,
    vehicles,
    equipment,
    refetchShipments,
    refetchTreatments,
    refetchInventory,
    refetchVehicles,
    refetchEquipment,
    refetchMaintenance,
  } = useAppData();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setLoadedTabs(prev => new Set(prev).add(tab));
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'treatments': refetchTreatments(); break;
      case 'inventory': refetchInventory(); break;
      case 'analytics': refetchShipments(); break;
      case 'vehicles': refetchVehicles(); refetchMaintenance(); break;
      case 'equipment': refetchEquipment(); break;
      case 'shipments': refetchShipments(); break;
      default: break;
    }
  };

  const getCount = (tab: TabType) => {
    switch (tab) {
      case 'treatments': return treatments.length;
      case 'inventory': return inventory.length;
      case 'vehicles': return vehicles.length;
      case 'equipment': return equipment.length;
      case 'shipments': return shipments.length;
      default: return 0;
    }
  };

  const tabComponents: Record<TabType, { component: React.ReactNode; label: string; icon: React.ReactNode }> = {
    analytics: {
      component: <AnalyticsTab />,
      label: 'Аналитика',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    treatments: {
      component: <TreatmentsTab />,
      label: 'Обработки',
      icon: <Sprout className="h-4 w-4" />,
    },
    inventory: {
      component: <InventoryTab />,
      label: 'Склад СЗР',
      icon: <Package className="h-4 w-4" />,
    },
    vehicles: {
      component: <VehiclesTab />,
      label: 'Техника',
      icon: <Car className="h-4 w-4" />,
    },
    equipment: {
      component: <EquipmentTab />,
      label: 'Оборудование',
      icon: <Gauge className="h-4 w-4" />,
    },
    shipments: {
      component: <ShipmentsTab />,
      label: 'Отгрузки',
      icon: <Truck className="h-4 w-4" />,
    },
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Сельхозучет</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Кнопки вкладок */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6 overflow-x-auto">
        {Object.entries(tabComponents).map(([key, tab]) => (
          <TabButton
            key={key}
            active={activeTab === key}
            onClick={() => handleTabChange(key as TabType)}
            icon={tab.icon}
            label={tab.label}
            count={getCount(key as TabType)}
          />
        ))}
      </div>

      {/* Исправленный блок ленивой загрузки */}
      <LazyTabContent
        isActive={true} // Мы передаем true, так как рендерим только активный компонент
        fallback={<TabLoader />}
      >
        <Suspense fallback={<TabLoader />}>
          {tabComponents[activeTab].component}
        </Suspense>
      </LazyTabContent>
    </div>
  );
}