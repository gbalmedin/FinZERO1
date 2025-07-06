import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  placeholder,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    },
    []
  );

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  // Show placeholder while loading or on error
  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Placeholder */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse flex items-center justify-center",
            className
          )}
        >
          {placeholder ? (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
          )}
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={loading === "lazy" && !isInView ? undefined : src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  );
}

// Memoized version for better performance
export const MemoizedOptimizedImage = React.memo(OptimizedImage);