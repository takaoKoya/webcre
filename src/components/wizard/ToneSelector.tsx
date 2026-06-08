'use client';

import { cn } from '@/lib/utils';
import type { Tone } from '@/types';
import { toneColorMap } from '@/lib/templates';

const TONES: { id: Tone; label: string; description: string }[] = [
  { id: 'modern', label: 'モダン', description: 'スタイリッシュで洗練された印象' },
  { id: 'natural', label: 'ナチュラル', description: '自然・親しみやすい雰囲気' },
  { id: 'pop', label: 'ポップ', description: '明るく活発なエネルギー' },
  { id: 'luxury', label: 'ラグジュアリー', description: '高級感・プレミアム感' },
  { id: 'corporate', label: 'コーポレート', description: '信頼感・プロフェッショナル' },
  { id: 'minimal', label: 'ミニマル', description: 'シンプルで無駄のないデザイン' },
];

interface ToneSelectorProps {
  selectedTone?: Tone;
  onToneChange: (tone: Tone) => void;
}

export function ToneSelector({ selectedTone, onToneChange }: ToneSelectorProps) {
  return (
    <div>
      <h3 className="text-white/60 text-sm font-medium mb-4 uppercase tracking-wider">雰囲気・トーンを選択</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TONES.map((tone) => {
          const colors = toneColorMap[tone.id];
          const isSelected = selectedTone === tone.id;
          return (
            <button
              key={tone.id}
              onClick={() => onToneChange(tone.id)}
              className={cn(
                'relative overflow-hidden p-4 rounded-xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              {/* Color preview */}
              <div className="flex gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{ backgroundColor: colors.primary }}
                />
                <div
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{ backgroundColor: colors.secondary }}
                />
                <div
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{ backgroundColor: colors.accent }}
                />
              </div>
              <div className={cn('font-semibold mb-0.5', isSelected ? 'text-white' : 'text-white/80')}>
                {tone.label}
              </div>
              <div className="text-white/50 text-xs">{tone.description}</div>
              {isSelected && (
                <div
                  className="absolute inset-0 opacity-10 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
