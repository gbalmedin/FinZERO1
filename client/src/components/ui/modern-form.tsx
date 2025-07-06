import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ModernFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title?: string;
  description?: string;
  className?: string;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
}

export function ModernForm({
  children,
  onSubmit,
  title,
  description,
  className,
  isLoading = false,
  submitText = "Salvar",
  cancelText = "Cancelar",
  onCancel
}: ModernFormProps) {
  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {(title || description) && (
        <div className="text-center space-y-2 pb-6 flex-shrink-0">
          {title && (
            <h2 className="text-2xl font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
      )}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              {children}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t flex-shrink-0">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1 h-11 font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  submitText
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="w-full sm:w-24 h-11 font-medium border-gray-300 hover:bg-gray-50"
                >
                  {cancelText}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface ModernFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  description?: string;
}

export function ModernField({
  label,
  error,
  required,
  children,
  className,
  description
}: ModernFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-900 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      <div className="relative">
        {children}
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

interface IconGridProps {
  icons: Array<{ name: string; icon: ReactNode; value: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function IconGrid({ icons, selectedValue, onSelect, className }: IconGridProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {icons.map((iconItem) => (
        <button
          key={iconItem.value}
          type="button"
          onClick={() => onSelect(iconItem.value)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50",
            selectedValue === iconItem.value
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-200 text-gray-600"
          )}
        >
          <div className="mb-1">{iconItem.icon}</div>
          <span className="text-xs font-medium">{iconItem.name}</span>
        </button>
      ))}
    </div>
  );
}

interface ModernSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
  className?: string;
}

export function ModernSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  children, 
  className 
}: ModernSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-gray-400",
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}