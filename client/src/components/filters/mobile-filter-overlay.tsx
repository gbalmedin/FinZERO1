import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X, Calendar, CreditCard, Tag, BarChart3 } from "lucide-react";
import { FilterConfig, FilterValues } from "./advanced-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { getCurrentMonthFilter } from "@/lib/default-filters";

interface MobileFilterOverlayProps {
  config: FilterConfig;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  accounts?: any[];
  categories?: any[];
  className?: string;
}

export default function MobileFilterOverlay({
  config,
  filters,
  onFiltersChange,
  accounts,
  categories,
  className
}: MobileFilterOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);

  // Count active filters (excluding default date range)
  const getActiveFilterCount = () => {
    let count = 0;
    const defaultDateRange = getCurrentMonthFilter();
    
    // Only count date range if it's different from default
    if (filters.dateRange && 
        (filters.dateRange.startDate !== defaultDateRange.startDate || 
         filters.dateRange.endDate !== defaultDateRange.endDate)) {
      count++;
    }
    
    if (filters.accounts?.length) count++;
    if (filters.categories?.length) count++;
    if (filters.types?.length) count++;
    if (filters.status?.length) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetValues: FilterValues = {
      dateRange: getCurrentMonthFilter()
    };
    setLocalFilters(resetValues);
    onFiltersChange(resetValues);
  };

  const clearFilter = (filterType: string) => {
    const newFilters = { ...filters };
    if (filterType === 'dateRange') {
      newFilters.dateRange = getCurrentMonthFilter();
    } else {
      delete newFilters[filterType as keyof FilterValues];
    }
    onFiltersChange(newFilters);
  };

  // Bank accounts and credit cards separation
  const bankAccounts = accounts?.filter(acc => acc.type !== 'credit_card') || [];
  const creditCards = accounts?.filter(acc => acc.type === 'credit_card') || [];

  // Categories by type
  const incomeCategories = categories?.filter(cat => cat.type === 'income') || [];
  const fixedExpenseCategories = categories?.filter(cat => cat.type === 'expense' && cat.name.includes('Fixo')) || [];
  const variableExpenseCategories = categories?.filter(cat => cat.type === 'expense' && !cat.name.includes('Fixo')) || [];

  return (
    <>
      {/* Filter Tags - always visible */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Active filter badges */}
        {filters.accounts?.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            {filters.accounts.length} conta{filters.accounts.length > 1 ? 's' : ''}
            <button onClick={() => clearFilter('accounts')} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        
        {filters.categories?.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {filters.categories.length} categoria{filters.categories.length > 1 ? 's' : ''}
            <button onClick={() => clearFilter('categories')} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {filters.types?.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {filters.types.length} tipo{filters.types.length > 1 ? 's' : ''}
            <button onClick={() => clearFilter('types')} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full relative">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Personalize sua visualização dos dados financeiros
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Date Range */}
            {config.showDateRange && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DateRangePicker
                    value={localFilters.dateRange}
                    onChange={(dateRange) => setLocalFilters({ ...localFilters, dateRange })}
                  />
                </CardContent>
              </Card>
            )}

            {/* Accounts */}
            {config.showAccounts && accounts && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Contas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bank Accounts */}
                  {bankAccounts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-green-700 border-l-2 border-green-500 pl-2">
                        Contas Bancárias
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {bankAccounts.map((account) => (
                          <div key={account.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`account-${account.id}`}
                              checked={localFilters.accounts?.includes(account.id.toString())}
                              onCheckedChange={(checked) => {
                                const newAccounts = checked
                                  ? [...(localFilters.accounts || []), account.id.toString()]
                                  : (localFilters.accounts || []).filter(id => id !== account.id.toString());
                                setLocalFilters({ ...localFilters, accounts: newAccounts });
                              }}
                            />
                            <label htmlFor={`account-${account.id}`} className="text-sm">
                              {account.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credit Cards */}
                  {creditCards.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-purple-700 border-l-2 border-purple-500 pl-2">
                        Cartões de Crédito
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {creditCards.map((account) => (
                          <div key={account.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`card-${account.id}`}
                              checked={localFilters.accounts?.includes(account.id.toString())}
                              onCheckedChange={(checked) => {
                                const newAccounts = checked
                                  ? [...(localFilters.accounts || []), account.id.toString()]
                                  : (localFilters.accounts || []).filter(id => id !== account.id.toString());
                                setLocalFilters({ ...localFilters, accounts: newAccounts });
                              }}
                            />
                            <label htmlFor={`card-${account.id}`} className="text-sm">
                              {account.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            {config.showCategories && categories && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Income Categories */}
                  {incomeCategories.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-green-700 border-l-2 border-green-500 pl-2">
                        Receitas
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {incomeCategories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`income-cat-${category.id}`}
                              checked={localFilters.categories?.includes(category.id.toString())}
                              onCheckedChange={(checked) => {
                                const newCategories = checked
                                  ? [...(localFilters.categories || []), category.id.toString()]
                                  : (localFilters.categories || []).filter(id => id !== category.id.toString());
                                setLocalFilters({ ...localFilters, categories: newCategories });
                              }}
                            />
                            <label htmlFor={`income-cat-${category.id}`} className="text-sm">
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fixed Expense Categories */}
                  {fixedExpenseCategories.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-red-700 border-l-2 border-red-500 pl-2">
                        Gastos Fixos
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {fixedExpenseCategories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`fixed-cat-${category.id}`}
                              checked={localFilters.categories?.includes(category.id.toString())}
                              onCheckedChange={(checked) => {
                                const newCategories = checked
                                  ? [...(localFilters.categories || []), category.id.toString()]
                                  : (localFilters.categories || []).filter(id => id !== category.id.toString());
                                setLocalFilters({ ...localFilters, categories: newCategories });
                              }}
                            />
                            <label htmlFor={`fixed-cat-${category.id}`} className="text-sm">
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variable Expense Categories */}
                  {variableExpenseCategories.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-orange-700 border-l-2 border-orange-500 pl-2">
                        Gastos Variáveis
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {variableExpenseCategories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`variable-cat-${category.id}`}
                              checked={localFilters.categories?.includes(category.id.toString())}
                              onCheckedChange={(checked) => {
                                const newCategories = checked
                                  ? [...(localFilters.categories || []), category.id.toString()]
                                  : (localFilters.categories || []).filter(id => id !== category.id.toString());
                                setLocalFilters({ ...localFilters, categories: newCategories });
                              }}
                            />
                            <label htmlFor={`variable-cat-${category.id}`} className="text-sm">
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transaction Types */}
            {config.showTypes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Tipos de Transação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { value: 'income', label: 'Receitas' },
                      { value: 'expense', label: 'Despesas' }
                    ].map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={localFilters.types?.includes(type.value)}
                          onCheckedChange={(checked) => {
                            const newTypes = checked
                              ? [...(localFilters.types || []), type.value]
                              : (localFilters.types || []).filter(t => t !== type.value);
                            setLocalFilters({ ...localFilters, types: newTypes });
                          }}
                        />
                        <label htmlFor={`type-${type.value}`} className="text-sm">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Filters */}
            {config.showStatus && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { value: 'over_budget', label: 'Acima do Orçamento' },
                      { value: 'near_limit', label: 'Próximo do Limite' },
                      { value: 'on_track', label: 'Dentro do Orçamento' }
                    ].map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={localFilters.status?.includes(status.value)}
                          onCheckedChange={(checked) => {
                            const newStatus = checked
                              ? [...(localFilters.status || []), status.value]
                              : (localFilters.status || []).filter(s => s !== status.value);
                            setLocalFilters({ ...localFilters, status: newStatus });
                          }}
                        />
                        <label htmlFor={`status-${status.value}`} className="text-sm">
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-background pt-4 mt-6 border-t space-y-2">
            <Button onClick={applyFilters} className="w-full">
              Aplicar Filtros
            </Button>
            <Button onClick={resetFilters} variant="outline" className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}