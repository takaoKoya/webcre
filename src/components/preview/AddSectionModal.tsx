'use client';

import { cn } from '@/lib/utils';
import type { GeneratedSection } from '@/types';
import { Plus, X, Grid3X3, Layers } from 'lucide-react';
import { useState } from 'react';

export interface SectionVariant {
  id: string;
  label: string;
  thumbnail: React.ReactNode;
  content: object;
}

// Minimal SVG thumbnails for section layout previews
function LayoutPreview({ type }: { type: string }) {
  const base = 'w-full aspect-video rounded bg-white/5 border border-white/10 flex items-center justify-center text-lg';
  const icons: Record<string, string> = {
    hero_centered: '🦸',
    hero_split: '🏙️',
    hero_minimal: '✨',
    services_3col: '⬛⬛⬛',
    services_list: '📋',
    services_icon: '🔷',
    about_split: '👥',
    about_timeline: '📅',
    gallery_grid: '🖼️',
    pricing_3col: '💰',
    faq_accordion: '❓',
    cta_centered: '📣',
    testimonials_cards: '💬',
  };
  return (
    <div className={base}>
      <span className="text-2xl">{icons[type] ?? '📄'}</span>
    </div>
  );
}

const SECTION_TEMPLATES: Record<
  GeneratedSection['type'],
  Array<{ variantId: string; label: string; content: object }>
> = {
  hero: [
    { variantId: 'hero_centered', label: '中央揃え', content: { headline: 'あなたの未来を、ここから始めよう', subheadline: '最高の体験をお届けします', body: 'ヒーローセクションの説明文がここに入ります。魅力的なキャッチコピーでユーザーの心を掴みましょう。', cta: 'お問い合わせ', layout: 'centered' } },
    { variantId: 'hero_split', label: '2カラム', content: { headline: 'テクノロジーで、未来を切り拓く', subheadline: '革新的なソリューションを提供', body: '左テキスト・右画像のレイアウト。ビジネス向けに最適なデザインです。', cta: '詳しく見る', layout: 'split' } },
    { variantId: 'hero_minimal', label: 'ミニマル', content: { headline: 'シンプルを極める', subheadline: 'Less is More', body: 'すっきりしたデザインで、メッセージを明確に伝えます。', cta: 'スタートする', layout: 'minimal' } },
  ],
  services: [
    { variantId: 'services_3col', label: '3カラム', content: { headline: 'サービス一覧', body: '私たちが提供するサービスをご紹介します。', items: [{ title: 'サービス1', description: 'サービスの説明' }, { title: 'サービス2', description: 'サービスの説明' }, { title: 'サービス3', description: 'サービスの説明' }], layout: '3col' } },
    { variantId: 'services_list', label: 'リスト形式', content: { headline: 'ご提供内容', body: '', items: [{ title: 'プランA', description: '詳細な説明がここに入ります', icon: '✦' }, { title: 'プランB', description: '詳細な説明がここに入ります', icon: '✦' }], layout: 'list' } },
    { variantId: 'services_icon', label: 'アイコン付き', content: { headline: '私たちにできること', body: '', items: [{ title: '開発', description: '最高品質の開発', icon: '💻' }, { title: 'デザイン', description: 'UIUXデザイン', icon: '🎨' }, { title: 'サポート', description: '24時間対応', icon: '🛡️' }], layout: 'icon' } },
  ],
  about: [
    { variantId: 'about_split', label: '左右分割', content: { headline: '私たちについて', body: '会社・店舗の説明をここに入力してください。創業からの歴史や理念を伝えましょう。', layout: 'split' } },
    { variantId: 'about_timeline', label: 'タイムライン', content: { headline: '沿革', items: [{ year: '2010', event: '会社設立' }, { year: '2015', event: '事業拡大' }, { year: '2020', event: '全国展開' }], layout: 'timeline' } },
  ],
  gallery: [
    { variantId: 'gallery_grid', label: 'グリッド', content: { headline: 'ギャラリー', items: [], layout: 'grid' } },
    { variantId: 'gallery_masonry', label: 'マソンリー', content: { headline: '作品集', items: [], layout: 'masonry' } },
  ],
  pricing: [
    { variantId: 'pricing_3col', label: '3プラン', content: { headline: '料金プラン', items: [{ title: 'ライト', price: '¥5,000', description: '基本機能' }, { title: 'スタンダード', price: '¥10,000', description: '全機能', featured: true }, { title: 'プレミアム', price: '¥20,000', description: 'カスタム対応' }], layout: '3col' } },
    { variantId: 'pricing_simple', label: 'シンプル', content: { headline: '料金', items: [{ title: 'プラン', price: '¥10,000', description: '月額' }], layout: 'simple' } },
  ],
  faq: [
    { variantId: 'faq_accordion', label: 'アコーディオン', content: { headline: 'よくある質問', items: [{ question: '質問1', answer: '回答1' }, { question: '質問2', answer: '回答2' }], layout: 'accordion' } },
    { variantId: 'faq_twoCol', label: '2カラム', content: { headline: 'FAQ', items: [{ question: '質問1', answer: '回答1' }, { question: '質問2', answer: '回答2' }, { question: '質問3', answer: '回答3' }, { question: '質問4', answer: '回答4' }], layout: '2col' } },
  ],
  testimonials: [
    { variantId: 'testimonials_cards', label: 'カード', content: { headline: 'お客様の声', items: [{ name: '田中様', comment: '素晴らしいサービスでした！', rating: 5 }, { name: '鈴木様', comment: 'また利用したいと思います。', rating: 5 }], layout: 'cards' } },
    { variantId: 'testimonials_single', label: '大型引用', content: { headline: '', quote: '最高の体験でした。心からおすすめします。', name: '山田 花子様', title: 'フリーランスデザイナー', layout: 'single' } },
  ],
  cta: [
    { variantId: 'cta_centered', label: '中央揃え', content: { headline: 'お問い合わせ', body: 'お気軽にご連絡ください。', cta: 'お問い合わせはこちら', layout: 'centered' } },
    { variantId: 'cta_dark', label: 'ダークバック', content: { headline: 'まずは無料相談から', body: '専門スタッフが丁寧にご案内します。', cta: '無料相談を予約する', layout: 'dark' } },
  ],
  access: [
    { variantId: 'access_mapLeft', label: 'マップ左', content: { headline: 'アクセス', address: '東京都渋谷区1-2-3', hours: '10:00〜19:00（月曜定休）', tel: '03-0000-0000', layout: 'mapLeft' } },
  ],
  news: [
    { variantId: 'news_list', label: 'リスト', content: { headline: 'ニュース', items: [{ title: 'お知らせ1', date: '2025年1月1日', body: '内容' }], layout: 'list' } },
    { variantId: 'news_cards', label: 'カード', content: { headline: 'ブログ', items: [{ title: '記事1', date: '2025年1月1日', body: '内容' }], layout: 'cards' } },
  ],
};

