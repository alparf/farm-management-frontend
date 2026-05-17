'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChemicalTreatment, CultureType, ProductType, ProductInventory, COMPATIBILITY_RULES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { QuickDateSelector } from '@/components/ui/quick-date-selector';
import { AlertTriangle, X, Save } from 'lucide-react';

interface ChemicalProductWithUnit {
  productId: number;
  name: string;
  dosage: string;
  productType: ProductType;
  unit: string;
}

interface TreatmentFormProps {
  onSubmit: (treatment: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  inventory: ProductInventory[];
}

export function TreatmentForm({ onSubmit, onCancel, inventory }: TreatmentFormProps) {
  const [culture, setCulture] = useState<CultureType>('яблоко');
  const [area, setArea] = useState<string>('');
  const [isTankMix, setIsTankMix] = useState(false);
  const [dueDate, setDueDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [notes, setNotes] = useState<string>('');
  const [products, setProducts] = useState<ChemicalProductWithUnit[]>([
    { productId: 0, name: '', dosage: '', productType: 'фунгицид', unit: 'л/га' }
  ]);
  const [compatibilityWarning, setCompatibilityWarning] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Группируем препараты по типам
  const inventoryByType = useMemo(() => {
    const grouped: Record<ProductType, ProductInventory[]> = {
      'фунгицид': [],
      'инсектицид': [],
      'гербицид': [],
      'десикант': [],
      'регулятор роста': [],
      'удобрение': [],
      'биопрепарат': [],
      'адъювант': []
    };

    inventory.forEach(product => {
      if (grouped[product.type]) {
        grouped[product.type].push(product);
      }
    });

    return grouped;
  }, [inventory]);

  // Проверка совместимости
  const checkCompatibility = useCallback((products: ChemicalProductWithUnit[]) => {
    if (!isTankMix || products.length < 2) {
      setCompatibilityWarning('');
      return;
    }

    const validProducts = products.filter(p => p.name && p.productType);
    if (validProducts.length < 2) {
      setCompatibilityWarning('');
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < validProducts.length; i++) {
      for (let j = i + 1; j < validProducts.length; j++) {
        const product1 = validProducts[i];
        const product2 = validProducts[j];
        
        const rule = COMPATIBILITY_RULES.find(r => 
          (r.productType1 === product1.productType && r.productType2 === product2.productType) ||
          (r.productType1 === product2.productType && r.productType2 === product1.productType)
        );

        if (rule) {
          if (!rule.compatible) {
            errors.push(`${product1.productType} (${product1.name}) и ${product2.productType} (${product2.name}) - ${rule.notes || 'Несовместимы'}`);
          }
        } else {
          warnings.push(`Совместимость ${product1.productType} (${product1.name}) и ${product2.productType} (${product2.name}) не проверена`);
        }
      }
    }

    const productTypes = validProducts.map(p => p.productType);
    const uniqueTypes = new Set(productTypes);
    
    if (uniqueTypes.size > 3) {
      warnings.push('⚠️ Слишком много разных типов препаратов в смеси - возможна нестабильность');
    }

    const hasBiologics = productTypes.includes('биопрепарат');
    const hasChemicals = productTypes.some(type => 
      ['гербицид', 'инсектицид', 'фунгицид'].includes(type)
    );
    
    if (hasBiologics && hasChemicals) {
      warnings.push('⚠️ Биопрепараты могут терять эффективность в смеси с химическими средствами');
    }

    if (errors.length > 0) {
      setCompatibilityWarning(`❌ КРИТИЧЕСКИЕ ПРОБЛЕМЫ: ${errors.join('; ')}`);
    } else if (warnings.length > 0) {
      setCompatibilityWarning(`⚠️ ПРЕДУПРЕЖДЕНИЯ: ${warnings.join('; ')}`);
    } else {
      setCompatibilityWarning('✅ Препараты совместимы');
    }
  }, [isTankMix]);

  useEffect(() => {
    checkCompatibility(products);
  }, [products, isTankMix, checkCompatibility]);

  const addProduct = () => {
    setProducts([...products, { productId: 0, name: '', dosage: '', productType: 'фунгицид', unit: 'л/га' }]);
  };

  const updateProduct = (index: number, field: keyof ChemicalProductWithUnit, value: string | number) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    
    if (field === 'productType' && value !== newProducts[index].productType) {
      newProducts[index].name = '';
      newProducts[index].productId = 0;
    }
    
    if (field === 'name') {
      const selectedName = value as string;
      const selectedProduct = inventory.find(p => p.name === selectedName);
      if (selectedProduct) {
        newProducts[index].productId = selectedProduct.id;
        newProducts[index].productType = selectedProduct.type;
      }
    }
    
    setProducts(newProducts);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, selectedProductName: string) => {
    const selectedProduct = inventory.find(p => p.name === selectedProductName);
    
    if (selectedProduct) {
      const newProducts = [...products];
      newProducts[index] = {
        ...newProducts[index],
        productId: selectedProduct.id,
        name: selectedProduct.name,
        productType: selectedProduct.type,
      };
      setProducts(newProducts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const hasEmptyProducts = products.some(p => !p.name || !p.dosage);
    if (hasEmptyProducts) {
      alert('Заполните все поля препаратов');
      return;
    }

    const invalidProducts = products.filter(p => {
      return !inventory.some(ip => ip.id === p.productId);
    });

    if (invalidProducts.length > 0) {
      alert('Некоторые выбранные препараты не найдены в складе. Пожалуйста, выберите препараты из списка.');
      return;
    }

    if (!dueDate) {
      alert('Выберите плановую дату обработки');
      return;
    }

    const areaValue = parseFloat(area);
    if (isNaN(areaValue) || areaValue <= 0) {
      alert('Площадь должна быть положительным числом');
      return;
    }

    const hasCriticalIssues = compatibilityWarning.includes('КРИТИЧЕСКИЕ');
    const hasCompatibilityIssues = compatibilityWarning !== '' && !compatibilityWarning.includes('✅');

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        culture,
        area: areaValue,
        completed: false,
        dueDate,
        isTankMix,
        chemicalProducts: products.map(p => ({
          productId: p.productId,
          ratePerHa: parseFloat(p.dosage),
          unit: p.unit as 'л/га' | 'кг/га', 
        })),
        notes: notes || undefined,
        hasCompatibilityIssues: isTankMix ? hasCompatibilityIssues : undefined,
        compatibilityWarnings: isTankMix && hasCompatibilityIssues ? compatibilityWarning : undefined
      });
      // Очищаем форму после успешной отправки
      setArea('');
      setNotes('');
      setProducts([{ productId: 0, name: '', dosage: '', productType: 'фунгицид', unit: 'л/га' }]);
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при создании обработки';
      setError(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductsByType = (type: ProductType) => {
    return inventoryByType[type] || [];
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Новая обработка</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ошибка от сервера */}
          {error && (
            <div className="p-3 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Ошибка</p>
                  <p className="text-xs text-red-700 mt-1 whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="culture">Культура</Label>
              <select
                id="culture"
                value={culture}
                onChange={(e) => setCulture(e.target.value as CultureType)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="яблоко">Яблоко</option>
                <option value="груша">Груша</option>
                <option value="черешня">Черешня</option>
                <option value="слива">Слива</option>
                <option value="томаты">Томаты</option>
                <option value="картофель">Картофель</option>
                <option value="лук">Лук</option>
                <option value="свекла">Свекла</option>
                <option value="морковь">Морковь</option>
                <option value="капуста">Капуста</option>
                <option value="другое">Другое</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="area">Площадь (га)</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Плановая дата обработки</Label>
              <QuickDateSelector onDateSelect={setDueDate} />
              <DatePicker 
                value={dueDate} 
                onChange={(date) => {
                  if (date) {
                    setDueDate(date);
                  }
                }} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="isTankMix"
                  checked={isTankMix}
                  onChange={(e) => setIsTankMix(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isTankMix">
                  Баковая смесь 
                  <span className="text-xs text-gray-500 block">
                    (несколько препаратов в одной обработке)
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {compatibilityWarning && isTankMix && products.filter(p => p.name).length >= 2 && (
            <div className={`p-3 rounded-lg border ${
              compatibilityWarning.includes('КРИТИЧЕСКИЕ') 
                ? 'bg-red-50 border-red-200' 
                : compatibilityWarning.includes('ПРЕДУПРЕЖДЕНИЯ')
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  compatibilityWarning.includes('КРИТИЧЕСКИЕ') 
                    ? 'text-red-600' 
                    : compatibilityWarning.includes('ПРЕДУПРЕЖДЕНИЯ')
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    compatibilityWarning.includes('КРИТИЧЕСКИЕ') 
                      ? 'text-red-800' 
                      : compatibilityWarning.includes('ПРЕДУПРЕЖДЕНИЯ')
                        ? 'text-yellow-800'
                        : 'text-green-800'
                  }`}>
                    {compatibilityWarning.split(':')[0]}
                  </p>
                  <p className={`text-xs mt-1 ${
                    compatibilityWarning.includes('КРИТИЧЕСКИЕ') 
                      ? 'text-red-700' 
                      : compatibilityWarning.includes('ПРЕДУПРЕЖДЕНИЯ')
                        ? 'text-yellow-700'
                        : 'text-green-700'
                  }`}>
                    {compatibilityWarning.split(':').slice(1).join(':')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Препараты</Label>
              <span className="text-sm text-gray-500">
                {inventory.length} препаратов доступно
              </span>
            </div>
            
            {products.map((product, index) => {
              const availableProducts = getProductsByType(product.productType);
              const hasProducts = availableProducts.length > 0;
              
              return (
                <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-3">
                    <Label>Тип препарата</Label>
                    <select
                      value={product.productType}
                      onChange={(e) => updateProduct(index, 'productType', e.target.value as ProductType)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="фунгицид">Фунгицид</option>
                      <option value="инсектицид">Инсектицид</option>
                      <option value="гербицид">Гербицид</option>
                      <option value="десикант">Десикант</option>
                      <option value="регулятор роста">Регулятор роста</option>
                      <option value="удобрение">Удобрение</option>
                      <option value="биопрепарат">Биопрепарат</option>
                      <option value="адъювант">Адъювант</option>
                    </select>
                  </div>
                  
                  <div className="col-span-4">
                    <Label>
                      Название препарата
                      {hasProducts && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({availableProducts.length} доступно)
                        </span>
                      )}
                    </Label>
                    <select
                      value={product.name}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      required
                      disabled={!hasProducts}
                    >
                      <option value="">
                        {hasProducts ? 'Выберите препарат...' : 'Нет доступных препаратов'}
                      </option>
                      {availableProducts.map((inventoryProduct) => (
                        <option key={inventoryProduct.id} value={inventoryProduct.name}>
                          {inventoryProduct.name}
                        </option>
                      ))}
                    </select>
                    {!hasProducts && (
                      <p className="text-xs text-red-500 mt-1">
                        В складе нет препаратов типа "{product.productType}"
                      </p>
                    )}
                  </div>
                  
                  <div className="col-span-3">
                    <Label>Норма расхода</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={product.dosage}
                      onChange={(e) => updateProduct(index, 'dosage', e.target.value)}
                      placeholder="0.00"
                      required
                      className="text-right"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <Label>Ед.</Label>
                    <select
                      value={product.unit}
                      onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm"
                    >
                      <option value="л/га">л/га</option>
                      <option value="кг/га">кг/га</option>
                    </select>
                  </div>
                  
                  <div className="col-span-1">
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="w-full h-10"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            <Button type="button" variant="outline" onClick={addProduct} className="mt-2">
              + Добавить препарат
            </Button>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="gap-1" disabled={isSubmitting}>
              <X className="h-4 w-4" />
              Отмена
            </Button>
            <Button type="submit" className="gap-1" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Создание...' : 'Создать обработку'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}