import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    suffix?: string;
  };
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  iconBg?: string;
  iconColor?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  trend,
  badge,
  badgeVariant = "default",
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
          </div>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          {trend && (
            <span className={`flex items-center ${trend.isPositive ? 'text-success' : 'text-accent'}`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              )}
              <span className="font-medium">{trend.value}%{trend.suffix && ` ${trend.suffix}`}</span>
            </span>
          )}
          
          {badge && (
            <Badge 
              variant={badgeVariant as any}
              className={`text-xs ${
                badgeVariant === 'success' ? 'bg-success/10 text-success border-success/20' :
                badgeVariant === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
                ''
              }`}
            >
              {badge}
            </Badge>
          )}
          
          {trend && !badge && (
            <span className="text-gray-500">vs mês anterior</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
