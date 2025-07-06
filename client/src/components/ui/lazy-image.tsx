import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const shouldShowPlaceholder = !isLoaded && !hasError && isInView;
  const shouldShowBlur = blurDataURL && !isLoaded && !hasError;

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
    >
      {/* Blur placeholder */}
      {shouldShowBlur && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover filter blur-md scale-105',
            className
          )}
          aria-hidden="true"
        />
      )}

      {/* Custom placeholder */}
      {shouldShowPlaceholder && placeholder && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400',
            className
          )}
        >
          {placeholder}
        </div>
      )}

      {/* Default placeholder */}
      {shouldShowPlaceholder && !placeholder && !blurDataURL && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            className
          )}
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'hidden',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400',
            className
          )}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Hook for generating blur data URLs from images (optional enhancement)
export function useBlurDataURL(src: string) {
  const [blurDataURL, setBlurDataURL] = useState<string>();

  useEffect(() => {
    if (!src) return;

    // Create a canvas to generate a low-quality version
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Create small version (10x10)
      canvas.width = 10;
      canvas.height = 10;
      
      ctx.drawImage(img, 0, 0, 10, 10);
      
      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.1);
        setBlurDataURL(dataURL);
      } catch (error) {
        // Handle CORS or other errors silently
        console.warn('Could not generate blur data URL:', error);
      }
    };
    
    img.src = src;
  }, [src]);

  return blurDataURL;
}