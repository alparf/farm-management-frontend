'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';

interface LazyTabContentProps {
  isActive: boolean;
  children: ReactNode;
  onLoad?: () => void;
  fallback?: ReactNode;
}

export function LazyTabContent({ 
  isActive, 
  children, 
  onLoad, 
  fallback 
}: LazyTabContentProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadTriggered = useRef(false);

  // При первой активации вкладки загружаем контент
  useEffect(() => {
    if (isActive && !loadTriggered.current) {
      loadTriggered.current = true;
      setHasLoaded(true);
      if (onLoad) onLoad();
    }
  }, [isActive, onLoad]);

  // 1. Если вкладка активна и уже загружена - показываем контент
  if (isActive && hasLoaded) {
    return <>{children}</>;
  }

  // 2. Если вкладка активна, но еще не загружена (первый рендер) - показываем fallback
  if (isActive && !hasLoaded) {
    return <>{fallback}</>;
  }

  // 3. Если вкладка не активна - возвращаем null (полная ленивая загрузка)
  return null;
}