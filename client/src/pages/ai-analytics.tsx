import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  DollarSign,
  PieChart,
  Shield
} from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import { FinancialPredictor } from "@/lib/ai-predictor";

export default function AiAnalytics() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);
  
  const { 
    transactions, 
    categories, 
    accounts, 
    budgets, 
    investments,
    isLoading 
  } = useFinancialData();

  // Generate AI predictions when data is available
  useEffect(() => {
    if (transactions && categories && accounts && budgets) {
      generatePredictions();
    }
  }, [transactions, categories, accounts, budgets]);

  const generatePredictions = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const expenseForecasts = FinancialPredictor.predictExpenses(transactions, categories);
      const anomalies = FinancialPredictor.detectAnomalies(transactions);
      const budgetAlerts = FinancialPredictor.generateBudgetAlerts(budgets, transactions);
      const investmentSuggestions = FinancialPredictor.generateInvestmentSuggestions(accounts, transactions, investments);
      
      setPredictions({
        expenseForecasts,
        anomalies,
        budgetAlerts,
        investmentSuggestions,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Análises IA</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length < 10) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Análises IA</h1>
        </div>
        
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dados Insuficientes para Análise
              </h3>
              <p className="text-gray-500 mb-4">
                A IA precisa de pelo menos 10 transações para gerar previsões e análises precisas.
                Continue registrando suas movimentações financeiras.
              </p>
              <p className="text-sm text-gray-400">
                Transações atuais: {transactions?.length || 0}/10
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análises IA</h1>
          <p className="text-gray-600">
            Insights inteligentes baseados em seus dados financeiros
          </p>
        </div>
        <Button onClick={generatePredictions} disabled={isGenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analisando...' : 'Atualizar Análises'}
        </Button>
      </div>

      {predictions && (
        <div className="mb-4 text-sm text-gray-600">
          Última atualização: {predictions.lastUpdated.toLocaleString('pt-BR')}
        </div>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Brain className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                Inteligência Artificial Analisando...
              </h3>
              <p className="text-gray-600 mb-4">
                Processando padrões de consumo e gerando insights personalizados
              </p>
              <Progress value={75} className="w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {predictions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Forecasts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Previsão de Gastos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.expenseForecasts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Dados insuficientes para previsão
                </p>
              ) : (
                <div className="space-y-4">
                  {predictions.expenseForecasts.slice(0, 5).map((forecast: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{forecast.category}</span>
                        <Badge variant={forecast.trend === 'increasing' ? 'destructive' : 
                                      forecast.trend === 'decreasing' ? 'secondary' : 'outline'}>
                          {forecast.trend === 'increasing' ? 'Crescendo' :
                           forecast.trend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Mês Atual</p>
                          <p className="font-semibold">
                            R$ {forecast.currentMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Previsão Próximo Mês</p>
                          <p className={`font-semibold ${
                            forecast.predictedNextMonth > forecast.currentMonth ? 'text-accent' : 'text-success'
                          }`}>
                            R$ {forecast.predictedNextMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Confiança: {(forecast.confidence * 100).toFixed(0)}%</span>
                        <span>
                          {forecast.predictedNextMonth > forecast.currentMonth ? (
                            <span className="flex items-center text-accent">
                              <ArrowUp className="w-3 h-3 mr-1" />
                              +{((forecast.predictedNextMonth - forecast.currentMonth) / forecast.currentMonth * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="flex items-center text-success">
                              <ArrowDown className="w-3 h-3 mr-1" />
                              {((forecast.predictedNextMonth - forecast.currentMonth) / forecast.currentMonth * 100).toFixed(1)}%
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span>Alertas de Orçamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.budgetAlerts.length === 0 ? (
                <div className="text-center py-4">
                  <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-success font-medium">Todos os orçamentos sob controle!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.budgetAlerts.map((alert: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      alert.percentageUsed > 100 
                        ? 'bg-accent/5 border-accent' 
                        : alert.percentageUsed > 80 
                        ? 'bg-warning/5 border-warning' 
                        : 'bg-primary/5 border-primary'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{alert.categoryName}</h4>
                        <Badge variant={alert.percentageUsed > 100 ? 'destructive' : 
                                      alert.percentageUsed > 80 ? 'outline' : 'secondary'}>
                          {alert.percentageUsed.toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Gasto atual:</span>
                          <span className="font-medium">
                            R$ {alert.currentSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Orçamento:</span>
                          <span>
                            R$ {alert.budgetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <Progress value={Math.min(alert.percentageUsed, 100)} className="h-2" />
                        
                        {alert.predictedOverage > 0 && (
                          <div className="text-xs text-accent">
                            ⚠️ Previsão de estouro: R$ {alert.predictedOverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-600">
                          {alert.daysUntilMonthEnd} dias restantes no mês
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <span>Detecção de Anomalias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.anomalies.length === 0 ? (
                <div className="text-center py-4">
                  <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-success font-medium">Nenhuma anomalia detectada</p>
                  <p className="text-sm text-gray-600">Seus gastos estão dentro do padrão normal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.anomalies.slice(0, 5).map((anomaly: any, index: number) => (
                    <div key={index} className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{anomaly.category}</span>
                        <Badge variant="destructive">
                          Score: {anomaly.anomalyScore.toFixed(1)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Valor:</span>
                          <span className="font-medium">
                            R$ {anomaly.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Data:</span>
                          <span>{new Date(anomaly.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <p className="text-accent text-xs mt-2">
                          {anomaly.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investment Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                <span>Sugestões de Investimento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {predictions.investmentSuggestions.length === 0 ? (
                <div className="text-center py-4">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-primary font-medium">Portfolio bem estruturado!</p>
                  <p className="text-sm text-gray-600">Continue monitorando seus investimentos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.investmentSuggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {suggestion.type === 'emergency_fund' ? 'Reserva de Emergência' :
                           suggestion.type === 'diversification' ? 'Diversificação' :
                           suggestion.type === 'rebalancing' ? 'Rebalanceamento' :
                           'Nova Oportunidade'}
                        </h4>
                        <Badge variant={suggestion.riskLevel === 'low' ? 'secondary' :
                                      suggestion.riskLevel === 'medium' ? 'outline' : 'destructive'}>
                          Risco {suggestion.riskLevel === 'low' ? 'Baixo' :
                                 suggestion.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Valor Sugerido</p>
                          <p className="font-semibold">
                            R$ {suggestion.recommendedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Retorno Esperado</p>
                          <p className="font-semibold text-success">
                            {(suggestion.expectedReturn * 100).toFixed(1)}% a.a.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights Summary */}
      {predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Resumo dos Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Previsões Geradas</h3>
                <p className="text-2xl font-bold text-primary">{predictions.expenseForecasts.length}</p>
                <p className="text-sm text-gray-600">categorias analisadas</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <h3 className="font-semibold mb-2">Alertas Ativos</h3>
                <p className="text-2xl font-bold text-warning">
                  {predictions.budgetAlerts.length + predictions.anomalies.length}
                </p>
                <p className="text-sm text-gray-600">requerem atenção</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Oportunidades</h3>
                <p className="text-2xl font-bold text-success">{predictions.investmentSuggestions.length}</p>
                <p className="text-sm text-gray-600">sugestões disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