const SECTION_TYPE_LABELS: Record<GeneratedSection['type'], string> = {
  hero: 'ヒーロー',
  services: 'サービス',
  about: 'About',
  gallery: 'ギャラリー',
  pricing: '料金',
  testimonials: 'お客様の声',
  cta: 'CTA',
  access: 'アクセス',
  faq: 'FAQ',
  news: 'ニュース',
};

interface AddSectionModalProps {
  onAdd: (type: GeneratedSection['type'], content: object) => void;
  onClose: () => void;
}

type SectionTab = 'type' | 'template';

export function AddSectionModal({ onAdd, onClose }: AddSectionModalProps) {
  const [tab, setTab] = useState<SectionTab>('type');
  const [selectedType, setSelectedType] = useState<GeneratedSection['type'] | null>(null);

  const sectionTypes = Object.keys(SECTION_TYPE_LABELS) as GeneratedSection['type'][];

  const handleTypeClick = (type: GeneratedSection['type']) => {
    setSelectedType(type);
    setTab('template');
  };

  const handleVariantSelect = (variant: { content: object }) => {
    if (!selectedType) return;
    onAdd(selectedType, variant.content);
  };

  const variants = selectedType ? (SECTION_TEMPLATES[selectedType] ?? []) : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#13181f] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-semibold">セクションを追加</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-white/5 rounded-xl p-1 mb-4">
          <button
            onClick={() => setTab('type')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
              tab === 'type' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            )}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            セクション種類
          </button>
          <button
            onClick={() => setTab('template')}
            disabled={!selectedType}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
              tab === 'template' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60',
              !selectedType && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            テンプレート選択
          </button>
        </div>

        {/* Type selection */}
        {tab === 'type' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {sectionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border text-left transition-all',
                  selectedType === type
                    ? 'border-purple-500/60 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-purple-500/5'
                )}
              >
                <span className="text-base">
                  {SECTION_TYPE_LABELS[type] === 'ヒーロー' ? '🦸' :
                   SECTION_TYPE_LABELS[type] === 'サービス' ? '🛠️' :
                   SECTION_TYPE_LABELS[type] === 'About' ? '👥' :
                   SECTION_TYPE_LABELS[type] === 'ギャラリー' ? '🖼️' :
                   SECTION_TYPE_LABELS[type] === '料金' ? '💰' :
                   SECTION_TYPE_LABELS[type] === 'お客様の声' ? '💬' :
                   SECTION_TYPE_LABELS[type] === 'CTA' ? '📣' :
                   SECTION_TYPE_LABELS[type] === 'アクセス' ? '📍' :
                   SECTION_TYPE_LABELS[type] === 'FAQ' ? '❓' : '📰'}
                </span>
                <span className="text-white/80 text-xs font-medium">{SECTION_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Template gallery */}
        {tab === 'template' && selectedType && (
          <div>
            <p className="text-white/40 text-xs mb-3">
              {SECTION_TYPE_LABELS[selectedType]} のレイアウトを選んでください
            </p>
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              {variants.map((v) => (
                <button
                  key={v.variantId}
                  onClick={() => handleVariantSelect(v)}
                  className="flex flex-col gap-2 p-2 rounded-xl border border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left"
                >
                  <LayoutPreview type={v.variantId} />
                  <span className="text-white/70 text-xs font-medium px-1">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
