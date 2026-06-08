import type { ProjectConfig, GeneratedSite, GeneratedSection, SitePage, PageSlug } from '@/types';
import { buildSectionStructurePrompt, buildTextGenerationPrompt } from './prompts';
import { getIndustryTrend } from './industry-trends';
import { beautyLuxuryTemplate } from '@/lib/templates/beauty-luxury';
import { restaurantNaturalTemplate } from '@/lib/templates/restaurant-natural';
import { fitnessModernTemplate } from '@/lib/templates/fitness-modern';
import { itCorporateTemplate } from '@/lib/templates/it-corporate';
import { legalMinimalTemplate } from '@/lib/templates/legal-minimal';
import { generateServicesPage } from '@/lib/templates/pages/services';
import { generateAboutPage } from '@/lib/templates/pages/about';
import { generateAccessPage } from '@/lib/templates/pages/access';
import { generateContactPage } from '@/lib/templates/pages/contact';
import {
  generateBlogPage,
  generateGalleryPage,
  generatePricingPage,
  generateFaqPage,
  generateRecruitPage,
  generatePrivacyPage,
  generateTokushohoPage,
  generateReservationPage,
} from '@/lib/templates/pages/optional-pages';
import { injectHeadMetaIntoHtml } from '@/lib/templates/pages/shared';

// ─── Mock data for fallback (no valid API key) ───────────────────────────────

