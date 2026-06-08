'use client';

import { cn } from '@/lib/utils';
import type { Industry } from '@/types';
import { industryLabels } from '@/lib/templates';
import { getIndustryTrend } from '@/lib/ai/industry-trends';
import { TrendingUp, Users, Target, Megaphone } from 'lucide-react';

interface IndustrySelectorProps {
  selected?: Industry;
  onChange: (industry: Industry) => void;
}

const INDUSTRIES = Object.entries(industryLabels) as [Industry, { label: string; icon: string }][];

export function IndustrySelector({ selected, onChange }: IndustrySelectorProps) {
  const trend = selected ? getIndustryTrend(selected) : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white/60 text-sm font-medium mb-4 uppercase tracking-wider">業種を選択</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {INDUSTRIES.map(([id, { label, icon }]) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                selected === id
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              )}
            >
              <span className="text-3xl">{icon}</span>
              <span
                className={cn(
                  'text-xs font-medium text-center leading-tight',
                  selected === id ? 'text-white' : 'text-white/60'
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trend card */}
      {trend && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h4 className="text-white text-sm font-semibold">
              この業種のトレンド
              <span className="ml-2 text-purple-400/70 font-normal text-xs">
                {trend.industry}
              </span>
            </h4>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '市場規模', value: trend.stats.marketSize },
              { label: '成長率', value: trend.stats.growth },
              { label: 'ターゲット層', value: trend.stats.targetDemo },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <p className="text-white text-xs font-medium leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search intents */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-white/60 text-xs font-medium">ユーザーの検索意図 TOP5</p>
              </div>
              <ul className="space-y-1">
                {trend.searchIntents.map((intent, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-purple-400/60 flex-shrink-0 font-medium">{i + 1}.</span>
                    {intent}
                  </li>
                ))}
              </ul>
            </div>

            {/* Differentiators */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <p className="text-white/60 text-xs font-medium">差別化ポイント</p>
              </div>
              <ul className="space-y-1">
                {trend.differentiators.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-green-400/60 flex-shrink-0">✓</span>
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA patterns */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-white/60 text-xs font-medium">効果的なCTA文言</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {trend.ctaPatterns.map((cta, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs"
                >
                  {cta}
                </span>
              ))}
            </div>
          </div>

          {/* SEO keywords */}
          <div>
            <p className="text-white/40 text-xs mb-2">SEOキーワード（自動反映）</p>
            <div className="flex flex-wrap gap-1.5">
              {trend.trendKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/50 text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
