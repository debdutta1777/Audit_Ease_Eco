import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecentAuditCardProps {
  id: string;
  standardName: string;
  subjectName: string;
  healthScore?: number;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  topRisk?: string;
  createdAt: string;
}

export function RecentAuditCard({
  id,
  standardName,
  subjectName,
  healthScore,
  status,
  topRisk,
  createdAt
}: RecentAuditCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return healthScore && healthScore >= 80 ? (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Passed
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Remediation Required
          </Badge>
        );
      case 'analyzing':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Analyzing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link
      to={`/audit/${id}`}
      className="block glass-card rounded-xl p-4 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{subjectName}</p>
            <p className="text-sm text-muted-foreground truncate">vs. {standardName}</p>
          </div>
        </div>
        
        {getStatusBadge()}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {status === 'completed' && healthScore !== undefined && (
            <div className={cn(
              "text-sm font-medium",
              healthScore >= 80 ? "text-success" :
              healthScore >= 60 ? "text-warning" :
              "text-destructive"
            )}>
              {healthScore}% compliant
            </div>
          )}
          {topRisk && (
            <div className="text-sm text-muted-foreground">
              Top risk: <span className="text-foreground">{topRisk}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
      </div>
    </Link>
  );
}