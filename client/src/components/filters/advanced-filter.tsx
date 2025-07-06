import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X, Calendar, DollarSign, Tag, CreditCard } from "lucide-react";
import { addDays, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import BankLogo from "@/components/ui/bank-logo";

export interface FilterConfig {
  showDateRange?: boolean;
  showAmountRange?: boolean;
  showCategories?: boolean;
  showAccounts?: boolean;
  showTypes?: boolean;
  showStatus?: boolean;
}

export interface FilterValues {
  dateRange?: { from: Date; to: Date } | null;
  amountRange?: { min: number | null; max: number | null };
  categories?: string[];
  accounts?: string[];
  types?: string[];
  status?: string[];
  searchTerm?: string;
}

interface AdvancedFilterProps {
  config: FilterConfig;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  categories?: Array<{ id: number; name: string; color: string }>;
  accounts?: Array<{ id: number; name: string; type: string }>;
  className?: string;
}

const transactionTypes = [
  { value: "income", label: "Receita" },
  { value: "expense", label: "Despesa" },
  { value: "transfer", label: "Transferência" },
];

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
  { value: "over_budget", label: "Acima do Orçamento" },
  { value: "near_limit", label: "Próximo do Limite" },
  { value: "on_track", label: "Dentro do Orçamento" },
];

