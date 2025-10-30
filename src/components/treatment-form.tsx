// treatment-form.tsx - ПОЛНЫЙ ФАЙЛ:
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChemicalTreatment, CultureType, ProductType, ChemicalProduct, ProductInventory, COMPATIBILITY_RULES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { QuickDateSelector } from '@/components/ui/quick-date-selector';
import { AlertTriangle } from 'lucide-react';

interface TreatmentFormProps {
  onSubmit: (treatment: Omit<ChemicalTreatment, 'id' | 'createdAt'>) => void;
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
  const [products, setProducts] = useState<ChemicalProduct[]>([
    { name: '', dosage: '', productType: 'фунгицид' }
  ]);
  const [compatibilityWarning, setCompatibilityWarning] = useState<string>('');

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

  // Функция проверки совместимости
  const checkCompatibility = useCallback((products: ChemicalProduct[]) => {
    if (!isTankMix || products.length <= 1) {
      setCompatibilityWarning('');
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверяем все возможные пары продуктов
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const product1 = products[i];
        const product2 = products[j];
        
        // Ищем правило совместимости
        const rule = COMPATIBILITY_RULES.find(r => 
          (r.productType1 === product1.productType && r.productType2 === product2.productType) ||
          (r.productType1 === product2.productType && r.productType2 === product1.productType)
        );

        if (rule && !rule.compatible) {
          errors.push(`${product1.productType} (${product1.name}) и ${product2.productType} (${product2.name}) - ${rule.notes}`);
        }
      }
    }

    // Дополнительные проверки
    const productTypes = products.map(p => p.productType);
    const uniqueTypes = new Set(productTypes);
    
    if (uniqueTypes.size > 3) {
      warnings.push('Слишком много разных типов препаратов в смеси - возможна нестабильность');
    }

    const hasBiologics = productTypes.includes('биопрепарат');
    const hasChemicals = productTypes.some(type => 
      ['гербицид', 'инсектицид', 'фунгицид'].includes(type)
    );
    
    if (hasBiologics && hasChemicals) {
      warnings.push('Биопрепараты могут терять эффективность в смеси с химическими средствами');
    }

    // Формируем итоговое сообщение
    if (errors.length > 0) {
      setCompatibilityWarning(`⚠️ Критические проблемы совместимости: ${errors.join('; ')}`);
    } else if (warnings.length > 0) {
      setCompatibilityWarning(`ℹ️ Предупреждения: ${warnings.join('; ')}`);
    } else {
      setCompatibilityWarning('');
    }
  }, [isTankMix]);

  // Вызываем проверку при изменении продуктов или флага баковой смеси
  useEffect(() => {
    checkCompatibility(products);
  }, [products, isTankMix, checkCompatibility]);

  // Получаем препараты для выбранного типа
  const getProductsByType = (type: ProductType) => {
    return inventoryByType[type] || [];
  };

  const addProduct = () => {
    setProducts([...products, { name: '', dosage: '', productType: 'фунгицид' }]);
  };

  const updateProduct = (index: number, field: keyof ChemicalProduct, value: string) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    
    // Если меняем тип, очищаем название препарата
    if (field === 'productType' && value !== newProducts[index].productType) {
      newProducts[index].name = '';
    }
    
    setProducts(newProducts);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Обработчик выбора препарата
  const handleProductSelect = (index: number, selectedProductName: string) => {
    const productType = products[index].productType;
    const availableProducts = getProductsByType(productType);
    const selectedProduct = availableProducts.find(p => p.name === selectedProductName);
    
    if (selectedProduct) {
      const newProducts = [...products];
      newProducts[index] = {
        name: selectedProduct.name,
        dosage: '',
        productType: selectedProduct.type
      };
      setProducts(newProducts);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, что все препараты заполнены
    const hasEmptyProducts = products.some(p => !p.name || !p.dosage);
    if (hasEmptyProducts) {
      alert('Заполните все поля препаратов');
      return;
    }

    // Проверяем, что выбранные препараты существуют в складе
    const invalidProducts = products.filter(p => {
      const availableProducts = getProductsByType(p.productType);
      return !availableProducts.some(ap => ap.name === p.name);
    });

    if (invalidProducts.length > 0) {
      alert('Некоторые выбранные препараты не найдены в складе. Пожалуйста, выберите препараты из списка.');
      return;
    }

    if (!dueDate) {
      alert('Выберите плановую дату обработки');
      return;
    }

    // Проверяем совместимость для баковых смесей
    const hasCriticalIssues = compatibilityWarning.includes('Критические проблемы');
    const hasCompatibilityIssues = compatibilityWarning !== '';

    onSubmit({
      culture,
      area: parseFloat(area),
      completed: false,
      dueDate,
      isTankMix,
      chemicalProducts: products,
      notes: notes || undefined,
      hasCompatibilityIssues: isTankMix ? hasCompatibilityIssues : undefined,
      compatibilityWarnings: isTankMix ? compatibilityWarning : undefined
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Новая обработка</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Предупреждение о совместимости */}
          {compatibilityWarning && (
            <div className={`p-3 rounded-lg border ${
              compatibilityWarning.includes('Критические') 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start">
                <AlertTriangle className={`h-5 w-5 mr-2 mt-0.5 ${
                  compatibilityWarning.includes('Критические') 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    compatibilityWarning.includes('Критические') 
                      ? 'text-red-800' 
                      : 'text-yellow-800'
                  }`}>
                    {compatibilityWarning.split(':')[0]}:
                  </p>
                  <p className={`text-xs mt-1 ${
                    compatibilityWarning.includes('Критические') 
                      ? 'text-red-700' 
                      : 'text-yellow-700'
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
                  {/* Выбор типа препарата */}
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
                  
                  {/* Выбор препарата */}
                  <div className="col-span-5">
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
                  
                  {/* Дозировка */}
                  <div className="col-span-3">
                    <Label>Дозировка</Label>
                    <Input
                      value={product.dosage}
                      onChange={(e) => updateProduct(index, 'dosage', e.target.value)}
                      placeholder="г/га или л/га"
                      required
                    />
                  </div>
                  
                  {/* Кнопка удаления */}
                  <div className="col-span-1">
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="w-full"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            <Button type="button" variant="outline" onClick={addProduct}>
              + Добавить препарат
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button 
              type="submit"
              className={
                compatibilityWarning.includes('Критические') 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : ''
              }
            >
              {compatibilityWarning.includes('Критические') 
                ? 'Создать с предупреждением' 
                : 'Создать обработку'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}