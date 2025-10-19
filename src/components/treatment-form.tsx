'use client';

import { useState, useMemo } from 'react';
import { ChemicalTreatment, CultureType, ProductType, ChemicalProduct, ProductInventory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { QuickDateSelector } from '@/components/ui/quick-date-selector';

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

  // Все препараты для выпадающего списка
  const allProducts = useMemo(() => {
    return inventory.map(product => ({
      id: product.id,
      name: product.name,
      type: product.type,
      unit: product.unit
    }));
  }, [inventory]);

  const addProduct = () => {
    setProducts([...products, { name: '', dosage: '', productType: 'фунгицид' }]);
  };

  const updateProduct = (index: number, field: keyof ChemicalProduct, value: string) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // Обработчик выбора препарата
  const handleProductSelect = (index: number, selectedProductName: string) => {
    const selectedProduct = allProducts.find(p => p.name === selectedProductName);
    
    if (selectedProduct) {
      // Обновляем и название, и тип препарата
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
    
    if (products.some(p => !p.name || !p.dosage)) {
      alert('Заполните все поля препаратов');
      return;
    }

    if (!dueDate) {
      alert('Выберите плановую дату обработки');
      return;
    }

    onSubmit({
      culture,
      area: parseFloat(area),
      completed: false,
      dueDate,
      isTankMix,
      chemicalProducts: products,
      notes: notes || undefined
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
              <DatePicker value={dueDate} onChange={setDueDate} />
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
                Выберите из {inventory.length} доступных препаратов
              </span>
            </div>
            
            {products.map((product, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="col-span-5">
                  <Label>Название препарата</Label>
                  <select
                    value={product.name}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Выберите препарат...</option>
                    {allProducts.map((inventoryProduct) => (
                      <option key={inventoryProduct.id} value={inventoryProduct.name}>
                        {inventoryProduct.name} ({inventoryProduct.type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-3">
                  <Label>Дозировка</Label>
                  <Input
                    value={product.dosage}
                    onChange={(e) => updateProduct(index, 'dosage', e.target.value)}
                    placeholder="г/га или л/га"
                    required
                  />
                </div>
                
                <div className="col-span-3">
                  <Label>Тип</Label>
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
            ))}
            
            <Button type="button" variant="outline" onClick={addProduct}>
              + Добавить препарат
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              Создать обработку
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}