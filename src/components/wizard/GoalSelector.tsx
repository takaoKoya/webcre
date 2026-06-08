'use client';

import { cn } from '@/lib/utils';
import type { Goal } from '@/types';
import { Check } from 'lucide-react';

const GOALS: { id: Goal; label: string; description: string; icon: string }[] = [
  { id: 'inquiry', label: '問い合わせ獲得', description: '見込み客からの相談・連絡を増やす', icon: '✉️' },
  { id: 'reservation', label: '予約を増やす', description: 'オンラインで予約・申込みを受け付ける', icon: '📅' },
  { id: 'branding', label: 'ブランド強化', description: '信頼感と認知度を高める', icon: '⭐' },
  { id: 'recruitment', label: '採用・求人', description: '優秀なスタッフを採用する', icon: '👥' },
  { id: 'ec-sales', label: '商品販売', description: 'ネット経由で売上を伸ばす', icon: '💰' },
];

interface GoalSelectorProps {
  selected: Goal[];
  onChange: (goals: Goal[]) => void;
}

export function GoalSelector({ selected, onChange }: GoalSelectorProps) {
  const toggle = (goal: Goal) => {
    if (selected.includes(goal)) {
      onChange(selected.filter((g) => g !== goal));
    } else {
      onChange([...selected, goal]);
    }
  };

  return (
    <div>
      <h3 className="text-white/60 text-sm font-medium mb-1 uppercase tracking-wider">目標を選択</h3>
      <p className="text-white/40 text-sm mb-4">複数選択できます</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOALS.map((goal) => {
          const isSelected = selected.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggle(goal.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <span className="text-2xl flex-shrink-0">{goal.icon}</span>
              <div className="flex-1">
                <div className={cn('font-semibold', isSelected ? 'text-white' : 'text-white/80')}>
                  {goal.label}
                </div>
                <div className="text-white/50 text-xs mt-0.5">{goal.description}</div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
