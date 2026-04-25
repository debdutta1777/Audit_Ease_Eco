import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiabilityCounterProps {
  amount: number;
  previousAmount?: number;
  className?: string;
  planTier?: 'free' | 'professional' | 'enterprise';
}

export function LiabilityCounter({ amount, previousAmount, className, planTier = 'free' }: LiabilityCounterProps) {
  const [animatedAmount, setAnimatedAmount] = useState(0);
  const [showTrend, setShowTrend] = useState(false);

  // Slot-machine style count-up animation
  useEffect(() => {
    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 2000, 1);
      // Ease-out expo for dramatic deceleration
      const eased = 1 - Math.pow(2, -10 * progress);
      setAnimatedAmount(eased * amount);
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setShowTrend(true);
      }
    };

    const timer = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, 500);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [amount]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Full dollar format for the animated counter
  const formatAnimatedCurrency = (value: number) => {
    if (amount >= 1000000) {
      return `$${(value / 1000000).toFixed(value >= amount * 0.98 ? 1 : 2)}M`;
    }
    if (amount >= 1000) {
      return `$${Math.round(value).toLocaleString()}`;
    }
    return `$${Math.round(value)}`;
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
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {formatAnimatedCurrency(animatedAmount)}
          </p>
          {previousAmount !== undefined && trend !== 0 && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-sm transition-all duration-500",
              showTrend ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
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
        <div className={cn(
          "flex items-center justify-between text-sm transition-all duration-500",
          showTrend ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-muted-foreground">Cost to fix with AuditEase</span>
          <span className="font-semibold text-success">~$49.00</span>
        </div>
        <div className={cn(
          "mt-2 flex items-center justify-between text-xs transition-all duration-700",
          showTrend ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-muted-foreground">Potential savings</span>
          <span className="font-medium text-foreground">{formatCurrency(Math.max(0, amount - 49))}</span>
        </div>
      </div>
    </div>
  );
}