import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthScoreGauge({ score, size = 'md', showLabel = true }: HealthScoreGaugeProps) {
  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm': return { size: 120, stroke: 8, fontSize: 'text-2xl' };
      case 'lg': return { size: 200, stroke: 12, fontSize: 'text-5xl' };
      default: return { size: 160, stroke: 10, fontSize: 'text-4xl' };
    }
  }, [size]);

  const radius = (dimensions.size - dimensions.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success stroke-success';
    if (score >= 60) return 'text-warning stroke-warning';
    if (score >= 40) return 'text-risk-high stroke-risk-high';
    return 'text-destructive stroke-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={dimensions.size}
          height={dimensions.size}
        >
          <circle
            className="stroke-muted"
            strokeWidth={dimensions.stroke}
            fill="transparent"
            r={radius}
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
          />
          <circle
            className={cn("transition-all duration-1000 ease-out", getScoreColor(score))}
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", dimensions.fontSize, getScoreColor(score).split(' ')[0])}>
            {score}%
          </span>
          {showLabel && (
            <span className="text-sm text-muted-foreground">{getScoreLabel(score)}</span>
          )}
        </div>
      </div>
    </div>
  );
}