import React, { useState, useCallback } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedBankLogoProps {
  domain?: string;
  name: string;
  size?: number;
  className?: string;
  fallbackColor?: string;
  showFallback?: boolean;
}

// Brazilian Bank Colors for fallback
const BANK_COLORS: Record<string, string> = {
  "nubank": "#8A2BE2",
  "itau": "#FF6B00", 
  "bradesco": "#CC092F",
  "santander": "#EC0000",
  "banco do brasil": "#FFD400",
  "caixa": "#0066CC",
  "safra": "#1F4E79",
  "btg pactual": "#1E3A8A",
  "original": "#00A86B",
  "inter": "#FF8C00",
  "c6 bank": "#FFD700",
  "next": "#00D2FF",
  "picpay": "#11C76F",
  "mercado pago": "#00B1EA",
  "pagbank": "#FF6B35",
  "stone": "#00D4AA",
  "99pay": "#FFD700",
  "hsbc": "#DB0011",
  "citibank": "#1976D2"
};

// Fallback initials for banks
const getBankInitials = (name: string): string => {
  const words = name.split(' ').filter(word => word.length > 2);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
};

// Get brand color for bank
const getBankColor = (name: string): string => {
  const nameLower = name.toLowerCase().trim();
  
  for (const [bankName, color] of Object.entries(BANK_COLORS)) {
    if (nameLower.includes(bankName) || bankName.includes(nameLower)) {
      return color;
    }
  }
  
  // Generate consistent color from name
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];
  return colors[Math.abs(hash) % colors.length];
};

export function EnhancedBankLogo({
  domain,
  name,
  size = 24,
  className,
  fallbackColor,
  showFallback = true,
}: EnhancedBankLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  // Get the appropriate domain and logo URL
  const getDomain = (): string | null => {
    if (domain) return domain;
    
    const nameLower = name.toLowerCase().trim();
    
    // Brazilian bank domain mapping
    const bankDomains: Record<string, string> = {
      "nubank": "nubank.com.br",
      "itau": "itau.com.br",
      "bradesco": "bradesco.com.br",
      "santander": "santander.com.br",
      "banco do brasil": "bb.com.br",
      "caixa": "caixa.gov.br",
      "safra": "safra.com.br",
      "btg pactual": "btgpactual.com",
      "original": "original.com.br",
      "inter": "bancointer.com.br",
      "c6 bank": "c6bank.com.br",
      "next": "next.me",
      "picpay": "picpay.com",
      "stone": "stone.com.br",
      "pagbank": "pagbank.com.br",
      "mercado pago": "mercadopago.com.br",
      "99pay": "99app.com",
      "hsbc": "hsbc.com.br",
      "citibank": "citibank.com.br"
    };

    // Direct match
    if (bankDomains[nameLower]) {
      return bankDomains[nameLower];
    }
    
    // Partial match for banks with variations
    for (const [key, value] of Object.entries(bankDomains)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return value;
      }
    }
    
    return null;
  };

  const logoUrl = getDomain();
  const brandColor = fallbackColor || getBankColor(name);
  const initials = getBankInitials(name);

  // If no domain found, show fallback immediately
  if (!logoUrl) {
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center rounded font-medium text-white",
          className
        )}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: brandColor,
          fontSize: size * 0.4
        }}
      >
        {showFallback ? initials : <Building2 className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />}
      </div>
    );
  }

  // If error occurred, show fallback
  if (hasError) {
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center rounded font-medium text-white",
          className
        )}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: brandColor,
          fontSize: size * 0.4
        }}
      >
        {showFallback ? initials : <Building2 className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />}
      </div>
    );
  }

  const logoSrc = `https://img.logo.dev/${logoUrl}?token=pk_V5EruyjTS-6W2P1sTwijsQ&retina=true&size=${size}`;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      {/* Loading placeholder */}
      {isLoading && (
        <div 
          className="absolute inset-0 inline-flex items-center justify-center rounded animate-pulse bg-gray-200"
        >
          <Building2 className="text-gray-400" style={{ width: size * 0.5, height: size * 0.5 }} />
        </div>
      )}

      {/* Actual logo */}
      <img
        src={logoSrc}
        alt={`${name} Logo`}
        className={cn(
          "w-full h-full object-contain rounded transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        style={{ width: size, height: size }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default EnhancedBankLogo;