const mockTextsMap: Record<string, Record<string, unknown>> = {
  beauty: {
    hero: { headline: '美しさは、ここから始まる', subheadline: '上質な時間を、あなたに。', body: 'お客様一人ひとりの個性と美しさを最大限に引き出す、こだわりのヘアサロンです。', cta: 'ご予約はこちら' },
    services: { headline: '当サロンのメニュー', body: '上質な技術と素材で、あなたの美しさを引き出します。', items: [{ title: 'カット', description: '骨格・髪質を見極めた、あなただけのカット。' }, { title: 'カラー', description: '髪を傷めないダメージレスカラーを採用。' }, { title: 'トリートメント', description: '最高品質の素材で、髪を内側から修復。' }] },
    about: { headline: '私たちについて', body: '創業15年、渋谷で愛され続けるヘアサロン。お客様一人ひとりに寄り添ったカウンセリングで、最高のスタイルをご提案します。' },
    staff: { headline: 'スタイリスト紹介', items: [{ name: 'Yuki', title: 'チーフスタイリスト', description: '15年以上の経験を持ち、多くのお客様に支持されるスタイリスト。' }, { name: 'Hana', title: 'カラースペシャリスト', description: 'カラーリングのプロ。あなたに合う色を的確に提案します。' }, { name: 'Sora', title: 'ヘッドスパ担当', description: '頭皮ケアから全身リラクゼーションまで対応。' }] },
    access: { headline: 'アクセス', address: '東京都渋谷区神南1-2-3 〇〇ビル2F', hours: '10:00〜20:00（火曜定休）', tel: '03-1234-5678' },
    cta: { headline: 'ご予約はいつでも', body: '初回カウンセリングは無料。お気軽にご連絡ください。', cta: '今すぐ予約する' },
    faq: { headline: 'よくある質問', items: [{ question: '初めてでも大丈夫ですか？', answer: 'はい、初回のお客様も大歓迎です。丁寧にカウンセリングします。' }, { question: '予約はできますか？', answer: 'お電話またはWebにてご予約いただけます。' }, { question: '駐車場はありますか？', answer: '近隣にコインパーキングがございます。' }] },
    pricing: { items: [{ title: 'カット', price: '¥4,400〜', description: 'シャンプー・ブロー込み。骨格診断カウンセリング付き。' }, { title: 'カラー', price: '¥8,800〜', description: 'ダメージレスカラー。ホームケアアドバイス付き。' }, { title: 'トリートメント', price: '¥5,500〜', description: '髪質改善トリートメント。ツヤ感が続きます。' }] },
  },
  restaurant: {
    hero: { headline: '大地の恵みを、あなたの食卓に', subheadline: '旬の素材、誠実な料理。', body: '地元農家と直接契約した食材を使い、シェフが毎日丁寧に仕上げる本物の料理をお楽しみください。', cta: 'ご予約はこちら' },
    concept: { headline: '食と農の、つながりを大切に', body: '私たちは生産者の顔が見える食材だけを使います。季節を感じ、素材の声を聞きながら料理を作ることが私たちのこだわりです。' },
    about: { headline: '私たちについて', body: '創業20年、地域に愛されるレストラン。四季折々の食材で、感動の一皿をお届けします。' },
    menu: { headline: 'メニュー', items: [{ title: 'ランチセット', price: '¥1,800〜', description: '旬野菜のサラダ、スープ、メイン、パン付き。日替わりで飽きません。' }, { title: 'ディナーコース', price: '¥6,600〜', description: '前菜・スープ・メイン・デザートの全4品。記念日やご接待に。' }, { title: 'シェフのおまかせ', price: '¥11,000〜', description: 'その日の最高の食材でシェフが腕をふるう特別コース。' }] },
    access: { address: '東京都世田谷区下北沢2-3-4', hours: 'ランチ 11:30〜14:00 / ディナー 17:30〜22:00（月曜定休）', tel: '03-2345-6789' },
    cta: { headline: 'ご予約・お問い合わせ', body: '特別な日のお食事、日常のランチに。スタッフ一同、心よりお待ちしています。', cta: '今すぐ予約する' },
  },
  fitness: {
    hero: { headline: '限界を超えろ', subheadline: 'あなたの新しい自分が待っている。', body: '科学的トレーニングと専門トレーナーの指導で、理想のカラダを最短で手に入れる。', cta: '無料体験を申し込む' },
    programs: { headline: 'プログラム', items: [{ title: 'HIIT', description: '短時間で最大カロリー消費。有酸素と無酸素を組み合わせた高強度インターバル。' }, { title: 'ウェイトトレーニング', description: '筋肉を効率よく鍛える科学的プログラム。初心者から上級者まで対応。' }, { title: 'ヨガ＆ストレッチ', description: '柔軟性を高め、疲労回復を促進。心身のバランスを整えます。' }, { title: 'パーソナルトレーニング', description: 'あなた専用のプログラムで確実な結果へ。専属トレーナーが徹底サポート。' }] },
    pricing: { items: [{ title: 'ライト', price: '¥5,500', description: '月10回まで。グループレッスン参加可。手軽に始めたい方に。' }, { title: 'スタンダード', price: '¥9,900', description: '月無制限。パーソナル月1回付き。最も人気のプラン。' }, { title: 'プレミアム', price: '¥19,800', description: '月無制限＋パーソナル週1回。最速で結果を出したい方へ。' }] },
    cta: { headline: '今すぐ無料体験を申し込もう', body: '入会金0円！まずは体験から。あなたの変化を私たちがサポートします。', cta: '無料体験を予約する' },
  },
  it: {
    hero: { headline: 'テクノロジーで、未来を切り拓く', subheadline: '課題をチャンスに変えるITパートナー。', body: 'システム開発からDXコンサルティングまで、貴社のデジタル変革を一貫支援します。', cta: 'お問い合わせ' },
    services: { headline: 'サービス', body: '幅広いITソリューションで、ビジネスの成長を加速します。', items: [{ title: 'システム開発', description: '要件定義から保守まで一気通貫。アジャイル開発で迅速にデリバリー。' }, { title: 'クラウドインフラ', description: 'AWS・GCPを活用したスケーラブルなインフラ設計・運用を提供。' }, { title: 'DXコンサルティング', description: '業務プロセスの最適化とデジタル化で、競争力を強化します。' }, { title: 'AI・データ活用', description: '機械学習・生成AIを活用した業務自動化・意思決定支援システムを構築。' }] },
    about: { headline: '会社概要', body: '設立以来、200社以上のDXを支援してきた実績と信頼。最先端の技術と豊富な経験で、お客様のビジネス変革をリードします。' },
    access: { headline: 'アクセス', address: '東京都千代田区丸の内1-2-3 〇〇タワー10F', hours: '平日 9:00〜18:00（土日祝休）', tel: '03-3456-7890' },
    cta: { headline: 'プロジェクトのご相談はお気軽に', body: 'まずはヒアリングから。貴社に最適なソリューションをご提案します。', cta: 'お問い合わせはこちら' },
    faq: { headline: 'よくある質問', items: [{ question: '小規模なプロジェクトでも対応できますか？', answer: 'はい、小〜大規模まで柔軟に対応しています。まずはご相談ください。' }, { question: '見積もりは無料ですか？', answer: '初回ヒアリングと見積もりは無料です。お気軽にご連絡ください。' }, { question: 'アジャイル開発とウォーターフォール、どちらに対応していますか？', answer: '両方に対応しています。プロジェクトの規模・性質に合わせてご提案します。' }] },
    pricing: { items: [{ title: 'スモールスタート', price: '¥500,000〜', description: 'MVP・PoC開発向け。スピード重視で小さく始めたい方に。' }, { title: 'スタンダード', price: '¥2,000,000〜', description: '本格的なシステム開発。要件定義〜保守まで一貫対応。' }, { title: 'エンタープライズ', price: 'お問い合わせ', description: '大規模・複雑なプロジェクト。専任チームがフルサポート。' }] },
  },
  legal: {
    hero: { headline: '法的課題を、確実に解決する', subheadline: '信頼と実績の、ワンストップ士業事務所。', body: '複雑な法的手続きも、経験豊富な専門家が丁寧にサポートします。お気軽にご相談ください。', cta: '無料相談を予約する' },
    services: { headline: '業務案内', items: [{ title: '法人設立サポート', description: '会社設立・各種許認可申請をワンストップで対応。スピーディな手続きを実現。' }, { title: '相続・遺言', description: '遺産分割協議書・遺言書作成から相続登記まで、複雑な相続を丁寧に対処。' }, { title: '不動産登記', description: '売買・贈与・抵当権など、不動産関連の各種登記申請を代行します。' }] },
    faq: { headline: 'よくある質問', items: [{ question: '初回相談は無料ですか？', answer: 'はい、初回30分の相談は無料です。まずはお気軽にお問い合わせください。' }, { question: '費用はどのくらいかかりますか？', answer: '業務内容によって異なります。ご相談後に明確なお見積もりをご提示します。' }, { question: '急ぎの案件にも対応できますか？', answer: 'はい、急ぎのご依頼にも誠心誠意対応いたします。まずはご連絡ください。' }, { question: '遠方でも依頼できますか？', answer: 'オンライン相談・郵便対応も可能です。全国対応しております。' }, { question: 'どんな相談でも受け付けますか？', answer: '対応可能な業務については初回相談でご案内します。まずはご連絡ください。' }] },
    cta: { headline: '初回無料相談受付中', body: '法的なお悩みは一人で抱え込まず、専門家にお任せください。', cta: '無料相談を予約する' },
  },
};

