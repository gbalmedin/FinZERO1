import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, icon, error, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    return (
      <div className="relative">
        {icon && (
          <div className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-200",
            isFocused && "text-blue-500",
            error && "text-red-500"
          )}>
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-gray-400 placeholder:font-normal",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-gray-400",
            icon && "pl-10",
            error 
              ? "border-red-300 focus:ring-red-500 bg-red-50/30" 
              : "border-gray-300",
            isFocused && !error && "border-blue-400 shadow-sm",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
    );
  }
);

ModernInput.displayName = "ModernInput";

export { ModernInput };