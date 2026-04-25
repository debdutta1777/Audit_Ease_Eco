import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiabilityCounterProps {
  amount: number;
  previousAmount?: number;
  className?: string;
  planTier?: 'free' | 'professional' | 'enterprise';
}

export function LiabilityCounter({ amount, previousAmount, className, planTier = 'free' }: LiabilityCounterProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const trend = previousAmount !== undefined ? amount - previousAmount : 0;
  const trendPercent = previousAmount && previousAmount > 0
    ? ((trend / previousAmount) * 100).toFixed(1)
    : 0;

  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
          <DollarSign className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Total Liability Exposure</h3>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(amount)}
          </p>
          {previousAmount !== undefined && trend !== 0 && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-sm",
              trend > 0 ? "text-destructive" : "text-success"
            )}>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trend > 0 ? '+' : ''}{trendPercent}% from last audit</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Cost to fix with AuditEase</span>
          <span className="font-semibold text-success">~$49.00</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Potential savings</span>
          <span className="font-medium text-foreground">{formatCurrency(Math.max(0, amount - 49))}</span>
        </div>
      </div>
    </div>
  );
}