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