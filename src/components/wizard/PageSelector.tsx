'use client';

import { cn } from '@/lib/utils';
import type { PageSlug } from '@/types';
import { Check } from 'lucide-react';

export interface PageOption {
  slug: PageSlug;
  label: string;
  icon: string;
  required?: boolean;
  recommended?: boolean;
}

export const STANDARD_PAGES: PageOption[] = [
  { slug: 'index', label: 'トップページ', icon: '🏠', required: true },
  { slug: 'services', label: 'サービス/メニュー', icon: '🛠️', recommended: true },
  { slug: 'about', label: '会社概要/About', icon: '👥', recommended: true },
  { slug: 'access', label: 'アクセス/店舗情報', icon: '📍', recommended: true },
  { slug: 'contact', label: 'お問い合わせ', icon: '✉️', required: true },
];

export const OPTIONAL_PAGES: PageOption[] = [
  { slug: 'blog', label: 'ブログ/ニュース', icon: '📝' },
  { slug: 'gallery', label: 'ギャラリー', icon: '🖼️' },
  { slug: 'pricing', label: '料金表', icon: '💰' },
  { slug: 'faq', label: 'FAQ', icon: '❓' },
  { slug: 'recruit', label: '採用情報', icon: '💼' },
  { slug: 'privacy', label: 'プライバシーポリシー', icon: '🔒' },
];

interface PageSelectorProps {
  selectedPages: PageSlug[];
  showOptional?: boolean;
  onPagesChange: (pages: PageSlug[]) => void;
}

function PageCheckbox({
  option,
  selected,
  disabled,
  onToggle,
}: {
  option: PageOption;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 w-full',
        disabled
          ? 'border-purple-500/30 bg-purple-500/5 opacity-70 cursor-not-allowed'
          : selected
          ? 'border-purple-500 bg-purple-500/10 text-white'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/8'
      )}
    >
      <span className="text-xl flex-shrink-0">{option.icon}</span>
      <span className="flex-1 text-sm font-medium">{option.label}</span>
      {option.required && (
        <span className="text-xs text-purple-400 flex-shrink-0">必須</span>
      )}
      {option.recommended && !option.required && (
        <span className="text-xs text-blue-400 flex-shrink-0">推奨</span>
      )}
      {selected && !disabled && (
        <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
      )}
    </button>
  );
}

export function PageSelector({ selectedPages, showOptional, onPagesChange }: PageSelectorProps) {
  const toggle = (slug: PageSlug, required?: boolean) => {
    if (required) return;
    if (selectedPages.includes(slug)) {
      onPagesChange(selectedPages.filter((s) => s !== slug));
    } else {
      onPagesChange([...selectedPages, slug]);
    }
  };

  return (
    <div className="space-y-5 p-5 rounded-xl border border-white/10 bg-white/[0.03]">
      <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">
        生成するページを選択
      </h3>
      <div className="space-y-2">
        <p className="text-white/40 text-xs mb-2">標準ページ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STANDARD_PAGES.map((page) => (
            <PageCheckbox
              key={page.slug}
              option={page}
              selected={selectedPages.includes(page.slug)}
              disabled={page.required}
              onToggle={() => toggle(page.slug, page.required)}
            />
          ))}
        </div>
      </div>
      {showOptional && (
        <div className="space-y-2 border-t border-white/5 pt-4">
          <p className="text-white/40 text-xs mb-2">追加ページ（オプション）</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPTIONAL_PAGES.map((page) => (
              <PageCheckbox
                key={page.slug}
                option={page}
                selected={selectedPages.includes(page.slug)}
                onToggle={() => toggle(page.slug)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
