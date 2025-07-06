import { useEffect, useState, useCallback } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    networkRequests: 0,
  });

  const startTime = Date.now();

  const recordMetric = useCallback((metric: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({ ...prev, ...metric }));
  }, []);

  useEffect(() => {
    const renderTime = Date.now() - startTime;
    recordMetric({ renderTime });

    // Track memory usage if available
    if ((performance as any).memory) {
      const memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
      recordMetric({ memoryUsage });
    }

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime}ms`,
        memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage.toFixed(2)}MB` : 'N/A',
      });
    }
  }, [componentName, recordMetric, startTime, metrics.memoryUsage]);

  return { metrics, recordMetric };
}

// Hook for monitoring network requests
export function useNetworkMonitor() {
  const [requestCount, setRequestCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const startRequest = useCallback((url: string) => {
    setPendingRequests(prev => new Set(prev).add(url));
    setRequestCount(prev => prev + 1);
  }, []);

  const endRequest = useCallback((url: string) => {
    setPendingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  }, []);

  const isLoading = pendingRequests.size > 0;

  return {
    requestCount,
    pendingRequests: Array.from(pendingRequests),
    isLoading,
    startRequest,
    endRequest,
  };
}

// Hook for optimizing re-renders
export function useRenderOptimization() {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(Date.now());

  useEffect(() => {
    const now = Date.now();
    setRenderCount(prev => prev + 1);
    setLastRenderTime(now);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render] Component rendered ${renderCount + 1} times`);
    }
  });

  return {
    renderCount,
    lastRenderTime,
    timeSinceLastRender: Date.now() - lastRenderTime,
  };
}