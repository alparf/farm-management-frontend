'use client';

import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { TreatmentsTab } from '@/components/treatments/treatments-tab';
import { VehiclesTab } from '@/components/vehicles/vehicles-tab';
import { AnalyticsTab } from '@/components/analytics-tab';
import { EquipmentTab } from '@/components/equipment/equipment-tab';
import { InventoryTab } from '@/components/inventory/inventory-tab';
import { ShipmentsTab } from '@/components/shipments/shipments-tab';
import { TabButton, LoadingState } from '@/components/common';
import { RefreshCw, Package, Sprout, BarChart3, Car, Gauge, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabType = 'treatments' | 'inventory' | 'analytics' | 'vehicles' | 'equipment' | 'shipments';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
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

      <div className="flex flex-wrap border-b border-gray-200 mb-6 overflow-x-auto">
        <TabButton
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          icon={<BarChart3 className="h-4 w-4" />}
          label="Аналитика"
        />
        <TabButton
          active={activeTab === 'treatments'}
          onClick={() => setActiveTab('treatments')}
          icon={<Sprout className="h-4 w-4" />}
          label="Обработки"
          count={treatments.length}
        />
        <TabButton
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')}
          icon={<Package className="h-4 w-4" />}
          label="Склад СЗР"
          count={inventory.length}
        />
        <TabButton
          active={activeTab === 'vehicles'}
          onClick={() => setActiveTab('vehicles')}
          icon={<Car className="h-4 w-4" />}
          label="Техника"
          count={vehicles.length}
        />
        <TabButton
          active={activeTab === 'equipment'}
          onClick={() => setActiveTab('equipment')}
          icon={<Gauge className="h-4 w-4" />}
          label="Оборудование"
          count={equipment.length}
        />
        <TabButton
          active={activeTab === 'shipments'}
          onClick={() => setActiveTab('shipments')}
          icon={<Truck className="h-4 w-4" />}
          label="Отгрузки"
          count={shipments.length}
        />
      </div>

      {activeTab === 'treatments' && <TreatmentsTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'vehicles' && <VehiclesTab />}
      {activeTab === 'equipment' && <EquipmentTab />}
      {activeTab === 'shipments' && <ShipmentsTab />}
    </div>
  );
}