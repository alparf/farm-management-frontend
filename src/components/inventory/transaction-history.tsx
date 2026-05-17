'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';
import { CalendarDays, Filter, Search, ArrowUpDown, X, Package } from 'lucide-react';

interface Transaction {
  id: number;
  productId: number;
  productName?: string;
  productType?: string;
  productUnit?: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  balanceAfter: number;
  referenceType: 'TREATMENT' | 'MANUAL_IN' | 'MANUAL_ADJUST' | null;
  referenceId: number | null;
  description: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  type: string;
  unit: string;
}

interface TransactionHistoryProps {
  refreshKey?: number;
}

type SortField = 'date' | 'type' | 'quantity' | 'balance' | 'product';
type SortOrder = 'asc' | 'desc';

export function TransactionHistory({ refreshKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBaseUrl } = useApi();
  
  // Фильтры
  const [selectedProductId, setSelectedProductId] = useState<number | 'all'>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Сортировка
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const baseUrlRef = useRef<string>('');

  // Уникальные типы СЗР из продуктов
  const uniqueProductTypes = useMemo(() => {
    const types = new Set(products.map(p => p.type));
    return Array.from(types).sort();
  }, [products]);
  
  useEffect(() => {
    if (!baseUrlRef.current) {
      baseUrlRef.current = getBaseUrl();
    }
  }, [getBaseUrl]);

  // Загрузка всех транзакций с информацией о продуктах
  const fetchAllTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Загружаем все транзакции
      const transactionsResponse = await fetch(`${baseUrlRef.current}/inventory/transactions/all`);
      
      if (!transactionsResponse.ok) {
        throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
      }
      
      let allTransactions = await transactionsResponse.json();
      
      // Загружаем список продуктов для информации
      const productsResponse = await fetch(`${baseUrlRef.current}/inventory`);
      const allProducts = await productsResponse.json();
      setProducts(allProducts);
      
      // Обогащаем транзакции информацией о продуктах
      allTransactions = allTransactions.map((tx: any) => {
        const product = allProducts.find((p: any) => p.id === tx.productId);
        return {
          ...tx,
          productName: product?.name || `ID: ${tx.productId}`,
          productType: product?.type || 'unknown',
          productUnit: product?.unit || '',
        };
      });
      
      setTransactions(allTransactions);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Не удалось загрузить историю движений');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTransactions();
  }, [refreshKey, fetchAllTransactions]);

  // Применение фильтров и сортировки
  useEffect(() => {
    let result = [...transactions];
    
    // Фильтр по конкретному СЗР
    if (selectedProductId !== 'all') {
      result = result.filter(tx => tx.productId === selectedProductId);
    }
    
    // Фильтр по типу СЗР
    if (productTypeFilter !== 'all') {
      result = result.filter(tx => tx.productType === productTypeFilter);
    }
    
    // Фильтр по типу операции
    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }
    
    // Фильтр по поиску (описание, название СЗР)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tx => 
        tx.productName?.toLowerCase().includes(query) ||
        tx.description?.toLowerCase().includes(query) ||
        getReferenceLabel(tx).toLowerCase().includes(query)
      );
    }
    
    // Фильтр по дате (от)
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(tx => new Date(tx.createdAt) >= fromDate);
    }
    
    // Фильтр по дате (до)
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(tx => new Date(tx.createdAt) <= toDate);
    }
    
    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'balance':
          comparison = a.balanceAfter - b.balanceAfter;
          break;
        case 'product':
          comparison = (a.productName || '').localeCompare(b.productName || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredTransactions(result);
  }, [transactions, selectedProductId, productTypeFilter, typeFilter, searchQuery, dateFrom, dateTo, sortField, sortOrder]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge variant="default" className="bg-green-600">Приход</Badge>;
      case 'OUT':
        return <Badge variant="destructive">Расход</Badge>;
      case 'ADJUSTMENT':
        return <Badge variant="secondary">Корректировка</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getReferenceLabel = (tx: Transaction) => {
    if (tx.referenceType === 'TREATMENT') {
      return `Обработка #${tx.referenceId}`;
    }
    if (tx.referenceType === 'MANUAL_IN') {
      return 'Ручной приход';
    }
    if (tx.referenceType === 'MANUAL_ADJUST') {
      return 'Ручная корректировка';
    }
    return '—';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSelectedProductId('all');
    setProductTypeFilter('all');
    setTypeFilter('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = selectedProductId !== 'all' || productTypeFilter !== 'all' || typeFilter !== 'all' || searchQuery || dateFrom || dateTo;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Нет записей о движении СЗР
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Кнопка фильтров */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Фильтры
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {filteredTransactions.length}/{transactions.length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3 w-3" />
            Сбросить все
          </Button>
        )}
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Выбор СЗР */}
            <div>
              <Label className="text-xs text-gray-600">СЗР</Label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">Все СЗР</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.type})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Тип СЗР */}
            <div>
              <Label className="text-xs text-gray-600">Тип СЗР</Label>
              <select
                value={productTypeFilter}
                onChange={(e) => setProductTypeFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">Все типы</option>
                {uniqueProductTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Тип операции */}
            <div>
              <Label className="text-xs text-gray-600">Тип операции</Label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">Все операции</option>
                <option value="IN">Приход</option>
                <option value="OUT">Расход</option>
                <option value="ADJUSTMENT">Корректировка</option>
              </select>
            </div>
            
            {/* Поиск */}
            <div className="lg:col-span-2">
              <Label className="text-xs text-gray-600">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Название СЗР, описание, источник..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Дата от */}
            <div>
              <Label className="text-xs text-gray-600">Дата от</Label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
            
            {/* Дата до */}
            <div>
              <Label className="text-xs text-gray-600">Дата до</Label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Найдено: {filteredTransactions.length} из {transactions.length} записей
          </div>
        </div>
      )}

      {/* Таблица с сортировкой */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Дата
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('product')}>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Package className="h-3.5 w-3.5" />
                    СЗР
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('type')}>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    Тип
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('quantity')}>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    Количество
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('balance')}>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    Остаток
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </div>
                </TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Описание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-sm whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="font-medium">{tx.productName}</span>
                    <span className="text-xs text-gray-400 ml-1">({tx.productUnit})</span>
                  </TableCell>
                  <TableCell>{getTypeBadge(tx.type)}</TableCell>
                  <TableCell className={tx.type === 'OUT' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {tx.type === 'OUT' ? `-${tx.quantity}` : `+${tx.quantity}`}
                  </TableCell>
                  <TableCell className="font-medium">{tx.balanceAfter}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {getReferenceLabel(tx)}
                  </TableCell>
                  <TableCell className="text-sm max-w-md truncate" title={tx.description || ''}>
                    {tx.description || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Нет записей, соответствующих фильтрам
        </div>
      )}
    </div>
  );
}