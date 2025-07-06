import { useState } from "react";
import { ModernForm, ModernField, IconGrid, ModernSelect } from "@/components/ui/modern-form";
import { ModernInput } from "@/components/ui/modern-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Switch } from "@/components/ui/switch";
import { Home, Car, Coffee, ShoppingBag, Heart, Briefcase, User, Calendar, FileText } from "lucide-react";

export default function FormDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    category: "",
    icon: "Home",
    color: "#3b82f6",
    date: "",
    description: "",
    isActive: true,
  });

  const icons = [
    { name: "Casa", icon: <Home className="w-5 h-5" />, value: "home" },
    { name: "Carro", icon: <Car className="w-5 h-5" />, value: "car" },
    { name: "Café", icon: <Coffee className="w-5 h-5" />, value: "coffee" },
    { name: "Compras", icon: <ShoppingBag className="w-5 h-5" />, value: "shopping" },
    { name: "Saúde", icon: <Heart className="w-5 h-5" />, value: "health" },
    { name: "Trabalho", icon: <Briefcase className="w-5 h-5" />, value: "work" },
  ];

  const colors = [
    { name: "Azul", icon: <div className="w-6 h-6 rounded-full bg-blue-500" />, value: "#3b82f6" },
    { name: "Verde", icon: <div className="w-6 h-6 rounded-full bg-green-500" />, value: "#10b981" },
    { name: "Amarelo", icon: <div className="w-6 h-6 rounded-full bg-yellow-500" />, value: "#f59e0b" },
    { name: "Vermelho", icon: <div className="w-6 h-6 rounded-full bg-red-500" />, value: "#ef4444" },
    { name: "Roxo", icon: <div className="w-6 h-6 rounded-full bg-purple-500" />, value: "#a855f7" },
    { name: "Rosa", icon: <div className="w-6 h-6 rounded-full bg-pink-500" />, value: "#ec4899" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Formulário enviado com sucesso! Verifique o console para os dados.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo do Sistema de Formulários Modernos
          </h1>
          <p className="text-gray-600">
            Teste todos os componentes do novo design system responsivo
          </p>
        </div>

        <ModernForm
          title="Formulário de Exemplo"
          description="Demonstração completa dos componentes modernos com design responsivo"
          onSubmit={handleSubmit}
          submitText="Enviar Dados"
        >
          {/* Informações pessoais - Grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernField label="Nome completo" required>
              <ModernInput
                icon={<User className="w-4 h-4" />}
                placeholder="Digite seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </ModernField>

            <ModernField label="E-mail" required>
              <ModernInput
                type="email"
                placeholder="exemplo@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </ModernField>
          </div>

          {/* Valor e categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernField label="Valor em reais" required>
              <CurrencyInput
                value={formData.amount}
                onChange={(value) => setFormData({ ...formData, amount: value })}
              />
            </ModernField>

            <ModernField label="Categoria" required>
              <ModernSelect
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                placeholder="Escolha uma categoria"
              >
                <option value="receita">💰 Receita</option>
                <option value="despesa">💸 Despesa</option>
                <option value="investimento">📈 Investimento</option>
              </ModernSelect>
            </ModernField>
          </div>

          {/* Ícones */}
          <ModernField
            label="Escolha um ícone"
            description="Selecione um ícone para representar visualmente"
          >
            <IconGrid
              icons={icons}
              selectedValue={formData.icon}
              onSelect={(value) => setFormData({ ...formData, icon: value })}
              className="grid-cols-3 sm:grid-cols-6"
            />
          </ModernField>

          {/* Cores */}
          <ModernField
            label="Cor de destaque"
            description="Cor que será usada na interface"
          >
            <IconGrid
              icons={colors}
              selectedValue={formData.color}
              onSelect={(value) => setFormData({ ...formData, color: value })}
              className="grid-cols-3 sm:grid-cols-6"
            />
          </ModernField>

          {/* Data */}
          <ModernField label="Data" required>
            <ModernInput
              type="date"
              icon={<Calendar className="w-4 h-4" />}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </ModernField>

          {/* Descrição */}
          <ModernField
            label="Descrição"
            description="Informações adicionais (opcional)"
          >
            <textarea
              className="flex min-h-[80px] w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium transition-all duration-200 placeholder:text-gray-400 placeholder:font-normal resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 border-gray-300"
              placeholder="Digite informações adicionais..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </ModernField>

          {/* Opções avançadas */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Configurações</h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">Item ativo</span>
                <p className="text-xs text-gray-500">Desative para ocultar da lista</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          {/* Resumo dos dados */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              📋 Dados do formulário
            </h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Nome:</strong> {formData.name || "Não informado"}</p>
              <p><strong>Email:</strong> {formData.email || "Não informado"}</p>
              <p><strong>Valor:</strong> {formData.amount || "R$ 0,00"}</p>
              <p><strong>Categoria:</strong> {formData.category || "Não selecionada"}</p>
              <p><strong>Status:</strong> {formData.isActive ? "Ativo" : "Inativo"}</p>
            </div>
          </div>
        </ModernForm>
      </div>
    </div>
  );
}