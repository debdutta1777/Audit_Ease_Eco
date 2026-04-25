import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthScoreGauge({ score, size = 'md', showLabel = true }: HealthScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm': return { size: 120, stroke: 8, fontSize: 'text-2xl' };
      case 'lg': return { size: 200, stroke: 12, fontSize: 'text-5xl' };
      default: return { size: 160, stroke: 10, fontSize: 'text-4xl' };
    }
  }, [size]);

  // Animate score from 0 → actual on mount
  useEffect(() => {
    setMounted(true);
    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1500, 1);
      // Cubic ease-out for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    // Small delay so the user sees the animation start from 0
    const timer = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [score]);

  const radius = (dimensions.size - dimensions.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success stroke-success';
    if (s >= 60) return 'text-warning stroke-warning';
    if (s >= 40) return 'text-risk-high stroke-risk-high';
    return 'text-destructive stroke-destructive';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Needs Work';
    return 'Critical';
  };

  // Glow color based on score
  const getGlowColor = (s: number) => {
    if (s >= 80) return 'drop-shadow(0 0 8px hsl(142, 76%, 36%))';
    if (s >= 60) return 'drop-shadow(0 0 8px hsl(38, 92%, 50%))';
    if (s >= 40) return 'drop-shadow(0 0 8px hsl(25, 95%, 53%))';
    return 'drop-shadow(0 0 8px hsl(0, 84%, 60%))';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={dimensions.size}
          height={dimensions.size}
          style={{ filter: mounted ? getGlowColor(animatedScore) : 'none', transition: 'filter 1s ease-out' }}
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
            className={cn("transition-colors duration-500", getScoreColor(animatedScore))}
            strokeWidth={dimensions.stroke}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 0.05s linear',
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-bold tabular-nums transition-colors duration-500",
            dimensions.fontSize,
            getScoreColor(animatedScore).split(' ')[0]
          )}>
            {animatedScore}%
          </span>
          {showLabel && (
            <span className="text-sm text-muted-foreground">{getScoreLabel(animatedScore)}</span>
          )}
        </div>
      </div>
    </div>
  );
}