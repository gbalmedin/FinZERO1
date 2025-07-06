import { useState } from "react";
import { cn } from "@/lib/utils";

// Credit card brands with their logos and properties
export const CREDIT_CARD_BRANDS = [
  {
    id: 'visa',
    name: 'Visa',
    displayName: 'Visa',
    color: '#1A1F71',
    logo: '/assets/cards/visa.svg',
    pattern: /^4/
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    displayName: 'Mastercard',
    color: '#EB001B',
    logo: '/assets/cards/mastercard.svg',
    pattern: /^5[1-5]/
  },
  {
    id: 'amex',
    name: 'American Express',
    displayName: 'American Express',
    color: '#006FCF',
    logo: '/assets/cards/amex.svg',
    pattern: /^3[47]/
  },
  {
    id: 'elo',
    name: 'Elo',
    displayName: 'Elo',
    color: '#FFD700',
    logo: '/assets/cards/elo.svg',
    pattern: /^(4011|4312|4389|4514|4573|5067|5090|5095|5096|5097|5099|636368|636297)/
  },
  {
    id: 'hipercard',
    name: 'Hipercard',
    displayName: 'Hipercard',
    color: '#E50000',
    logo: '/assets/cards/hipercard.svg',
    pattern: /^(606282|637095)/
  },
  {
    id: 'dinners',
    name: 'Dinners Club',
    displayName: 'Dinners Club',
    color: '#0079BE',
    logo: '/assets/cards/dinners.svg',
    pattern: /^3[0689]/
  }
];

interface CardLogoProps {
  brand?: string;
  name?: string;
  size?: number;
  className?: string;
  showFallback?: boolean;
}

export default function CardLogo({ 
  brand, 
  name, 
  size = 32, 
  className,
  showFallback = true 
}: CardLogoProps) {
  const [hasError, setHasError] = useState(false);
  
  const cardBrand = brand ? CREDIT_CARD_BRANDS.find(b => 
    b.id === brand.toLowerCase() || 
    b.name.toLowerCase() === brand.toLowerCase()
  ) : null;

  if (!cardBrand && !showFallback) {
    return null;
  }

  if (!cardBrand || hasError) {
    // Fallback to initials or generic card icon
    const initials = name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'CC';
    
    return (
      <div 
        className={cn(
          "rounded-md flex items-center justify-center text-white font-semibold",
          "bg-gradient-to-br from-gray-600 to-gray-800",
          className
        )}
        style={{ 
          width: size, 
          height: size * 0.6,
          fontSize: size * 0.3
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div 
      className={cn("rounded-md overflow-hidden", className)}
      style={{ 
        width: size, 
        height: size * 0.6,
        backgroundColor: cardBrand.color
      }}
    >
      <img
        src={cardBrand.logo}
        alt={cardBrand.displayName}
        width={size}
        height={size * 0.6}
        className="w-full h-full object-contain p-1"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}

interface CardSelectorProps {
  value?: any;
  onChange: (brand: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CardSelector({ 
  value, 
  onChange, 
  placeholder = "Selecione a bandeira do cartão",
  disabled,
  className 
}: CardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedBrand = value ? CREDIT_CARD_BRANDS.find(brand => 
    brand.id === value.id || brand.id === value
  ) : null;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input",
          "bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>span]:line-clamp-1"
        )}
      >
        {selectedBrand ? (
          <div className="flex items-center gap-2">
            <CardLogo brand={selectedBrand.id} size={24} />
            <span>{selectedBrand.displayName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <svg
          className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {CREDIT_CARD_BRANDS.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => {
                onChange(brand);
                setIsOpen(false);
              }}
              className={cn(
                "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                "outline-none hover:bg-accent hover:text-accent-foreground",
                selectedBrand?.id === brand.id && "bg-accent text-accent-foreground"
              )}
            >
              <CardLogo brand={brand.id} size={24} />
              <span>{brand.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility function to detect card brand from number
export function detectCardBrand(cardNumber: string): string | null {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  for (const brand of CREDIT_CARD_BRANDS) {
    if (brand.pattern.test(cleanNumber)) {
      return brand.id;
    }
  }
  
  return null;
}