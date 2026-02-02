import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, DollarSign, Scale, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GapCardProps {
  gap: {
    id: string;
    risk_level: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    original_clause: string;
    regulation_reference: string;
    explanation: string;
    liability_usd: number;
    compliant_rewrite?: string;
    is_applied?: boolean;
    applied_at?: string;
  };
  onViewRedline: () => void;
}

export function GapCard({ gap, onViewRedline }: GapCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'critical': return 'risk-badge-critical';
      case 'high': return 'risk-badge-high';
      case 'medium': return 'risk-badge-medium';
      case 'low': return 'risk-badge-low';
      default: return '';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              gap.risk_level === 'critical' || gap.risk_level === 'high' 
                ? "bg-destructive/10" 
                : "bg-warning/10"
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                gap.risk_level === 'critical' || gap.risk_level === 'high'
                  ? "text-destructive"
                  : "text-warning"
              )} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getRiskBadgeClass(gap.risk_level)}>
                  {gap.risk_level.toUpperCase()}
                </Badge>
                <Badge variant="outline">{gap.category}</Badge>
                {gap.is_applied && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Applied
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-foreground line-clamp-2">{gap.explanation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1 text-destructive">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">{formatCurrency(gap.liability_usd)}</span>
              </div>
              <span className="text-xs text-muted-foreground">potential liability</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Regulation Reference
              </h4>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{gap.regulation_reference}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Original Clause</h4>
              <p className="text-sm bg-muted/50 rounded-lg p-3 italic">"{gap.original_clause}"</p>
            </div>

            {gap.compliant_rewrite && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRedline();
                }}
                className="w-full"
              >
                View Auto-Redline Fix
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}