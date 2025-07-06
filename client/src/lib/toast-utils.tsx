import * as React from "react";
import { Copy, Check } from "lucide-react";
import { ToastActionElement } from "@/components/ui/toast";

export function createCopyAction(content: string): ToastActionElement {
  const CopyButton = () => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Falha ao copiar:', err);
      }
    };

    return (
      <button
        onClick={handleCopy}
        className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
        {copied ? "Copiado!" : "Copiar"}
      </button>
    );
  };

  return <CopyButton /> as ToastActionElement;
}

export function createErrorToast(title: string, description: string) {
  const errorText = `Erro: ${title}\nDescrição: ${description}`;
  
  return {
    title,
    description,
    variant: "destructive" as const,
    action: createCopyAction(errorText),
  };
}