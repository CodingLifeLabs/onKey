'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/20 text-primary',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                )}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={cn(
                  'text-sm hidden sm:inline',
                  isActive && 'font-medium text-foreground',
                  !isActive && 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px w-8',
                  isCompleted ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
