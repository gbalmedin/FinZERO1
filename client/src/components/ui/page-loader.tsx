import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  title?: string;
  subtitle?: string;
  variant?: "default" | "minimal" | "card";
}

export function PageLoader({ title, subtitle, variant = "default" }: PageLoaderProps) {
  const loadingText = title || "Carregando...";
  const subText = subtitle || "Aguarde um momento";

  if (variant === "minimal") {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{loadingText}</span>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <div>
              <h3 className="font-semibold text-sm">{loadingText}</h3>
              <p className="text-xs text-muted-foreground">{subText}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-12 h-12 rounded-full border-3 border-primary/30 border-t-primary mx-auto"></div>
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{loadingText}</h3>
          <p className="text-sm text-muted-foreground">{subText}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}