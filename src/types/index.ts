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