// ─── Template selector ───────────────────────────────────────────────────────

function selectTemplate(config: ProjectConfig) {
  const industry = config.industry;
  const tone = config.tone;

  if (industry === 'beauty') return beautyLuxuryTemplate;
  if (industry === 'restaurant') return restaurantNaturalTemplate;
  if (industry === 'fitness') return fitnessModernTemplate;
  if (industry === 'it') return itCorporateTemplate;
  if (industry === 'legal') return legalMinimalTemplate;

  // fallback by tone
  if (tone === 'luxury' || tone === 'natural') return restaurantNaturalTemplate;
  if (tone === 'modern' || tone === 'pop') return fitnessModernTemplate;
  if (tone === 'corporate') return itCorporateTemplate;
  if (tone === 'minimal') return legalMinimalTemplate;

  return itCorporateTemplate;
}

function getMockTexts(config: ProjectConfig): Record<string, unknown> {
  const base = mockTextsMap[config.industry] ?? mockTextsMap['it'];
  const hero = base.hero as Record<string, string>;
  return {
    ...base,
    hero: { ...hero },
  };
}

// ─── Section builder ─────────────────────────────────────────────────────────

function buildSectionsFromTemplate(
  template: { sections: string[] },
  texts: Record<string, unknown>
): GeneratedSection[] {
  const typeMap: Record<string, GeneratedSection['type']> = {
    hero: 'hero',
    services: 'services',
    concept: 'about',
    about: 'about',
    menu: 'services',
    chef: 'about',
    staff: 'about',
    gallery: 'gallery',
    programs: 'services',
    trainers: 'about',
    facilities: 'gallery',
    pricing: 'pricing',
    works: 'gallery',
    company: 'about',
    recruit: 'cta',
    profile: 'about',
    flow: 'about',
    faq: 'faq',
    access: 'access',
    cta: 'cta',
  };

  const titleMap: Record<string, string> = {
    hero: 'ヒーロー',
    services: 'サービス',
    concept: 'コンセプト',
    about: '私たちについて',
    menu: 'メニュー',
    chef: 'シェフ紹介',
    staff: 'スタッフ紹介',
    gallery: 'ギャラリー',
    programs: 'プログラム',
    trainers: 'トレーナー',
    facilities: '施設紹介',
    pricing: '料金プラン',
    works: '導入実績',
    company: '会社概要',
    recruit: '採用情報',
    profile: '事務所概要',
    flow: 'ご依頼の流れ',
    faq: 'よくある質問',
    access: 'アクセス',
    cta: 'お問い合わせ',
  };

  return template.sections.map((sectionId, index) => ({
    id: sectionId,
    type: typeMap[sectionId] ?? 'about',
    title: titleMap[sectionId] ?? sectionId,
    content: JSON.stringify((texts as Record<string, unknown>)[sectionId] ?? {}),
    order: index + 1,
  }));
}

