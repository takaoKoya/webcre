'use client';

import { cn } from '@/lib/utils';
import type { SiteType, OptionalFeature, PageSlug } from '@/types';
import { Check } from 'lucide-react';
import { PageSelector, STANDARD_PAGES, OPTIONAL_PAGES } from './PageSelector';

const PLANS: { type: SiteType; label: string; description: string; price: string; features: string[] }[] = [
  {
    type: 'lp',
    label: 'ランディングページ',
    description: '1ページで商品・サービスをPR',
    price: '¥9,800〜',
    features: ['ヒーロー', 'サービス紹介', 'CTA', 'お問い合わせ'],
  },
  {
    type: 'website',
    label: 'ウェブサイト',
    description: '複数ページの本格的なサイト',
    price: '¥19,800〜',
    features: ['トップページ', '会社概要', 'サービス', 'お問い合わせ', 'ブログ'],
  },
  {
    type: 'full-package',
    label: 'フルパッケージ',
    description: 'ECから予約まで全機能搭載',
    price: '¥39,800〜',
    features: ['全ページ', '予約システム', 'EC機能', 'SNS連携', '分析ダッシュボード'],
  },
];

const OPTIONAL_FEATURES: { id: OptionalFeature; label: string; icon: string }[] = [
  { id: 'reservation', label: 'オンライン予約', icon: '📅' },
  { id: 'contact-form', label: 'お問い合わせフォーム', icon: '✉️' },
  { id: 'blog', label: 'ブログ・お知らせ', icon: '📝' },
  { id: 'gallery', label: 'ギャラリー', icon: '🖼️' },
  { id: 'ec', label: 'ネットショップ', icon: '🛒' },
  { id: 'sns', label: 'SNS連携', icon: '📱' },
];

interface PlanSelectorProps {
  selectedPlan?: SiteType;
  selectedFeatures: OptionalFeature[];
  selectedPages?: PageSlug[];
  onPlanChange: (plan: SiteType) => void;
  onFeaturesChange: (features: OptionalFeature[]) => void;
  onPagesChange?: (pages: PageSlug[]) => void;
}

// Default page selections for each plan type
export function getDefaultPages(plan: SiteType): PageSlug[] {
  if (plan === 'lp') return ['index'];
  if (plan === 'website') return ['index', 'services', 'about', 'access', 'contact'];
  // full-package
  return ['index', 'services', 'about', 'access', 'contact', 'blog', 'gallery', 'pricing', 'faq'];
}

export function PlanSelector({
  selectedPlan,
  selectedFeatures,
  selectedPages = [],
  onPlanChange,
  onFeaturesChange,
  onPagesChange,
}: PlanSelectorProps) {
  const toggleFeature = (feature: OptionalFeature) => {
    if (selectedFeatures.includes(feature)) {
      onFeaturesChange(selectedFeatures.filter((f) => f !== feature));
    } else {
      onFeaturesChange([...selectedFeatures, feature]);
    }
  };

  const handlePlanChange = (plan: SiteType) => {
    onPlanChange(plan);
    if (onPagesChange) {
      onPagesChange(getDefaultPages(plan));
    }
  };

  const isMultiPage = selectedPlan === 'website' || selectedPlan === 'full-package';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-white/60 text-sm font-medium mb-4 uppercase tracking-wider">プランを選択</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <button
              key={plan.type}
              onClick={() => handlePlanChange(plan.type)}
              className={cn(
                'relative p-5 rounded-xl border text-left transition-all duration-200',
                selectedPlan === plan.type
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              )}
            >
              {selectedPlan === plan.type && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="text-2xl font-bold text-purple-400 mb-1">{plan.price}</div>
              <div className="text-white font-semibold mb-1">{plan.label}</div>
              <div className="text-white/50 text-sm mb-3">{plan.description}</div>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-white/60 text-xs flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* Page selection for multi-page plans */}
      {isMultiPage && onPagesChange && (
        <PageSelector
          selectedPages={selectedPages}
          showOptional={selectedPlan === 'full-package'}
          onPagesChange={onPagesChange}
        />
      )}

      <div>
        <h3 className="text-white/60 text-sm font-medium mb-4 uppercase tracking-wider">追加オプション（任意）</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {OPTIONAL_FEATURES.map((feature) => {
            const isSelected = selectedFeatures.includes(feature.id);
            return (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                )}
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.label}</span>
                {isSelected && <Check className="w-4 h-4 text-purple-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
