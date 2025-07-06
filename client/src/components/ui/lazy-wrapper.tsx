import { Suspense, ComponentType } from "react";
import { PageLoader } from "./page-loader";

interface LazyWrapperProps {
  component: ComponentType<any>;
  loadingTitle?: string;
  loadingSubtitle?: string;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ 
  component: Component, 
  loadingTitle, 
  loadingSubtitle,
  fallback 
}: LazyWrapperProps) {
  const defaultFallback = (
    <PageLoader 
      title={loadingTitle} 
      subtitle={loadingSubtitle} 
      variant="default"
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component />
    </Suspense>
  );
}