// ─── AI-powered generation ────────────────────────────────────────────────────

async function generateWithAI(config: ProjectConfig): Promise<{
  texts: Record<string, unknown>;
  sections: Array<{ id: string; type: string; title: string; description: string }>;
}> {
  const openai = (await import('@/lib/openai')).default;

  // Step 1: Get section structure
  const structureResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildSectionStructurePrompt(config) }],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  });

  const structureRaw = structureResponse.choices[0]?.message?.content ?? '{"sections":[]}';
  const { sections } = JSON.parse(structureRaw) as {
    sections: Array<{ id: string; type: string; title: string; description: string }>;
  };

  // Step 2: Generate texts
  const textResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildTextGenerationPrompt(config, sections) }],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const textRaw = textResponse.choices[0]?.message?.content ?? '{"texts":{}}';
  const { texts } = JSON.parse(textRaw) as { texts: Record<string, unknown> };

  return { texts, sections };
}

// ─── Multi-page generation ────────────────────────────────────────────────────

const PAGE_CONFIG: Record<PageSlug, { title: string; label: string; href: string }> = {
  index:      { title: 'トップページ', label: 'トップ', href: 'index.html' },
  services:   { title: 'サービス', label: 'サービス', href: 'services.html' },
  about:      { title: '会社概要', label: '会社概要', href: 'about.html' },
  access:     { title: 'アクセス', label: 'アクセス', href: 'access.html' },
  contact:    { title: 'お問い合わせ', label: 'お問い合わせ', href: 'contact.html' },
  blog:       { title: 'ブログ', label: 'ブログ', href: 'blog.html' },
  gallery:    { title: 'ギャラリー', label: 'ギャラリー', href: 'gallery.html' },
  pricing:    { title: '料金', label: '料金', href: 'pricing.html' },
  faq:        { title: 'FAQ', label: 'FAQ', href: 'faq.html' },
  recruit:    { title: '採用情報', label: '採用', href: 'recruit.html' },
  privacy:    { title: 'プライバシーポリシー', label: 'プライバシー', href: 'privacy.html' },
  tokushoho:  { title: '特定商取引法', label: '特商法', href: 'tokushoho.html' },
  reservation:{ title: 'ご予約', label: '予約', href: 'reservation.html' },
};

function generateSubPageHtml(
  slug: PageSlug,
  config: ProjectConfig,
  texts: Record<string, unknown>,
  navigation: { label: string; href: string }[]
): string {
  switch (slug) {
    case 'services':    return generateServicesPage(config, texts, navigation);
    case 'about':       return generateAboutPage(config, texts, navigation);
    case 'access':      return generateAccessPage(config, texts, navigation);
    case 'contact':     return generateContactPage(config, texts, navigation);
    case 'blog':        return generateBlogPage(config, texts, navigation);
    case 'gallery':     return generateGalleryPage(config, texts, navigation);
    case 'pricing':     return generatePricingPage(config, texts, navigation);
    case 'faq':         return generateFaqPage(config, texts, navigation);
    case 'recruit':     return generateRecruitPage(config, texts, navigation);
    case 'privacy':     return generatePrivacyPage(config, texts, navigation);
    case 'tokushoho':   return generateTokushohoPage(config, texts, navigation);
    case 'reservation': return generateReservationPage(config, texts, navigation);
    default:            return '';
  }
}

