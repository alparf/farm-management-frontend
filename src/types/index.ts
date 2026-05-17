// src/types/index.ts

export interface ChemicalProduct {
  id?: number;
  productId: number;
  ratePerHa: number;
  unit: 'л/га' | 'кг/га';
  treatmentId?: number;
  product?: {
    id: number;
    name: string;
    type: ProductType;
    unit: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ChemicalTreatment {
  id: number;
  culture: CultureType;
  area: number;
  completed: boolean;           // ✅ Статус выполнения
  dueDate: Date;                // ✅ Плановая дата
  actualDate?: Date;            // ✅ Фактическая дата выполнения
  isTankMix: boolean;
  hasCompatibilityIssues?: boolean;
  compatibilityWarnings?: string;
  notes?: string;
  createdAt: Date;
  chemicalProducts: ChemicalProduct[];
}

export interface ProductInventory {
  id: number;
  name: string;
  type: ProductType;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InventoryUnit = 'кг' | 'л' | 'г' | 'мл' | 'уп' | 'шт';

export type CultureType = 
  | 'груша' | 'яблоко' | 'черешня' | 'слива' | 'томаты' 
  | 'картофель' | 'лук' | 'свекла' | 'морковь' | 'капуста' | 'другое';

export type ProductType = 
  | 'гербицид' | 'инсектицид' | 'фунгицид' | 'десикант' 
  | 'регулятор роста' | 'удобрение' | 'биопрепарат' | 'адъювант';

export interface TreatmentTimeline {
  culture: CultureType;
  treatments: Array<{
    id: number;
    date: Date;
    products: string[];
    type: ProductType | 'Баковая смесь';
    completed?: boolean;        // ✅ Добавлено для отображения статуса на таймлайне
    isTankMix: boolean;
    tankMixTypes: ProductType[];
    notes?: string;
  }>;
}

export interface CultureStats {
  culture: CultureType;
  totalTreatments: number;
  completedTreatments: number;  // ✅ Добавлено для статистики
  plannedTreatments: number;
  lastTreatment?: Date | null;   // ✅ Добавлено для последней обработки
  nextTreatment: Date | null;
  productsUsed: string[];
  tankMixCount: number;
  tankMixTypes: ProductType[][];
}

export interface Vehicle {
  id: number;
  name: string;
  type: VehicleType;
  model?: string;
  year?: number;
  vin?: string;
  insuranceDate?: Date;
  roadLegalUntil?: Date; 
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: number;
  vehicleId: number;
  vehicleName: string;
  type: MaintenanceType;
  date: Date;
  hours?: number;
  description: string;
  notes?: string;
  createdAt: Date;
}

export type VehicleType = 
  | 'трактор'
  | 'комбайн'
  | 'грузовой автомобиль'
  | 'легковой автомобиль'
  | 'прицеп'
  | 'сельхозорудие'
  | 'другая техника';

export type MaintenanceType = 'Плановое ТО' | 'Внеплановый ремонт';

export interface CompatibilityRule {
  productType1: ProductType;
  productType2: ProductType;
  compatible: boolean;
  notes?: string;
}

export interface TankMixCompatibility {
  isCompatible: boolean;
  warnings: string[];
  errors: string[];
}

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  // Несовместимые комбинации
  { productType1: 'гербицид', productType2: 'регулятор роста', compatible: false, notes: 'Может вызвать фитотоксичность' },
  { productType1: 'фунгицид', productType2: 'биопрепарат', compatible: false, notes: 'Биопрепараты теряют эффективность' },
  { productType1: 'инсектицид', productType2: 'биопрепарат', compatible: false, notes: 'Гибель полезных микроорганизмов' },
  
  // Совместимые комбинации
  { productType1: 'фунгицид', productType2: 'инсектицид', compatible: true },
  { productType1: 'гербицид', productType2: 'адъювант', compatible: true },
  { productType1: 'удобрение', productType2: 'регулятор роста', compatible: true },
];

export interface Equipment {
  id: number;
  name: string;
  type: EquipmentType;
  model?: string;
  serialNumber?: string;
  verificationDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EquipmentType = 
  | 'весы'
  | 'ph-метр'
  | 'термометр'
  | 'влагоанализатор'
  | 'анализатор'
  | 'дозатор'
  | 'другое';