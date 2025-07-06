import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, RefreshCw, CheckCircle, Info } from "lucide-react";
import { BRAZILIAN_BANKS } from "@/components/financial/bank-selector";
import BankLogo from "@/components/ui/bank-logo";
import { EnhancedBankLogo } from "@/components/ui/enhanced-bank-logo";

interface BankLogoTestResult {
  bank: string;
  domain: string;
  status: "success" | "error" | "fallback";
  loadTime?: number;
}

export function BankLogoStatus() {
  const [testResults, setTestResults] = useState<BankLogoTestResult[]>([]);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<"unknown" | "valid" | "invalid">("unknown");

  const testAPIKey = async () => {
    setIsTestingAPI(true);
    try {
      const response = await fetch("https://img.logo.dev/nubank.com.br?token=pk_V5EruyjTS-6W2P1sTwijsQ&retina=true&size=40");
      setApiKeyStatus(response.ok ? "valid" : "invalid");
    } catch (error) {
      setApiKeyStatus("invalid");
    } finally {
      setIsTestingAPI(false);
    }
  };

  const testBankLogos = async () => {
    const results: BankLogoTestResult[] = [];
    
    for (const bank of BRAZILIAN_BANKS.slice(0, 10)) { // Test first 10 banks
      const startTime = Date.now();
      try {
        const response = await fetch(`https://img.logo.dev/${bank.domain}?token=pk_V5EruyjTS-6W2P1sTwijsQ&retina=true&size=40`);
        const loadTime = Date.now() - startTime;
        
        results.push({
          bank: bank.displayName,
          domain: bank.domain,
          status: response.ok ? "success" : "fallback",
          loadTime
        });
      } catch (error) {
        results.push({
          bank: bank.displayName,
          domain: bank.domain,
          status: "error"
        });
      }
    }
    
    setTestResults(results);
  };

  useEffect(() => {
    testAPIKey();
  }, []);

  const successCount = testResults.filter(r => r.status === "success").length;
  const fallbackCount = testResults.filter(r => r.status === "fallback").length;
  const errorCount = testResults.filter(r => r.status === "error").length;

  return (
    <div className="space-y-6">
      {/* API Key Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Status do Sistema de Logos Bancários</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Key Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">API Key Status</p>
                <p className="text-xs text-muted-foreground">img.logo.dev</p>
              </div>
              <div className="flex items-center space-x-2">
                {apiKeyStatus === "valid" && <CheckCircle className="h-5 w-5 text-green-600" />}
                {apiKeyStatus === "invalid" && <X className="h-5 w-5 text-red-600" />}
                {apiKeyStatus === "unknown" && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                <Badge variant={apiKeyStatus === "valid" ? "default" : "secondary"}>
                  {apiKeyStatus === "valid" ? "Funcionando" : 
                   apiKeyStatus === "invalid" ? "Erro" : "Testando..."}
                </Badge>
              </div>
            </div>

            {/* Banks Supported */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Bancos Suportados</p>
                <p className="text-xs text-muted-foreground">Presets brasileiros</p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge variant="default">{BRAZILIAN_BANKS.length} bancos</Badge>
              </div>
            </div>

            {/* Fallback System */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Sistema de Fallback</p>
                <p className="text-xs text-muted-foreground">Cores e iniciais</p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={testAPIKey}
              disabled={isTestingAPI}
            >
              {isTestingAPI ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Testar API Key
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={testBankLogos}
              disabled={testResults.length > 0}
            >
              Testar Logos dos Bancos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Resultados dos Testes</CardTitle>
            <div className="flex space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Sucesso: {successCount}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span>Fallback: {fallbackCount}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Erro: {errorCount}</span>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <BankLogo domain={result.domain.replace('www.', '')} name={result.bank} size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{result.bank}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.domain}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {result.status === "success" && <Check className="h-4 w-4 text-green-600" />}
                    {result.status === "fallback" && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    {result.status === "error" && <X className="h-4 w-4 text-red-600" />}
                    {result.loadTime && (
                      <span className="text-xs text-muted-foreground">{result.loadTime}ms</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Logos */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Demonstração de Logos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Amostra dos principais bancos brasileiros com logos funcionais
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {BRAZILIAN_BANKS.slice(0, 12).map((bank) => (
              <div key={bank.id} className="text-center space-y-2">
                <div className="flex justify-center">
                  <BankLogo domain={bank.domain} name={bank.name} size={40} />
                </div>
                <div>
                  <p className="font-medium text-xs">{bank.displayName}</p>
                  <Badge variant="outline" className="text-xs">
                    {bank.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}