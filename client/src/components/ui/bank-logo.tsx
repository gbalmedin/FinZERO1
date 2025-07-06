import { useState } from "react";
import { Building2 } from "lucide-react";

interface BankLogoProps {
  domain?: string;
  name: string;
  size?: number;
  className?: string;
}

// Brazilian Bank Domain Presets
const BRAZILIAN_BANK_DOMAINS: Record<string, string> = {
  // Major Brazilian Banks
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
  
  // Credit Card Companies
  "visa": "visa.com.br",
  "mastercard": "mastercard.com.br",
  "american express": "americanexpress.com.br",
  "elo": "elo.com.br",
  "hipercard": "hipercard.com.br",
  
  // International
  "hsbc": "hsbc.com.br",
  "citibank": "citibank.com.br",
  "jpmorgan": "jpmorgan.com",
  "goldman sachs": "goldmansachs.com",
  "morgan stanley": "morganstanley.com",
  
  // Fintechs
  "99pay": "99app.com",
  "pagseguro": "pagseguro.com.br",
  "mercado pago": "mercadopago.com.br",
  "paypal": "paypal.com.br",
  "getnet": "getnet.com.br",
  "cielo": "cielo.com.br",
  "rede": "userede.com.br",
};

export default function BankLogo({ domain, name, size = 20, className = "" }: BankLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get domain from preset or use provided domain
  const getDomain = (): string | null => {
    if (domain) return domain;
    
    const nameLower = name.toLowerCase().trim();
    
    // Direct match
    if (BRAZILIAN_BANK_DOMAINS[nameLower]) {
      return BRAZILIAN_BANK_DOMAINS[nameLower];
    }
    
    // Partial match for banks with variations
    for (const [key, value] of Object.entries(BRAZILIAN_BANK_DOMAINS)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return value;
      }
    }
    
    return null;
  };

  const logoUrl = getDomain();
  
  // If no domain found or error occurred, show fallback
  if (!logoUrl || hasError) {
    return (
      <div 
        className={`inline-flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <Building2 className="text-gray-400" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    );
  }

  const logoSrc = `https://img.logo.dev/${logoUrl}?token=pk_V5EruyjTS-6W2P1sTwijsQ&retina=true&size=${size}`;

  return (
    <div className={`inline-flex ${className}`} style={{ width: size, height: size }}>
      <img
        src={logoSrc}
        alt={`${name} Logo`}
        className="w-full h-full object-contain rounded"
        style={{ width: size, height: size }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div 
          className="inline-flex items-center justify-center bg-gray-100 rounded animate-pulse"
          style={{ width: size, height: size }}
        >
          <Building2 className="text-gray-400" style={{ width: size * 0.6, height: size * 0.6 }} />
        </div>
      )}
    </div>
  );
}