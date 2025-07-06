import { useState } from "react";
import { Check, ChevronDown, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import BankLogo from "@/components/ui/bank-logo";

export interface BrazilianBank {
  id: string;
  name: string;
  displayName: string;
  domain: string;
  color: string;
  category: "tradicional" | "digital" | "fintech" | "internacional";
  accountTypes: string[];
  description: string;
}

export const BRAZILIAN_BANKS: BrazilianBank[] = [
  // Bancos Tradicionais
  {
    id: "bb",
    name: "Banco do Brasil",
    displayName: "Banco do Brasil",
    domain: "bb.com.br",
    color: "#FFD400",
    category: "tradicional",
    accountTypes: ["Conta Corrente", "Poupança", "Conta Salário", "Conta Empresarial"],
    description: "Maior banco público do Brasil"
  },
  {
    id: "caixa",
    name: "Caixa Econômica Federal",
    displayName: "Caixa Econômica Federal",
    domain: "caixa.gov.br",
    color: "#0066CC",
    category: "tradicional",
    accountTypes: ["Conta Corrente", "Poupança", "Conta Salário", "FGTS"],
    description: "Banco público federal"
  },
  {
    id: "itau",
    name: "Itaú Unibanco",
    displayName: "Itaú Unibanco",
    domain: "itau.com.br",
    color: "#FF6B00",
    category: "tradicional",
    accountTypes: ["Conta Corrente", "Poupança", "Conta Salário", "Conta Empresarial", "Investimentos"],
    description: "Maior banco privado do Brasil"
  },
  {
    id: "bradesco",
    name: "Bradesco",
    displayName: "Bradesco",
    domain: "bradesco.com.br",
    color: "#CC092F",
    category: "tradicional",
    accountTypes: ["Conta Corrente", "Poupança", "Conta Salário", "Conta Empresarial", "Investimentos"],
    description: "Um dos maiores bancos privados"
  },
  {
    id: "santander",
    name: "Santander",
    displayName: "Santander Brasil",
    domain: "santander.com.br",
    color: "#EC0000",
    category: "tradicional",
    accountTypes: ["Conta Corrente", "Poupança", "Conta Salário", "Conta Empresarial"],
    description: "Banco espanhol com forte presença no Brasil"
  },
  {
    id: "safra",
    name: "Safra",
    displayName: "Banco Safra",
    domain: "safra.com.br",
    color: "#1F4E79",
    category: "tradicional",
    accountTypes: ["Conta Corrente", "Poupança", "Investimentos", "Private Banking"],
    description: "Banco focado em alta renda e investimentos"
  },

  // Bancos Digitais
  {
    id: "nubank",
    name: "Nubank",
    displayName: "Nubank",
    domain: "nubank.com.br",
    color: "#8A2BE2",
    category: "digital",
    accountTypes: ["Conta Corrente", "Poupança", "Cartão de Crédito", "Investimentos"],
    description: "Maior banco digital da América Latina"
  },
  {
    id: "inter",
    name: "Banco Inter",
    displayName: "Banco Inter",
    domain: "bancointer.com.br",
    color: "#FF8C00",
    category: "digital",
    accountTypes: ["Conta Corrente", "Poupança", "Cartão de Crédito", "Investimentos"],
    description: "Banco digital completo"
  },
  {
    id: "c6",
    name: "C6 Bank",
    displayName: "C6 Bank",
    domain: "c6bank.com.br",
    color: "#FFD700",
    category: "digital",
    accountTypes: ["Conta Corrente", "Cartão de Crédito", "Investimentos"],
    description: "Banco digital do Grupo JP Morgan"
  },
  {
    id: "next",
    name: "Next",
    displayName: "Next (Bradesco)",
    domain: "next.me",
    color: "#00D2FF",
    category: "digital",
    accountTypes: ["Conta Corrente", "Poupança", "Cartão de Crédito"],
    description: "Banco digital do Bradesco"
  },
  {
    id: "original",
    name: "Original",
    displayName: "Banco Original",
    domain: "original.com.br",
    color: "#00A86B",
    category: "digital",
    accountTypes: ["Conta Corrente", "Poupança", "Cartão de Crédito", "Investimentos"],
    description: "Banco digital do Grupo J&F"
  },
  {
    id: "btg",
    name: "BTG Pactual",
    displayName: "BTG Pactual",
    domain: "btgpactual.com",
    color: "#1E3A8A",
    category: "digital",
    accountTypes: ["Conta Corrente", "Investimentos", "Private Banking"],
    description: "Banco de investimentos digital"
  },

  // Fintechs
  {
    id: "picpay",
    name: "PicPay",
    displayName: "PicPay",
    domain: "picpay.com",
    color: "#11C76F",
    category: "fintech",
    accountTypes: ["Conta Digital", "Cartão de Crédito", "Pix"],
    description: "Carteira digital e pagamentos"
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    displayName: "Mercado Pago",
    domain: "mercadopago.com.br",
    color: "#00B1EA",
    category: "fintech",
    accountTypes: ["Conta Digital", "Cartão de Crédito", "Maquininhas"],
    description: "Fintech do Mercado Livre"
  },
  {
    id: "pagbank",
    name: "PagBank",
    displayName: "PagBank (PagSeguro)",
    domain: "pagbank.com.br",
    color: "#FF6B35",
    category: "fintech",
    accountTypes: ["Conta Digital", "Cartão de Crédito", "Maquininhas"],
    description: "Banco digital do PagSeguro"
  },
  {
    id: "stone",
    name: "Stone",
    displayName: "Stone Conta",
    domain: "stone.com.br",
    color: "#00D4AA",
    category: "fintech",
    accountTypes: ["Conta Empresarial", "Maquininhas"],
    description: "Fintech focada em empresas"
  },
  {
    id: "99pay",
    name: "99Pay",
    displayName: "99Pay",
    domain: "99app.com",
    color: "#FFD700",
    category: "fintech",
    accountTypes: ["Conta Digital", "Cartão de Crédito"],
    description: "Fintech do 99"
  },

  // Bancos Internacionais
  {
    id: "hsbc",
    name: "HSBC",
    displayName: "HSBC Brasil",
    domain: "hsbc.com.br",
    color: "#DB0011",
    category: "internacional",
    accountTypes: ["Conta Corrente", "Poupança", "Investimentos"],
    description: "Banco britânico (descontinuado no Brasil)"
  },
  {
    id: "citibank",
    name: "Citibank",
    displayName: "Citibank Brasil",
    domain: "citibank.com.br",
    color: "#1976D2",
    category: "internacional",
    accountTypes: ["Conta Corrente", "Private Banking"],
    description: "Banco americano (descontinuado no Brasil)"
  }
];

interface BankSelectorProps {
  value?: string;
  onChange: (bank: BrazilianBank | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BankSelector({ value, onChange, placeholder = "Selecione um banco", disabled, className }: BankSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedBank = BRAZILIAN_BANKS.find(bank => bank.id === value);

  const filteredBanks = BRAZILIAN_BANKS.filter(bank =>
    bank.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedBanks = filteredBanks.reduce((acc, bank) => {
    const category = bank.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(bank);
    return acc;
  }, {} as Record<string, BrazilianBank[]>);

  const categoryLabels = {
    tradicional: "Bancos Tradicionais",
    digital: "Bancos Digitais",
    fintech: "Fintechs",
    internacional: "Bancos Internacionais"
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedBank ? (
            <div className="flex items-center space-x-2">
              <BankLogo domain={selectedBank.domain} name={selectedBank.name} size={20} />
              <span className="truncate">{selectedBank.displayName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Pesquisar bancos..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>Nenhum banco encontrado.</CommandEmpty>
            {Object.entries(groupedBanks).map(([category, banks]) => (
              <CommandGroup key={category} heading={categoryLabels[category as keyof typeof categoryLabels]}>
                {banks.map((bank) => (
                  <CommandItem
                    key={bank.id}
                    value={bank.id}
                    onSelect={() => {
                      onChange(bank);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <BankLogo domain={bank.domain} name={bank.name} size={24} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{bank.displayName}</span>
                          <Badge variant="outline" className="text-xs">
                            {bank.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {bank.description}
                        </p>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === bank.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default BankSelector;