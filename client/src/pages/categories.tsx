import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown, 
  Home, Car, Coffee, ShoppingBag, Heart, Briefcase,
  Gamepad2, Book, Plane, Gift, Zap, Smartphone,
  DollarSign, CreditCard, PiggyBank, Target, Settings,
  Utensils, Train, GraduationCap, Baby, Wrench, Music, Camera
} from "lucide-react";
import CategoryForm from "@/components/financial/category-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Icon mapping for categories
const iconMap = {
  Home, Car, Coffee, ShoppingBag, Heart, Briefcase,
  Gamepad2, Book, Plane, Gift, Zap, Smartphone,
  DollarSign, CreditCard, PiggyBank, Target, Settings,
  TrendingUp, TrendingDown, Tag, Utensils, Train, 
  GraduationCap, Baby, Wrench, Music, Camera
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Tag;
};

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const getCategoryBudget = (categoryId: number) => {
    const budget = budgets?.find((b: any) => b.categoryId === categoryId && b.isActive);
    return budget;
  };

  // Render a category item in list format
  const renderCategoryItem = (category: any) => {
    const budget = getCategoryBudget(category.id);
    const IconComponent = getIconComponent(category.icon || 'Tag');
    
    return (
      <div
        key={category.id}
        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <IconComponent 
              className="w-6 h-6" 
              style={{ color: category.color }} 
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={category.type === 'income' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {category.type === 'income' ? 'Receita' : 'Despesa'}
              </Badge>
              {budget && (
                <Badge variant="outline" className="text-xs">
                  Orçamento: R$ {Number(budget.amount)?.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(category.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categorias</h1>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const incomeCategories = Array.isArray(categories) ? categories.filter((cat: any) => cat.type === 'income') : [];
  const expenseCategories = Array.isArray(categories) ? categories.filter((cat: any) => cat.type === 'expense') : [];
  
  // Separate fixed and variable expenses
  const fixedExpenses = expenseCategories.filter((cat: any) => 
    ['Aluguel', 'Condomínio', 'Internet', 'Telefone', 'Plano de Saúde', 'Academia', 'Seguro Auto'].includes(cat.name)
  );
  const variableExpenses = expenseCategories.filter((cat: any) => 
    !['Aluguel', 'Condomínio', 'Internet', 'Telefone', 'Plano de Saúde', 'Academia', 'Seguro Auto'].includes(cat.name)
  );

  return (
    <div className="space-y-6 mobile-safe">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Categorias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
                <p className="text-lg font-semibold">{incomeCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Despesas</p>
                <p className="text-lg font-semibold">{expenseCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fixas</p>
                <p className="text-lg font-semibold">{fixedExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Variáveis</p>
                <p className="text-lg font-semibold">{variableExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-green-600">Categorias de Receita</h2>
          <Badge variant="secondary">{incomeCategories.length}</Badge>
        </div>
        
        {incomeCategories.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma categoria de receita cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Crie sua primeira categoria de receita</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {incomeCategories.map(renderCategoryItem)}
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Fixed Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-600">Despesas Fixas</h2>
          <Badge variant="secondary">{fixedExpenses.length}</Badge>
        </div>
        
        {fixedExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma despesa fixa cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Cadastre suas contas mensais</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {fixedExpenses.map(renderCategoryItem)}
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Variable Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-purple-600">Despesas Variáveis</h2>
          <Badge variant="secondary">{variableExpenses.length}</Badge>
        </div>
        
        {variableExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma despesa variável cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Cadastre categorias para gastos esporádicos</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {variableExpenses.map(renderCategoryItem)}
          </div>
        )}
      </div>
    </div>
  );
}
