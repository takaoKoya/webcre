import type { ProjectConfig } from '@/types';

const industryNameMap: Record<string, string> = {
  restaurant: '飲食・レストラン',
  beauty: '美容・サロン',
  medical: '医療・クリニック',
  legal: '法律・士業',
  realestate: '不動産',
  education: '教育・スクール',
  it: 'IT・テクノロジー',
  fitness: 'フィットネス・スポーツ',
  retail: '小売・ショップ',
  construction: '建設・工務店',
  other: 'その他',
};

const toneNameMap: Record<string, string> = {
  modern: 'モダン・スタイリッシュ',
  natural: 'ナチュラル・温かみ',
  pop: 'ポップ・元気',
  luxury: 'ラグジュアリー・高級感',
  corporate: 'コーポレート・ビジネス',
  minimal: 'ミニマル・シンプル',
};

const goalNameMap: Record<string, string> = {
  inquiry: 'お問い合わせ獲得',
  reservation: '予約・申込み獲得',
  branding: 'ブランディング・認知向上',
  recruitment: '採用・人材確保',
  'ec-sales': 'EC・商品販売',
};

export function buildSectionStructurePrompt(config: ProjectConfig): string {
  const industryName = industryNameMap[config.industry] ?? config.industry;
  const toneName = toneNameMap[config.tone] ?? config.tone;
  const goalNames = config.goals.map((g) => goalNameMap[g] ?? g).join('、');

  return `あなたはプロのウェブデザイナーです。以下の条件でランディングページのセクション構成を提案してください。

# 条件
- 業種: ${industryName}
- サイトトーン: ${toneName}
- 事業名: ${config.businessName}
- 事業説明: ${config.businessDescription}
- 主な目標: ${goalNames}
- サイトタイプ: ${config.siteType}

# 出力フォーマット（JSON）
セクションのリストを以下のJSON形式で返してください。コードブロックやマークダウン記法は使わず、JSONのみ返してください。

{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "ヒーローセクション",
      "description": "このセクションの内容の説明"
    }
  ]
}

# 使用可能なセクションタイプ
hero, services, about, gallery, pricing, testimonials, cta, access, faq, news

# ルール
- 5〜8個のセクションを選ぶ
- 必ずheroセクションを最初に、ctaセクションを最後に含める
- 業種と目標に最適なセクションを選択する
- 重複するtypeは使わない`;
}

export function buildTextGenerationPrompt(
  config: ProjectConfig,
  sections: Array<{ id: string; type: string; title: string; description: string }>
): string {
  const industryName = industryNameMap[config.industry] ?? config.industry;
  const toneName = toneNameMap[config.tone] ?? config.tone;
  const goalNames = config.goals.map((g) => goalNameMap[g] ?? g).join('、');

  const sectionList = sections
    .map((s) => `- ${s.id} (${s.type}): ${s.description}`)
    .join('\n');

  return `あなたは日本語のプロコピーライターです。以下の条件でランディングページの各セクションのテキストを生成してください。

# 事業情報
- 事業名: ${config.businessName}
- 業種: ${industryName}
- 説明: ${config.businessDescription}
- トーン: ${toneName}
- 目標: ${goalNames}
- ターゲット: ${config.targetAudience?.ageRange ?? ''}、${config.targetAudience?.gender ?? ''}、${config.targetAudience?.region ?? ''}

# 生成するセクション
${sectionList}

# 出力フォーマット（JSON）
コードブロックやマークダウン記法は使わず、以下のJSON形式のみ返してください。

{
  "texts": {
    "hero": {
      "headline": "メインキャッチコピー（20字以内）",
      "subheadline": "サブキャッチコピー（40字以内）",
      "body": "本文（80字以内）",
      "cta": "CTAボタン文言（10字以内）"
    },
    "services": {
      "headline": "セクション見出し",
      "body": "セクション説明文",
      "items": [
        { "title": "サービス名1", "description": "説明文1" },
        { "title": "サービス名2", "description": "説明文2" },
        { "title": "サービス名3", "description": "説明文3" }
      ]
    }
  }
}

各セクションのtypeに応じて適切なフィールドを生成してください。
- hero: headline, subheadline, body, cta
- services/about: headline, body, items（3つ）
- gallery: headline, body
- pricing: headline, body, items（3つ、各title/price/description）
- testimonials: headline, items（3つ、各name/role/comment）
- cta: headline, body, cta
- access: headline, address, hours, tel
- faq: headline, items（5つ、各question/answer）
- news: headline, items（3つ、各date/title/summary）

トーン「${toneName}」に合わせた言葉遣いで、プロフェッショナルかつ魅力的な文章を書いてください。`;
}
