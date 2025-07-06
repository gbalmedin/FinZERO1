import { forwardRef, useState } from "react";
import { formatCurrencyInput, parseCurrencyToNumber, CURRENCY_PLACEHOLDER } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | number;
  onChange?: (value: string) => void;
  displayValue?: string;
  error?: boolean;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, displayValue, error, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(() => {
      if (displayValue !== undefined) return displayValue;
      if (value) {
        // Format existing value to Brazilian format
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (numValue && !isNaN(numValue)) {
          return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(numValue);
        }
      }
      return "";
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formattedValue = formatCurrencyInput(inputValue);
      
      setInternalValue(formattedValue);
      
      if (onChange) {
        // For form libraries, we send the numeric value as string
        const numericValue = parseCurrencyToNumber(formattedValue);
        onChange(String(numericValue));
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Prevent auto-selection on focus
      setTimeout(() => {
        if (e.target.selectionStart === 0 && e.target.selectionEnd === e.target.value.length) {
          e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        }
      }, 0);
      
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ensure proper formatting on blur
      if (internalValue) {
        const numericValue = parseCurrencyToNumber(internalValue);
        const properlyFormatted = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numericValue);
        
        setInternalValue(properlyFormatted);
        if (onChange) {
          onChange(String(numericValue));
        }
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const [isFocused, setIsFocused] = useState(false);

    const handleFocusInternal = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      handleFocus(e);
    };

    const handleBlurInternal = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      handleBlur(e);
    };

    return (
      <div className="relative">
        <span className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-sm font-medium transition-colors duration-200",
          isFocused && !error && "text-blue-500",
          error && "text-red-500",
          !isFocused && !error && "text-gray-400"
        )}>
          R$
        </span>
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-11 w-full rounded-xl border bg-white pl-8 pr-3 py-2 text-sm font-mono text-right font-medium transition-all duration-200",
            "placeholder:text-gray-400 placeholder:font-normal",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-gray-400",
            error 
              ? "border-red-300 focus:ring-red-500 bg-red-50/30" 
              : "border-gray-300",
            isFocused && !error && "border-blue-400 shadow-sm",
            className
          )}
          placeholder={CURRENCY_PLACEHOLDER}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocusInternal}
          onBlur={handleBlurInternal}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };