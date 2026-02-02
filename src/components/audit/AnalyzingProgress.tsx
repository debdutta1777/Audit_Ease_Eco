import { useEffect, useState } from 'react';
import { Shield, FileSearch, Scale, Sparkles, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AnalyzingProgressProps {
  className?: string;
}

const steps = [
  { id: 1, label: 'Parsing documents...', icon: FileSearch },
  { id: 2, label: 'Extracting regulations and rules...', icon: Scale },
  { id: 3, label: 'Cross-referencing clauses...', icon: Shield },
  { id: 4, label: 'Calculating risk exposure...', icon: Sparkles },
  { id: 5, label: 'Generating remediation suggestions...', icon: CheckCircle },
];

export function AnalyzingProgress({ className }: AnalyzingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) return prev + Math.random() * 5;
        return prev;
      });
    }, 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={cn("glass-card rounded-xl p-8", className)}>
      <div className="flex flex-col items-center text-center">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-pulse-slow">
            <div className="h-20 w-20 rounded-full bg-primary/20 blur-xl" />
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
            <Shield className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">
          AI Compliance Analysis in Progress
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Our AI is cross-examining your documents to identify compliance gaps and calculate risk exposure.
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-md mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
        </div>

        {/* Steps */}
        <div className="w-full max-w-md space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  isActive && "bg-primary/10",
                  isComplete && "opacity-60"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  isActive && "bg-primary text-primary-foreground",
                  isComplete && "bg-success text-success-foreground",
                  !isActive && !isComplete && "bg-muted text-muted-foreground"
                )}>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className={cn("h-4 w-4", isActive && "animate-pulse")} />
                  )}
                </div>
                <span className={cn(
                  "text-sm",
                  isActive && "text-foreground font-medium",
                  !isActive && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}