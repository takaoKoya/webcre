'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'プラン' },
  { label: '業種' },
  { label: 'デザイン' },
  { label: 'ターゲット' },
  { label: '基本情報' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step.label} className="flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  isCompleted
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                    : isCurrent
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white ring-2 ring-purple-400/50 ring-offset-2 ring-offset-[#0d1117] shadow-lg shadow-purple-500/40'
                    : 'bg-white/5 text-white/40 border border-white/10'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isCurrent ? 'text-white' : isCompleted ? 'text-purple-400' : 'text-white/40'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
