import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Clock, 
  Database, 
  Network, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react";
import { apiCache } from "@/lib/api-cache";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
  jsHeapSize: number;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0,
    jsHeapSize: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      const cacheStats = apiCache.getStats();

      setMetrics({
        loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
        renderTime: performance.now(),
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
        networkRequests: performance.getEntriesByType('resource').length,
        cacheHitRate: cacheStats.size > 0 ? (cacheStats.size / (cacheStats.size + 10)) * 100 : 0,
        jsHeapSize: memory ? memory.totalJSHeapSize / 1024 / 1024 : 0,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (metric: number, thresholds: [number, number]) => {
    if (metric < thresholds[0]) return { status: "good", color: "text-green-600" };
    if (metric < thresholds[1]) return { status: "warning", color: "text-yellow-600" };
    return { status: "poor", color: "text-red-600" };
  };

  const loadTimeStatus = getPerformanceStatus(metrics.loadTime, [2000, 5000]);
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, [50, 100]);

  if (!isVisible) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Performance Monitor
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tempo de Carregamento</span>
              </div>
              <Badge variant={loadTimeStatus.status === "good" ? "default" : "secondary"}>
                {metrics.loadTime.toFixed(0)}ms
              </Badge>
            </div>
            <Progress value={Math.min((metrics.loadTime / 5000) * 100, 100)} />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Uso de Memória</span>
              </div>
              <Badge variant={memoryStatus.status === "good" ? "default" : "secondary"}>
                {metrics.memoryUsage.toFixed(1)}MB
              </Badge>
            </div>
            <Progress value={Math.min((metrics.memoryUsage / 100) * 100, 100)} />
          </div>

          {/* Network Requests */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Requisições de Rede</span>
              </div>
              <Badge variant="outline">
                {metrics.networkRequests}
              </Badge>
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Taxa de Cache</span>
              </div>
              <Badge variant={metrics.cacheHitRate > 70 ? "default" : "secondary"}>
                {metrics.cacheHitRate.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={metrics.cacheHitRate} />
          </div>

          {/* Performance Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2">
              {loadTimeStatus.status === "good" && memoryStatus.status === "good" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-xs text-muted-foreground">
                {loadTimeStatus.status === "good" && memoryStatus.status === "good" 
                  ? "Desempenho Excelente" 
                  : "Desempenho Moderado"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enable in development only
export const ConditionalPerformanceDashboard = () => {
  return process.env.NODE_ENV === 'development' ? <PerformanceDashboard /> : null;
};