function generateMultiPageSite(
  config: ProjectConfig,
  texts: Record<string, unknown>,
  template: ReturnType<typeof selectTemplate>,
  sections: GeneratedSection[]
): { pages: SitePage[]; navigation: { label: string; href: string }[] } {
  const selectedPages = config.selectedPages ?? ['index', 'services', 'about', 'access', 'contact'];

  // Build navigation from selected pages
  const navigation = selectedPages
    .filter((slug) => PAGE_CONFIG[slug])
    .map((slug) => ({
      label: PAGE_CONFIG[slug].label,
      href: PAGE_CONFIG[slug].href,
    }));

  const pages: SitePage[] = [];

  for (const slug of selectedPages) {
    if (slug === 'index') {
      const rawHtml = template.generateHtml(config, texts);
      const html = injectHeadMetaIntoHtml(rawHtml, config, 'index');
      pages.push({
        id: 'index',
        slug: 'index',
        title: PAGE_CONFIG.index.title,
        sections,
        html,
        isHome: true,
      });
    } else {
      const rawHtml = generateSubPageHtml(slug, config, texts, navigation);
      // Sub-pages already inject head meta via generateHeadMeta() helper,
      // but LP templates don't — injectHeadMetaIntoHtml is idempotent-safe to call again
      const html = rawHtml;
      pages.push({
        id: slug,
        slug,
        title: PAGE_CONFIG[slug]?.title ?? slug,
        sections: [],
        html,
        isHome: false,
      });
    }
  }

  return { pages, navigation };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateSiteContent(config: ProjectConfig): Promise<
  Omit<GeneratedSite, 'id' | 'createdAt'>
> {
  const template = selectTemplate(config);
  const apiKey = process.env.OPENAI_API_KEY ?? '';
  const isDummy = !apiKey || apiKey === 'dummy-openai-key' || apiKey.startsWith('sk-dummy');

  let texts: Record<string, unknown>;
  let aiSections: Array<{ id: string; type: string; title: string; description: string }> | null = null;

  if (!isDummy) {
    try {
      const result = await generateWithAI(config);
      texts = result.texts;
      aiSections = result.sections;
    } catch (err) {
      console.warn('OpenAI call failed, falling back to mock data:', err);
      texts = getMockTexts(config);
    }
  } else {
    texts = getMockTexts(config);
  }

  // Use AI sections if available, otherwise use template default sections
  const sectionSource = aiSections
    ? { sections: aiSections.map((s) => s.id) }
    : template;

  const sections = buildSectionsFromTemplate(sectionSource, texts);
  const rawHtml = template.generateHtml(config, texts);
  const html = injectHeadMetaIntoHtml(rawHtml, config, 'index');

  // ── Inject trend data into meta keywords ─────────────────────────────────
  const trend = getIndustryTrend(config.industry);
  let enrichedHtml = html;
  if (trend) {
    const keywordsContent = trend.trendKeywords.join(', ');
    const keywordsMeta = `  <meta name="keywords" content="${keywordsContent}" />`;
    enrichedHtml = html.includes('<meta name="keywords"')
      ? html
      : html.replace('</head>', `${keywordsMeta}\n</head>`);

    // Inject FAQ items from searchIntents if no faq section exists
    const hasFaq = sections.some((s) => s.type === 'faq');
    if (!hasFaq && trend.searchIntents.length > 0) {
      const faqSection: GeneratedSection = {
        id: 'faq-trend',
        type: 'faq',
        title: 'よくある質問',
        content: JSON.stringify({
          headline: 'よくある質問',
          items: trend.searchIntents.map((q) => ({
            question: q,
            answer: 'お気軽にお問い合わせください。専門スタッフが丁寧にご説明します。',
          })),
        }),
        order: sections.length + 1,
      };
      sections.push(faqSection);
    }

    // Inject trend CTA into first cta section content if present
    const ctaSection = sections.find((s) => s.type === 'cta');
    if (ctaSection && trend.ctaPatterns.length > 0) {
      try {
        const ctaContent = JSON.parse(ctaSection.content) as Record<string, unknown>;
        if (!ctaContent.cta) {
          ctaContent.cta = trend.ctaPatterns[0];
          ctaSection.content = JSON.stringify(ctaContent);
        }
      } catch { /* keep original */ }
    }
  }

  const isMultiPage = config.siteType === 'website' || config.siteType === 'full-package';

  if (isMultiPage) {
    const { pages, navigation } = generateMultiPageSite(config, texts, template, sections);
    return {
      config,
      sections,
      html: enrichedHtml,
      css: '',
      status: 'preview',
      pages,
      navigation,
    };
  }

  return {
    config,
    sections,
    html: enrichedHtml,
    css: '',
    status: 'preview',
  };
}
