export type PlanId = 'free' | 'standard' | 'pro' | 'agency';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;           // 円/月
  projects: number;        // -1 = unlimited
  pages: number;           // -1 = unlimited
  aiCalls: number;         // -1 = unlimited
  features: string[];
}

export const plans: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'フリー',
    price: 0,
    projects: 1,
    pages: 1,
    aiCalls: 3,
    features: ['LP 1件', 'AI生成 3回/月', 'ZIPダウンロード'],
  },
  standard: {
    id: 'standard',
    name: 'スタンダード',
    price: 4980,
    projects: 3,
    pages: 5,
    aiCalls: -1,
    features: ['サイト 3件', 'マルチページ（5P）', 'AI生成 無制限', 'ブログ・ギャラリー機能', 'フォーム機能'],
  },
  pro: {
    id: 'pro',
    name: 'プロ',
    price: 14980,
    projects: 10,
    pages: -1,
    aiCalls: -1,
    features: ['サイト 10件', 'ページ数 無制限', 'AI生成 無制限', '全オプション機能', 'カスタムドメイン', '優先サポート'],
  },
  agency: {
    id: 'agency',
    name: 'エージェンシー',
    price: 49800,
    projects: -1,
    pages: -1,
    aiCalls: -1,
    features: ['サイト 無制限', 'ページ数 無制限', 'AI生成 無制限', '全オプション機能', 'カスタムドメイン', 'ホワイトラベル', '専任サポート'],
  },
};

export function getPlan(planId: string): Plan {
  return plans[planId as PlanId] ?? plans.free;
}

export function checkLimit(
  plan: Plan,
  type: 'projects' | 'pages' | 'aiCalls',
  current: number
): { allowed: boolean; limit: number } {
  const limit = plan[type];
  if (limit === -1) return { allowed: true, limit: -1 };
  return { allowed: current < limit, limit };
}
