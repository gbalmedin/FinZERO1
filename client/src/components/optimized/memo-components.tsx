import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

// Memoized Transaction Card Component
export const TransactionCard = memo(function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete 
}: { 
  transaction: any;
  onEdit?: (transaction: any) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium">{transaction.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(transaction.amount)}
            </p>
            {transaction.category && (
              <Badge variant="outline" className="text-xs">
                {transaction.category.name}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      {(onEdit || onDelete) && (
        <CardContent className="pt-0">
          <div className="flex gap-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(transaction)}>
                Editar
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="outline" onClick={() => onDelete(transaction.id)}>
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

// Memoized Account Card Component
export const AccountCard = memo(function AccountCard({ 
  account, 
  onSelect 
}: { 
  account: any;
  onSelect?: (account: any) => void;
}) {
  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => onSelect?.(account)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{account.bank}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(account.balance)}</p>
            <Badge variant={account.type === 'credit' ? 'secondary' : 'outline'}>
              {account.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

// Memoized Category Badge Component
export const CategoryBadge = memo(function CategoryBadge({ 
  category, 
  size = "default" 
}: { 
  category: any;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <Badge 
      variant="outline" 
      className={`${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"}`}
      style={{ borderColor: category.color, color: category.color }}
    >
      {category.icon && <span className="mr-1">{category.icon}</span>}
      {category.name}
    </Badge>
  );
});

// Memoized KPI Card Component
export const KpiCard = memo(function KpiCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon 
}: { 
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className={`text-xs ${trendColor}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

// Memoized Loading Row Component
export const LoadingRow = memo(function LoadingRow({ 
  columns = 4 
}: { 
  columns?: number;
}) {
  return (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded flex-1"></div>
      ))}
    </div>
  );
});

// Memoized Empty State Component
export const EmptyState = memo(function EmptyState({ 
  title, 
  description, 
  icon: Icon,
  action 
}: { 
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
      )}
      {action}
    </div>
  );
});