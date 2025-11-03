export interface ChemicalProduct {
  name: string;
  dosage: string;
  productType: ProductType;
}

export interface ChemicalTreatment {
  id: number;
  culture: CultureType;
  area: number;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  actualDate?: Date;
  notes?: string;
  isTankMix: boolean;
  chemicalProducts: ChemicalProduct[];
  hasCompatibilityIssues?: boolean;
  compatibilityWarnings?: string;
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
  treatments: {
    id: number;
    date: Date;
    products: string[];
    type: ProductType;
    completed: boolean;
  }[];
}

export interface CultureStats {
  culture: CultureType;
  totalTreatments: number;
  completedTreatments: number;
  plannedTreatments: number;
  lastTreatment?: Date;
  productsUsed: string[];
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

export type MaintenanceType = 
  | 'плановое ТО'
  | 'замена масла'
  | 'сезонное обслуживание'
  | 'внеплановый ремонт'
  | 'диагностика'
  | 'другое';

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