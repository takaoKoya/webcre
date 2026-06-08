import type { GeneratedSection, Tone, Industry, FontFamily } from '@/types';

export const defaultSections: GeneratedSection[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'ヒーロー',
    content: '',
    order: 1,
  },
  {
    id: 'services',
    type: 'services',
    title: 'サービス',
    content: '',
    order: 2,
  },
  {
    id: 'about',
    type: 'about',
    title: '私たちについて',
    content: '',
    order: 3,
  },
  {
    id: 'cta',
    type: 'cta',
    title: 'お問い合わせ',
    content: '',
    order: 4,
  },
];

export const toneColorMap: Record<Tone, { primary: string; secondary: string; accent: string }> = {
  modern: { primary: '#6366f1', secondary: '#1e1b4b', accent: '#a5b4fc' },
  natural: { primary: '#22c55e', secondary: '#14532d', accent: '#86efac' },
  pop: { primary: '#f43f5e', secondary: '#4c0519', accent: '#fda4af' },
  luxury: { primary: '#d97706', secondary: '#1c1917', accent: '#fcd34d' },
  corporate: { primary: '#0ea5e9', secondary: '#0c4a6e', accent: '#7dd3fc' },
  minimal: { primary: '#64748b', secondary: '#0f172a', accent: '#cbd5e1' },
};

export const industryLabels: Record<Industry, { label: string; icon: string }> = {
  restaurant: { label: '飲食・レストラン', icon: '🍽️' },
  beauty: { label: '美容・サロン', icon: '💄' },
  medical: { label: '医療・クリニック', icon: '🏥' },
  legal: { label: '法律・士業', icon: '⚖️' },
  realestate: { label: '不動産', icon: '🏠' },
  education: { label: '教育・スクール', icon: '📚' },
  it: { label: 'IT・テック', icon: '💻' },
  fitness: { label: 'フィットネス・スポーツ', icon: '💪' },
  retail: { label: '小売・ショップ', icon: '🛍️' },
  construction: { label: '建設・工務店', icon: '🔨' },
  other: { label: 'その他', icon: '✨' },
};

export const toneDefaultFont: Record<Tone, FontFamily> = {
  luxury: 'serif',
  minimal: 'serif',
  natural: 'serif',
  modern: 'gothic',
  corporate: 'gothic',
  pop: 'gothic',
};