export function AdvancedFilter({ 
  config, 
  filters, 
  onFiltersChange, 
  categories = [], 
  accounts = [],
  className = ""
}: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.amountRange?.min !== null || filters.amountRange?.max !== null) count++;
    if (filters.categories?.length) count++;
    if (filters.accounts?.length) count++;
    if (filters.types?.length) count++;
    if (filters.status?.length) count++;
    if (filters.searchTerm?.trim()) count++;
    return count;
  }, [filters]);

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete (newFilters as any)[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 max-h-[85vh] overflow-y-auto" align="start">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filtros Avançados</h3>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Limpar todos
                    </Button>
                  )}
                </div>

                {/* Search Term */}
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <Input
                    placeholder="Digite para buscar..."
                    value={filters.searchTerm || ""}
                    onChange={(e) => updateFilter("searchTerm", e.target.value)}
                  />
                </div>

                {/* Amount Range */}
                {config.showAmountRange && (
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        value={filters.amountRange?.min || ""}
                        onChange={(e) => updateFilter("amountRange", {
                          ...filters.amountRange,
                          min: e.target.value ? parseFloat(e.target.value) : null
                        })}
                      />
                      <Input
                        type="number"
                        placeholder="Máximo"
                        value={filters.amountRange?.max || ""}
                        onChange={(e) => updateFilter("amountRange", {
                          ...filters.amountRange,
                          max: e.target.value ? parseFloat(e.target.value) : null
                        })}
                      />
                    </div>
                  </div>
                )}

                {/* Categories */}
                {config.showCategories && categories.length > 0 && (
                  <div className="space-y-4">
                    <Label>Categorias</Label>
                    
                    {/* Income Categories */}
                    {(() => {
                      const incomeCategories = categories.filter(cat => 
                        ['salário', '13º salário', 'freelance', 'investimentos', 'dividendos', 'outros'].some(keyword => 
                          cat.name.toLowerCase().includes(keyword)
                        )
                      );
                      return incomeCategories.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Receitas</div>
                          <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pl-2 border-l-2 border-green-200">
                            {incomeCategories.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={filters.categories?.includes(category.id.toString()) || false}
                                  onCheckedChange={(checked) => {
                                    const current = filters.categories || [];
                                    const categoryId = category.id.toString();
                                    const newCategories = checked
                                      ? [...current, categoryId]
                                      : current.filter(id => id !== categoryId);
                                    updateFilter("categories", newCategories);
                                  }}
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="flex items-center space-x-2 text-sm cursor-pointer"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span>{category.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Fixed Expenses */}
                    {(() => {
                      const fixedExpenses = categories.filter(cat => 
                        ['aluguel', 'financiamento', 'empréstimo', 'plano de saúde', 'seguro', 'internet', 'telefone', 'condomínio'].some(keyword => 
                          cat.name.toLowerCase().includes(keyword)
                        )
                      );
                      return fixedExpenses.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Gastos Fixos</div>
                          <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pl-2 border-l-2 border-red-200">
                            {fixedExpenses.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={filters.categories?.includes(category.id.toString()) || false}
                                  onCheckedChange={(checked) => {
                                    const current = filters.categories || [];
                                    const categoryId = category.id.toString();
                                    const newCategories = checked
                                      ? [...current, categoryId]
                                      : current.filter(id => id !== categoryId);
                                    updateFilter("categories", newCategories);
                                  }}
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="flex items-center space-x-2 text-sm cursor-pointer"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span>{category.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Variable Expenses */}
                    {(() => {
                      const variableExpenses = categories.filter(cat => 
                        !['salário', '13º salário', 'freelance', 'investimentos', 'dividendos', 'outros', 'aluguel', 'financiamento', 'empréstimo', 'plano de saúde', 'seguro', 'internet', 'telefone', 'condomínio'].some(keyword => 
                          cat.name.toLowerCase().includes(keyword)
                        )
                      );
                      return variableExpenses.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-orange-700 uppercase tracking-wide">Gastos Variáveis</div>
                          <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pl-2 border-l-2 border-orange-200">
                            {variableExpenses.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={filters.categories?.includes(category.id.toString()) || false}
                                  onCheckedChange={(checked) => {
                                    const current = filters.categories || [];
                                    const categoryId = category.id.toString();
                                    const newCategories = checked
                                      ? [...current, categoryId]
                                      : current.filter(id => id !== categoryId);
                                    updateFilter("categories", newCategories);
                                  }}
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="flex items-center space-x-2 text-sm cursor-pointer"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span>{category.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Accounts */}
                {config.showAccounts && accounts.length > 0 && (
                  <div className="space-y-4">
                    <Label>Contas e Cartões</Label>
                    
                    {/* Bank Accounts */}
                    {(() => {
                      const bankAccounts = accounts.filter(acc => acc.type !== 'credit_card');
                      return bankAccounts.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Contas Bancárias</div>
                          <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pl-2 border-l-2 border-blue-200">
                            {bankAccounts.map((account) => (
                              <div key={account.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`account-${account.id}`}
                                  checked={filters.accounts?.includes(account.id.toString()) || false}
                                  onCheckedChange={(checked) => {
                                    const current = filters.accounts || [];
                                    const accountId = account.id.toString();
                                    const newAccounts = checked
                                      ? [...current, accountId]
                                      : current.filter(id => id !== accountId);
                                    updateFilter("accounts", newAccounts);
                                  }}
                                />
                                <label
                                  htmlFor={`account-${account.id}`}
                                  className="text-sm cursor-pointer flex items-center space-x-2"
                                >
                                  <BankLogo domain={account.domain} name={account.name} size={16} />
                                  <span>{account.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Credit Cards */}
                    {(() => {
                      const creditCards = accounts.filter(acc => acc.type === 'credit_card');
                      return creditCards.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-purple-700 uppercase tracking-wide">Cartões de Crédito</div>
                          <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pl-2 border-l-2 border-purple-200">
                            {creditCards.map((account) => (
                              <div key={account.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`account-${account.id}`}
                                  checked={filters.accounts?.includes(account.id.toString()) || false}
                                  onCheckedChange={(checked) => {
                                    const current = filters.accounts || [];
                                    const accountId = account.id.toString();
                                    const newAccounts = checked
                                      ? [...current, accountId]
                                      : current.filter(id => id !== accountId);
                                    updateFilter("accounts", newAccounts);
                                  }}
                                />
                                <label
                                  htmlFor={`account-${account.id}`}
                                  className="text-sm cursor-pointer flex items-center space-x-2"
                                >
                                  <BankLogo domain={account.domain} name={account.name} size={16} />
                                  <span>{account.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Types */}
                {config.showTypes && (
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <div className="space-y-2">
                      {transactionTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type.value}`}
                            checked={filters.types?.includes(type.value) || false}
                            onCheckedChange={(checked) => {
                              const current = filters.types || [];
                              const newTypes = checked
                                ? [...current, type.value]
                                : current.filter(t => t !== type.value);
                              updateFilter("types", newTypes);
                            }}
                          />
                          <label htmlFor={`type-${type.value}`} className="text-sm cursor-pointer">
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                {config.showStatus && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status.value}`}
                            checked={filters.status?.includes(status.value) || false}
                            onCheckedChange={(checked) => {
                              const current = filters.status || [];
                              const newStatus = checked
                                ? [...current, status.value]
                                : current.filter(s => s !== status.value);
                              updateFilter("status", newStatus);
                            }}
                          />
                          <label htmlFor={`status-${status.value}`} className="text-sm cursor-pointer">
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2">
            {config.showTypes && (
              <>
                <Button
                  variant={filters.types?.includes("income") ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const current = filters.types || [];
                    const newTypes = current.includes("income")
                      ? current.filter(t => t !== "income")
                      : [...current, "income"];
                    updateFilter("types", newTypes);
                  }}
                  className="flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" />
                  Receitas
                </Button>
                <Button
                  variant={filters.types?.includes("expense") ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const current = filters.types || [];
                    const newTypes = current.includes("expense")
                      ? current.filter(t => t !== "expense")
                      : [...current, "expense"];
                    updateFilter("types", newTypes);
                  }}
                  className="flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" />
                  Despesas
                </Button>
              </>
            )}
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Busca: {filters.searchTerm}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter("searchTerm")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {(filters.amountRange?.min !== null || filters.amountRange?.max !== null) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Valor: R$ {filters.amountRange?.min || 0} - R$ {filters.amountRange?.max || '∞'}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter("amountRange")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}

          {filters.categories?.map((categoryId) => {
            const category = categories.find(c => c.id.toString() === categoryId);
            return category ? (
              <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    const newCategories = filters.categories?.filter(id => id !== categoryId) || [];
                    updateFilter("categories", newCategories);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ) : null;
          })}

          {filters.accounts?.map((accountId) => {
            const account = accounts.find(a => a.id.toString() === accountId);
            return account ? (
              <Badge key={accountId} variant="secondary" className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {account.name}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    const newAccounts = filters.accounts?.filter(id => id !== accountId) || [];
                    updateFilter("accounts", newAccounts);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ) : null;
          })}

          {filters.types?.map((type) => {
            const typeLabel = transactionTypes.find(t => t.value === type)?.label || type;
            return (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {typeLabel}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    const newTypes = filters.types?.filter(t => t !== type) || [];
                    updateFilter("types", newTypes);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}

          {filters.status?.map((status) => {
            const statusLabel = statusOptions.find(s => s.value === status)?.label || status;
            return (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {statusLabel}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    const newStatus = filters.status?.filter(s => s !== status) || [];
                    updateFilter("status", newStatus);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}