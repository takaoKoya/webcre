import { NextRequest, NextResponse } from 'next/server';
import type { ToneAnalysis } from '../analyze-site/route';

export interface LPInput {
  tone: ToneAnalysis;
  businessName: string;
  lpPurpose: string;
  targetAudience: string;
  sellingPoints: string[];
  catchphraseHint: string;
  cvGoal: 'inquiry' | 'purchase' | 'signup' | 'download' | 'line' | 'tel' | 'reservation';
  cvButtonText: string;
  cvUrl?: string;
  contactEmail?: string;
  industry?: string;      // for image selection
}

const CV_LABELS: Record<LPInput['cvGoal'], string> = {
  inquiry: 'お問い合わせ',
  purchase: '購入・申込み',
  signup: '無料登録',
  download: '資料請求',
  line: 'LINE登録',
  tel: '電話する',
  reservation: '予約する',
};

// ─── LP purpose context detection ────────────────────────────────────────────

function getLPContext(input: LPInput) {
  const purpose = input.lpPurpose.toLowerCase();
  const cv = input.cvGoal;

  const isRecruit = /採用|求人|スタッフ|リクルート|働|雇用|求め|staff|recruit|hr|career/i.test(purpose);
  const isPurchase = cv === 'purchase' || /購入|申込|商品|販売|buy|purchase/i.test(purpose);
  const isSignup = cv === 'signup' || /登録|会員|sign|register/i.test(purpose);
  const isReservation = cv === 'reservation' || /予約|reserve|booking/i.test(purpose);
  const isDownload = cv === 'download' || /資料|ダウンロード|download/i.test(purpose);
  const isLine = cv === 'line' || /line|ライン/i.test(purpose);

  return { isRecruit, isPurchase, isSignup, isReservation, isDownload, isLine };
}

// ─── Per-selling-point unique description generator ──────────────────────────

function generateFeatureDesc(
  point: string,
  context: ReturnType<typeof getLPContext>,
  businessName: string,
): string {
  if (context.isRecruit) {
    if (/在宅|テレワーク|リモート/i.test(point))
      return `研修修了後は在宅勤務が可能。通勤ストレスゼロで、自分のペースで最大のパフォーマンスを発揮できます。`;
    if (/週\d|シフト|勤務日数/i.test(point))
      return `${point}の柔軟なシフト制。ライフスタイルに合わせて無理なく働けます。育児・介護中の方も安心です。`;
    if (/研修|育成|スキル/i.test(point))
      return `入社後3ヶ月の充実した研修プログラムで、未経験でも着実にスキルを習得。先輩スタッフが丁寧にサポートします。`;
    if (/報酬|給与|賞与|インセンティブ/i.test(point))
      return `業界平均を上回る報酬体系。成果に応じたインセンティブで、頑張りが正当に評価されます。`;
    if (/環境|職場|雰囲気|チーム/i.test(point))
      return `月平均残業8時間以下を実現。家族との時間や趣味を大切にしながら長く活躍できる職場環境です。`;
    // default for recruit
    return `${businessName}では${point}を徹底追求。スタッフ一人ひとりが最大限に活躍できる環境を整えています。`;
  }

  // Service LP defaults
  if (/サポート|フォロー|サービス/i.test(point))
    return `${businessName}ならではの手厚いサポート体制。お客様のご要望に細やかに対応し、高い満足度を実現しています。`;
  if (/実績|経験|創業/i.test(point))
    return `長年の実績が証明する確かな技術と信頼。多くのお客様から選ばれ続ける理由がここにあります。`;
  if (/価格|料金|コスト|安|安心/i.test(point))
    return `明確な料金体系で追加費用なし。高品質なサービスをリーズナブルな価格でご提供しています。`;
  if (/スピード|迅速|即日|翌日/i.test(point))
    return `ご依頼から最短即日対応。スピーディーな対応でお客様のビジネスをスムーズにサポートします。`;

  // Generic default
  return `${point}を徹底追求。${businessName}だからこそ実現できる高い水準を維持し、お客様に最高の体験をお届けします。`;
}

// ─── Image resolution: site images → Pexels → Curated Unsplash ──────────────

// Pexels/Unsplash キーワード（英語で検索精度が高い）
const IMAGE_KEYWORDS: Record<string, string[]> = {
  beauty: ['beauty salon interior', 'spa treatment room', 'hair salon professional', 'skincare luxury', 'wellness spa'],
  medical: ['modern clinic interior', 'doctor consulting patient', 'medical professional', 'hospital bright', 'healthcare office'],
  restaurant: ['elegant restaurant interior', 'fine dining food', 'japanese cuisine', 'cafe cozy', 'food photography'],
  fitness: ['gym modern interior', 'personal trainer workout', 'yoga studio', 'athlete training', 'fitness lifestyle'],
  legal: ['law office interior', 'lawyer professional', 'business meeting room', 'justice scales', 'corporate office'],
  realestate: ['luxury home interior', 'modern house exterior', 'apartment living room', 'real estate property', 'kitchen renovation'],
  education: ['modern classroom', 'students studying', 'university campus', 'online learning', 'teacher student'],
  it: ['modern tech office', 'developer coding', 'digital technology', 'startup office', 'computer programming'],
  construction: ['construction site professional', 'modern architecture', 'building interior', 'renovation work', 'engineering blueprint'],
  retail: ['luxury boutique interior', 'retail store display', 'shopping experience', 'product showcase', 'brand store'],
  cleaning: ['clean modern home', 'professional cleaning service', 'spotless kitchen', 'house cleaning team', 'organized room'],
  wedding: ['elegant wedding ceremony', 'bridal couple happy', 'wedding flowers decoration', 'wedding venue beautiful', 'bride portrait'],
  travel: ['tropical beach resort', 'mountain landscape travel', 'city tourism', 'luxury hotel room', 'adventure travel'],
  insurance: ['financial planning meeting', 'insurance professional', 'family protection', 'business security', 'advisor consulting'],
  accounting: ['accounting office professional', 'financial documents', 'tax consulting', 'business accounting', 'calculator finance'],
  childcare: ['children playing happy', 'kindergarten classroom', 'kids learning', 'childcare center', 'baby care'],
  welfare: ['elderly care professional', 'nursing home bright', 'caregiver elderly', 'rehabilitation therapy', 'healthcare senior'],
  agriculture: ['organic farm fresh', 'vegetables harvest', 'sustainable farming', 'food production', 'farm landscape'],
  automotive: ['luxury car showroom', 'car maintenance professional', 'vehicle interior', 'automotive service', 'car detail'],
  event: ['event venue elegant', 'party celebration', 'conference stage', 'corporate event', 'music concert'],
  photography: ['photography studio professional', 'camera photographer', 'photo shoot creative', 'film production', 'studio lighting'],
  interior: ['interior design modern', 'living room renovation', 'home decor elegant', 'architecture space', 'kitchen design'],
  hr: ['job interview professional', 'team meeting business', 'recruitment hiring', 'career development', 'office teamwork'],
  marketing: ['marketing agency creative', 'digital marketing strategy', 'advertising creative', 'social media marketing', 'creative team'],
  consulting: ['business consulting meeting', 'strategy board', 'professional advisor', 'corporate consulting', 'boardroom meeting'],
  other: ['professional business team', 'modern office workspace', 'success achievement', 'collaboration teamwork', 'business growth'],
};

async function fetchPexelsImages(keywords: string[], count: number): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const results: string[] = [];
  for (let i = 0; i < Math.min(keywords.length, count); i++) {
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords[i])}&per_page=1&orientation=landscape`,
        { headers: { Authorization: apiKey }, signal: AbortSignal.timeout(3000) }
      );
      if (!res.ok) continue;
      const data = await res.json() as { photos: Array<{ src: { large2x: string; large: string } }> };
      const photo = data.photos[0];
      if (photo) results.push(photo.src.large2x || photo.src.large);
    } catch { /* skip */ }
  }
  return results;
}

// キュレーション済み Unsplash 写真ID（Pexels未設定時のフォールバック）
const CURATED_PHOTOS: Record<string, string[]> = {
  beauty: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=500&fit=crop&q=85',
  ],
  medical: [
    'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=500&fit=crop&q=85',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=500&fit=crop&q=85',
  ],
  fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=500&fit=crop&q=85',
  ],
  cleaning: [
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop&q=85',
  ],
  realestate: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop&q=85',
  ],
  it: [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&q=85',
  ],
  wedding: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&h=500&fit=crop&q=85',
  ],
  hr: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=500&fit=crop&q=85',
  ],
  consulting: [
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop&q=85',
  ],
  other: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&h=800&fit=crop&q=85',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop&q=85',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop&q=85',
  ],
};

async function resolveImages(input: LPInput): Promise<string[]> {
  const { tone, industry } = input;
  const siteImgs: string[] = tone.siteImages ?? [];
  const ind = industry ?? 'other';
  const keywords = IMAGE_KEYWORDS[ind] ?? IMAGE_KEYWORDS.other;
  const curated = CURATED_PHOTOS[ind] ?? CURATED_PHOTOS.other;

  // 1st priority: site's own images (if ≥ 2 good ones)
  if (siteImgs.length >= 2) {
    const padded = [...siteImgs];
    const fallbacks = await fetchPexelsImages(keywords.slice(siteImgs.length), Math.max(0, 5 - siteImgs.length));
    const filled = fallbacks.length > 0 ? [...padded, ...fallbacks] : [...padded, ...curated.slice(siteImgs.length)];
    return filled.slice(0, 5);
  }

  // 2nd priority: Pexels API
  const pexels = await fetchPexelsImages(keywords, 5);
  if (pexels.length >= 3) return pexels;

  // 3rd priority: Curated Unsplash IDs
  return curated;
}

function getAvatarUrl(n: number): string {
  return `https://i.pravatar.cc/80?img=${n}`;
}

// ─── Icon set selection ───────────────────────────────────────────────────────

function getIconSet(context: ReturnType<typeof getLPContext>, industry?: string): string[] {
  if (context.isRecruit) return ['🌱', '⏰', '💰', '🏆', '🤝'];

  switch (industry) {
    case 'beauty': return ['✨', '💆', '🌸', '👑', '💎'];
    case 'cleaning': return ['🧹', '✨', '🏠', '⭐', '🔧'];
    case 'medical': return ['🏥', '💊', '🩺', '❤️', '✅'];
    case 'restaurant': return ['🍽️', '👨‍🍳', '⭐', '🌿', '🎉'];
    case 'fitness': return ['💪', '🏃', '⚡', '🎯', '🏆'];
    case 'legal': return ['⚖️', '📜', '🛡️', '✅', '🤝'];
    case 'realestate': return ['🏠', '🔑', '📍', '⭐', '🌟'];
    case 'education': return ['📚', '🎓', '💡', '✏️', '🏆'];
    case 'it': return ['💻', '🚀', '⚡', '🔧', '🌐'];
    case 'construction': return ['🏗️', '🔨', '🏠', '⭐', '✅'];
    case 'wedding': return ['💍', '💒', '🌸', '💐', '✨'];
    case 'travel': return ['✈️', '🗺️', '🌏', '🏖️', '⭐'];
    case 'childcare': return ['👶', '🌈', '🎠', '❤️', '🌟'];
    case 'welfare': return ['❤️', '🤝', '🏥', '😊', '✅'];
    case 'photography': return ['📸', '🎬', '✨', '🎯', '🌟'];
    case 'interior': return ['🏠', '🛋️', '✨', '🎨', '⭐'];
    case 'hr': return ['👥', '🤝', '💼', '🌱', '🏆'];
    case 'marketing': return ['📈', '🎯', '💡', '🚀', '⭐'];
    case 'consulting': return ['💡', '📊', '🤝', '🏆', '🚀'];
    default: return ['⭐', '🚀', '💡', '🎯', '🔥'];
  }
}

// ─── AI generation ────────────────────────────────────────────────────────────

async function generateLPWithAI(input: LPInput): Promise<string> {
  const openai = (await import('@/lib/openai')).default;

  const images = await resolveImages(input);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(input, images) },
    ],
    max_tokens: 16000,
  });

  let raw = response.choices[0]?.message?.content ?? '';
  raw = raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  if (!raw.startsWith('<!DOCTYPE')) raw = await buildFallbackLP(input);
  return ensureRequiredAssets(raw);
}

// Google Fonts + JS を強制挿入（AIが省略した場合のサーバーサイド保険）
function ensureRequiredAssets(html: string): string {
  const FONTS_TAG = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@400;700;900&display=swap" rel="stylesheet">`;

  const ESSENTIAL_JS = `<script>
(function(){
  // Intersection Observer fade-in
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');}});
  },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('section,article,.anim-up,.fade-in').forEach(function(el){obs.observe(el);});

  // Count-up animation
  var obs2 = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target, raw = el.getAttribute('data-count')||'';
      var end = parseInt(raw.replace(/[^0-9]/g,''),10);
      if(!end) return;
      var suf = raw.replace(/[0-9,]/g,''), cur = 0, dur = 1600;
      var tick = setInterval(function(){
        cur = Math.min(cur + Math.ceil(end/(dur/16)), end);
        el.textContent = cur.toLocaleString() + suf;
        if(cur >= end) clearInterval(tick);
      }, 16);
      obs2.unobserve(el);
    });
  },{threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(function(el){obs2.observe(el);});

  // Sticky header dark on scroll
  var hdr = document.querySelector('header,.header,nav');
  if(hdr) window.addEventListener('scroll',function(){
    hdr.style.background = window.scrollY>60 ? 'rgba(0,0,0,0.92)' : '';
  },{passive:true});

  // FAQ accordion
  document.querySelectorAll('.faq-item,[data-faq]').forEach(function(item){
    var q = item.querySelector('.faq-q,.question,dt,summary,h3,h4');
    var a = item.querySelector('.faq-a,.answer,dd,p');
    if(!q||!a) return;
    a.style.cssText = 'overflow:hidden;max-height:0;transition:max-height .35s ease;';
    q.style.cursor = 'pointer';
    q.addEventListener('click',function(ev){
      ev.preventDefault();
      var open = parseFloat(a.style.maxHeight||'0') > 0;
      document.querySelectorAll('.faq-item .faq-a,.faq-item .answer').forEach(function(x){x.style.maxHeight='0';});
      if(!open) a.style.maxHeight = a.scrollHeight + 'px';
    });
  });
})();
</script>`;

  // Google Fonts が未挿入なら <head> 末尾に挿入
  if (!html.includes('fonts.googleapis.com')) {
    html = html.replace('</head>', FONTS_TAG + '\n</head>');
  }
  // JS が未挿入なら </body> 直前に挿入
  if (!html.includes('IntersectionObserver') && !html.includes('data-count')) {
    html = html.replace('</body>', ESSENTIAL_JS + '\n</body>');
  }
  return html;
}

const SYSTEM_PROMPT = `あなたは2026年基準の日本最高峰LPデザイナー兼コンバージョンコピーライターです。
電通・博報堂・WPPレベルのコピーライティングと、SEO/MEO/AIO/AEO/GEO完全対応のWebエンジニアリング知識を持ちます。

【2026年最強LP：PASBECAT × AI最適化の絶対ルール】

■ 構成（必ずこの順序で10セクション実装）
1. HEAD: OGP完備 + Google Fonts + Schema.org JSON-LD（Organization + FAQPage + Service/LocalBusiness）
2. FV（ファーストビュー）: H1テキスト + フルスクリーンヒーロービジュアル + 権威バッジ（実績数値） + 追従ヘッダー + 第1CTA
3. Problem & Affinity: ターゲットの深いインサイトを突く3〜4つの悩み（共感を呼ぶコピー）
4. Solution: 結論ファースト1文（主語+述語を明確に） + サービス全体像 + 画像
5. Benefit（Bento UI）: CSS Gridカード3〜4枚 — 機能でなく「時間・感情・未来の変化」のベネフィット
6. Evidence: カウントアップ数値4つ + 権威ある外部データ引用（調査機関名付き）
7. Contents & Flow: 商品詳細 + 3ステップ利用フロー（HowTo schema対応）
8. Voice（声）: 顔写真+氏名+役職+星5+具体的引用文 × 3名
9. FAQ: Q&A形式5問（FAQPage schema + JSアコーディオン開閉）
10. Action & Trigger: 最終大型CTA + マイクロコピー（「30秒で完了」等） + 追従フッターCTA（position:fixed）
11. Footer + MEO: 会社概要 + 住所/TEL/営業時間テキスト + Googleマップiframe

■ SEO/AIO/AEO/GEO技術要件（全て必須）
- 100%テキスト化: 文字は必ずHTMLテキストで実装（画像内テキスト禁止）
- H1は1つ、H2でセクション構造化（キーワード含む）
- Schema.org JSON-LD: Organization + FAQPage + Service/LocalBusiness（業種による）
- OGP完備: og:title, og:description, og:image, og:type, og:site_name
- 結論ファーストのAIO文体: 主語+述語を明確にした簡潔な記述
- GEO対応: 独自の数値データ・一次情報を必ず含める（「自社調査では〜%」等）
- E-E-A-T: 専門性・権威性・信頼性をテキストで明示（著者/監修者情報含む）

■ デザイン・技術要件（全て必須）
- Google Fonts: Noto Serif JP（見出し） + Noto Sans JP（本文）をCDNで読み込む
- CSSカスタムプロパティ: :rootで全カラー・フォント定義
- word-break: keep-all; overflow-wrap: break-word; line-break: strict; — 全見出しに必須
- font-size: clamp(最小, 推奨, 最大) — 全見出しにレスポンシブタイポグラフィ
- Intersection Observer JS: スクロールでfadeInUp/fadeInLeftアニメーション（全セクション）
- カウントアップJS: data-count属性の数値を0からアニメーション
- 追従ヘッダー: backdrop-blur + スクロール時に背景dark化
- 追従フッターCTA: position:fixed, bottom:0, width:100%, z-index:999（スマホ常時表示）
- Bento UIグリッド: CSS Grid + border-radius:20px + gap:16px（Benefitセクション）
- FAQアコーディオン: JS開閉、max-heightでheight transition
- 画像: object-fit: cover, loading="lazy", 必ずalt属性設定
- モバイル完全対応: 320px〜1920px（メディアクエリ必須）
- scroll-behavior: smooth
- @keyframes: fadeInUp, fadeInLeft, scaleIn, pulse-ring を実装

■ 以下のコードを<head>に必ず含めること（省略・変更禁止）

\`\`\`html
<!-- Google Fonts: 省略・変更禁止 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@400;700;900&display=swap" rel="stylesheet">
\`\`\`

■ 以下のJSを</body>直前に必ず含めること（省略・変更禁止）

\`\`\`html
<script>
// Intersection Observer: スクロールfadeIn
(function(){
  var els = document.querySelectorAll('.anim-up,.anim-left,.anim-right,.anim-scale,.fade-in');
  if(!els.length) {
    // クラスがない場合はセクション全体に適用
    document.querySelectorAll('section,article').forEach(function(el){el.classList.add('anim-up');});
    els = document.querySelectorAll('.anim-up');
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}
    });
  },{threshold:0.1});
  els.forEach(function(el){io.observe(el);});
})();

// カウントアップ
(function(){
  var io2 = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target;
      var raw = el.getAttribute('data-count')||'';
      var target = parseInt(raw.replace(/[^0-9]/g,''),10);
      if(!target){return;}
      var suffix = raw.replace(/[0-9]/g,'');
      var start = 0, duration = 1800, step = 16;
      var timer = setInterval(function(){
        start += Math.ceil(target/(duration/step));
        if(start>=target){start=target;clearInterval(timer);}
        el.textContent = start.toLocaleString() + suffix;
      },step);
      io2.unobserve(el);
    });
  },{threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(function(el){io2.observe(el);});
})();

// 追従ヘッダー: スクロールでdark化
(function(){
  var h = document.querySelector('header,.site-header,.header');
  if(!h) return;
  window.addEventListener('scroll',function(){
    if(window.scrollY>60){h.classList.add('scrolled');}else{h.classList.remove('scrolled');}
  });
})();

// FAQアコーディオン
(function(){
  document.querySelectorAll('.faq-item,.faq-question,[data-faq]').forEach(function(el){
    var q = el.querySelector('summary,.question,h3,h4,dt');
    var a = el.querySelector('.answer,.faq-answer,p,dd');
    if(!q||!a) return;
    a.style.cssText='overflow:hidden;max-height:0;transition:max-height 0.35s ease,padding 0.35s ease;padding:0;';
    q.style.cursor='pointer';
    q.addEventListener('click',function(ev){
      ev.preventDefault();
      var open = a.style.maxHeight!=='0px'&&a.style.maxHeight!=='';
      document.querySelectorAll('.faq-item .answer,.faq-item .faq-answer').forEach(function(x){
        x.style.maxHeight='0';x.style.padding='0';
      });
      if(!open){a.style.maxHeight=a.scrollHeight+'px';a.style.padding='16px 0';}
    });
  });
})();
</script>
\`\`\`

■ コピーライティング絶対禁止事項
- 「〜を徹底追求し、お客様の期待を超える成果をお届けします」→ 即禁止
- 同じ説明文を複数箇所で使う → 禁止
- 抽象的な美辞麗句のみ → 禁止
- 必ず具体的な数字・変化・ベネフィットを書く
- LP目的と無関係なコピー → 禁止（採用LPに顧客向け文章を書くな）

■ 出力形式
コードブロックなし。<!DOCTYPE html>から始まる完全なHTMLのみ返す。最低1500行。`;

function buildPrompt(input: LPInput, images: string[]): string {
  const { tone, businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, cvGoal, cvButtonText, cvUrl, contactEmail, industry } = input;
  const cvLabel = CV_LABELS[cvGoal];
  const cvAction = cvUrl ? `href="${cvUrl}" target="_blank"` : cvGoal === 'tel' ? 'href="tel:"' : 'href="#contact"';
  const sp = sellingPoints.filter(Boolean);
  const avatars = [1, 5, 12].map(getAvatarUrl);
  const ctx = getLPContext(input);

  const schemaType = ctx.isRecruit ? 'JobPosting + Organization'
    : industry === 'restaurant' ? 'Restaurant + FAQPage'
    : industry === 'medical' ? 'MedicalBusiness + FAQPage'
    : 'LocalBusiness + Service + FAQPage';

  const stats = ctx.isRecruit
    ? [{ n: '98', u: '%', l: 'スタッフ定着率' }, { n: '3', u: 'ヶ月', l: '独り立ち研修' }, { n: '20', u: 'h', l: '月平均残業' }, { n: '100', u: '%', l: '有給取得実績' }]
    : [{ n: '2,000', u: '件+', l: '累計実績' }, { n: '98', u: '%', l: '顧客満足度' }, { n: '10', u: '年+', l: '業界経験' }, { n: '24', u: 'h', l: 'サポート対応' }];

  const faqs = ctx.isRecruit
    ? [
        ['未経験でも応募できますか？', 'はい、未経験大歓迎です。入社後3ヶ月の充実した研修プログラムで、基礎からしっかり身につけられます。'],
        ['シフトの融通は利きますか？', '週2日〜OKのシフト制です。育児・介護中の方や副業との掛け持ちも可能です。'],
        ['給与・昇給について教えてください', '経験・スキルに応じた給与設定で、入社後の昇給実績あり。インセンティブ制度もあります。'],
        ['職場の雰囲気はどうですか？', '20〜40代のスタッフが活躍中。チームワークを大切にした職場で、わからないことはすぐ相談できます。'],
        ['選考の流れを教えてください', '①WEB応募 → ②書類選考（3営業日以内）→ ③面接1回 → ④内定 です。お気軽にご応募ください。'],
      ]
    : [
        [`${businessName}の料金はいくらですか？`, 'プランによって異なります。まずは無料相談にてお客様の状況をヒアリングし、最適なプランをご提案します。'],
        ['どのくらいで効果が出ますか？', '多くのお客様が1〜3ヶ月以内に変化を実感されています。プロのサポートで最短で成果を出せるよう伴走します。'],
        ['初めてでも安心ですか？', 'はい。初心者の方でも丁寧にサポートします。担当スタッフが最初から最後まで寄り添います。'],
        ['解約・キャンセルはできますか？', 'はい、いつでも解約可能です。縛りや違約金はありません。まずはお気軽にお試しください。'],
        ['オンラインでも対応できますか？', 'はい、全国対応可能です。Zoom等のオンラインミーティングでも同品質のサービスをご提供します。'],
      ];

  return `## ビジネス情報
- ビジネス名: **${businessName}**
- 業種: ${industry ?? 'その他'} | LP目的: **${lpPurpose}** | ターゲット: **${targetAudience}**
- キャッチコピーヒント: 「${catchphraseHint || 'ターゲットの感情を動かす最強コピーを創案せよ'}」
- CVゴール: **${cvLabel}**（ボタン: 「${cvButtonText}」、リンク: ${cvAction}）
${contactEmail ? `- 問い合わせ先: ${contactEmail}` : ''}

## ブランドカラー・デザイン
- Primary: ${tone.colors.primary} | Accent: ${tone.colors.accent} | BG: ${tone.colors.background} | Text: ${tone.colors.text}
- トーン: ${tone.toneLabel}（${tone.styleKeywords.join('・')}）
- 見出しフォント: Noto Serif JP | 本文: Noto Sans JP（Google Fonts必須）

## 訴求ポイント（各カードに完全ユニークな説明文を書くこと — コピペ禁止）
${sp.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## 使用する画像URL（このURLをそのまま使用、差し替え・省略禁止）
- [HERO背景] ${images[0] ?? ''}
- [Section-1] ${images[1] ?? images[0] ?? ''} 
- [Section-2] ${images[2] ?? images[0] ?? ''}
- [Section-3] ${images[3] ?? images[0] ?? ''}
- [顔写真-A] ${avatars[0]}
- [顔写真-B] ${avatars[1]}
- [顔写真-C] ${avatars[2]}

${ctx.isRecruit ? `## 【採用LP専用指示】
求職者に向けた採用LPです。全コピーを求職者目線で書くこと。
- 「お客様」は使わない → 「スタッフ」「仲間」「あなた」を使う
- ファーストビューの権威バッジ: 「スタッフ定着率98%」「月平均残業20h以下」等
- 問題提起: 求職者が今の職場に感じる不安・不満・限界
- ベネフィット: 働きやすさ・成長・収入・プライベートの充実
- Voiceは「現役スタッフの声」（入社年数・前職も記載）
- 追従CTAの文言: 「まず話を聞くだけでもOK」などハードルを下げる` : `## 【サービスLP専用指示】
「${targetAudience}」が抱える最大の痛み・不安・欲求から逆算し、
Solution → Benefit → Evidenceの流れで「この会社だけが解決できる」という文脈を作る。`}

## STATSセクション（カウントアップJSで演出）
${stats.map(s => `- data-count="${s.n.replace(/[^0-9]/g, '')}" → "${s.n}${s.u} ${s.l}"`).join('\n')}

## FAQの内容（FAQPage JSON-LDに全て含める）
${faqs.map(([q, a], i) => `Q${i + 1}: ${q}\nA${i + 1}: ${a}`).join('\n')}

## Schema.org JSON-LD（必須）
型: ${schemaType} | 全FAQを含める | businessName: ${businessName}

## 実装チェックリスト（全て満たすこと）
✓ <!DOCTYPE html>から始まる完全HTML（1500行以上）
✓ <head>: OGP5タグ + Google Fonts CDN + JSON-LD
✓ :rootにCSS変数定義
✓ 全見出しにword-break:keep-all; overflow-wrap:break-word; line-break:strict
✓ 全見出しにfont-size:clamp()
✓ Intersection Observer JS（fadeInUp全セクション）
✓ カウントアップJS（data-count属性）
✓ 追従ヘッダー（backdrop-blur+scroll dark化）
✓ 追従フッターCTA（fixed+bottom:0）
✓ Bento UIグリッド（Benefitセクション）
✓ FAQアコーディオンJS（height transition）
✓ 全画像にalt+loading="lazy"+object-fit:cover
✓ スマホ320px完全対応`;
}

// ─── High-quality fallback HTML ───────────────────────────────────────────────

async function buildFallbackLP(input: LPInput): Promise<string> {
  const { tone, businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, cvGoal, cvButtonText, cvUrl, contactEmail } = input;
  const images = await resolveImages(input);
  const heroImg = images[0];
  const sectionImg1 = images[1] ?? images[0];
  const sectionImg2 = images[2] ?? images[0];
  const cvLabel = CV_LABELS[cvGoal];
  const cvAction = cvUrl ? `href="${cvUrl}" target="_blank"` : cvGoal === 'tel' ? 'href="tel:"' : 'href="#contact"';
  const sp = [...sellingPoints.filter(Boolean), '圧倒的な実績と信頼', '充実したアフターサポート', '業界最高水準の品質'].slice(0, 3);
  const catch_ = catchphraseHint || `${businessName}が、あなたの未来を変える`;
  const ctx = getLPContext(input);
  const icons = getIconSet(ctx, input.industry);

  const avatars = [1, 5, 12, 25, 33, 45].map(n => `https://i.pravatar.cc/80?img=${n}`);

  // ─ Pain points based on LP context ─
  const painPoints = ctx.isRecruit
    ? [
        '今の職場に将来性を感じない・キャリアアップが見えない',
        'スキルアップができる環境・研修制度が整っていない',
        'プライベートも大切にしながら無理なく働きたい',
      ]
    : [
        `${targetAudience.split('・')[0] || 'お客様'}の課題を根本から解決`,
        '時間・コスト・品質の三拍子を実現',
        '専門チームが最初から最後まで伴走',
      ];

  // ─ Testimonials based on LP context ─
  const testimonials = ctx.isRecruit
    ? [
        { name: '田中 愛様', role: '入社2年目・前職：アパレル', text: `未経験からのスタートでしたが、充実した研修制度のおかげで3ヶ月で一人立ちできました。${businessName}に転職して本当に良かったです。`, img: avatars[0], rating: 5 },
        { name: '鈴木 健太様', role: '入社5年目・チームリーダー', text: '残業が少なく、プライベートも大切にしながら働けています。スキルアップのサポートも手厚く、やりがいを感じながら毎日働けています。', img: avatars[1], rating: 5 },
        { name: '山田 花子様', role: '入社1年目・子育て中', text: '育児中でもシフトの融通が利くので安心して働けます。職場の雰囲気もよく、チームの仲間がいつもサポートしてくれます。', img: avatars[2], rating: 5 },
      ]
    : [
        { name: '田中 美咲様', role: '30代・会社員', text: `${businessName}に相談してから、毎日の生活がガラリと変わりました。こんなに結果が出るとは思っていなかったので本当に感謝しています。`, img: avatars[0], rating: 5 },
        { name: '鈴木 健太様', role: '40代・経営者', text: '最初は半信半疑でしたが、プロのサポートで確実に成果が出ています。もっと早く相談すれば良かったと思うくらいです。', img: avatars[1], rating: 5 },
        { name: '山田 花子様', role: '20代・フリーランス', text: `他社と比較しましたが、${businessName}の丁寧さと専門性は別格でした。コスパも最高で今後もお願いしたいです。`, img: avatars[2], rating: 5 },
      ];

  // ─ FAQs based on LP context ─
  const faqs = ctx.isRecruit
    ? [
        { q: '未経験でも応募できますか？', a: 'はい、未経験の方も大歓迎です。入社後の研修プログラムで基礎からしっかり学べる環境を整えていますので、安心してご応募ください。' },
        { q: '研修制度について教えてください', a: '入社後3ヶ月間、専任のトレーナーがマンツーマンで指導します。業務に必要な知識・スキルを体系的に習得できます。' },
        { q: 'シフトの融通は利きますか？', a: 'はい、週3日〜のシフト制です。育児・介護・副業との両立も可能です。まずはご希望をお聞かせください。' },
        { q: '残業はどのくらいありますか？', a: '月平均残業時間は8時間程度です。ワークライフバランスを大切にしており、残業削減に積極的に取り組んでいます。' },
        { q: '応募から採用までの流れは？', a: 'エントリー→書類選考（3営業日以内にご連絡）→面接（1〜2回）→内定のステップです。お気軽にご応募ください。' },
      ]
    : [
        { q: '初回相談は無料ですか？', a: 'はい、初回のご相談・お見積りは完全無料です。まずはお気軽にお問い合わせください。' },
        { q: `${lpPurpose}に関して何から始めればいいですか？`, a: 'まずはお問い合わせフォームよりご連絡ください。専任スタッフが現状をお伺いし、最適なプランをご提案します。' },
        { q: '対応エリアはどこですか？', a: 'オンラインでの対応も可能ですので、全国どこからでもご相談いただけます。' },
        { q: '契約後にキャンセルはできますか？', a: 'はい、キャンセルポリシーに従って柔軟に対応しております。詳細はお問い合わせください。' },
        { q: '実績や事例を見ることはできますか？', a: 'はい、ご要望に応じて事例集をご共有しております。お問い合わせの際にお申し付けください。' },
      ];

  // ─ Stats based on LP context ─
  const statsHTML = ctx.isRecruit
    ? `<div class="stat-item anim-up delay-1">
        <span class="stat-num">98<span class="stat-unit">%</span></span>
        <span class="stat-label">スタッフ定着率</span>
      </div>
      <div class="stat-item anim-up delay-2">
        <span class="stat-num">8<span class="stat-unit">h</span></span>
        <span class="stat-label">月平均残業時間</span>
      </div>
      <div class="stat-item anim-up delay-3">
        <span class="stat-num">3<span class="stat-unit">ヶ月</span></span>
        <span class="stat-label">充実の研修期間</span>
      </div>
      <div class="stat-item anim-up delay-4">
        <span class="stat-num">85<span class="stat-unit">%</span></span>
        <span class="stat-label">有給取得率</span>
      </div>`
    : `<div class="stat-item anim-up delay-1">
        <span class="stat-num">500<span class="stat-unit">+</span></span>
        <span class="stat-label">累計導入実績</span>
      </div>
      <div class="stat-item anim-up delay-2">
        <span class="stat-num">98<span class="stat-unit">%</span></span>
        <span class="stat-label">顧客満足度</span>
      </div>
      <div class="stat-item anim-up delay-3">
        <span class="stat-num">10<span class="stat-unit">年</span></span>
        <span class="stat-label">業界経験</span>
      </div>
      <div class="stat-item anim-up delay-4">
        <span class="stat-num">24<span class="stat-unit">h</span></span>
        <span class="stat-label">サポート対応</span>
      </div>`;

  // ─ Hero sub text based on LP context ─
  const heroSubText = ctx.isRecruit
    ? `${businessName}で、あなたの可能性を広げませんか。<br />未経験歓迎・充実の研修制度で安心してスタートできます。`
    : `${targetAudience}に向けた、${businessName}ならではのアプローチ。<br />あなたの悩みを根本から解決します。`;

  const heroTrustItems = ctx.isRecruit
    ? ['未経験歓迎', '研修制度充実', '残業少なめ']
    : ['無料相談受付中', '実績500社以上', '満足度98%'];

  const testimonialsTitle = ctx.isRecruit ? '現役スタッフの声' : 'お客様の声';
  const testimonialsLead = ctx.isRecruit
    ? '実際に働くスタッフからのリアルな声をご紹介します'
    : '実際にご利用いただいたお客様からの声をご紹介します';

  const contactTitle = ctx.isRecruit ? 'まずはお気軽に<br />ご応募ください' : 'まずは無料で<br />ご相談ください';
  const contactLead = ctx.isRecruit
    ? `${businessName}のスタッフ一同が、あなたのご応募をお待ちしています。疑問・不安はなんでもお気軽にどうぞ。`
    : `${businessName}の専任スタッフが、あなたの状況に合わせて丁寧にご対応します。`;

  const formHTML = (cvGoal === 'inquiry' || cvGoal === 'download')
    ? `<form action="https://formspree.io/f/dummy" method="POST" class="contact-form">
        ${contactEmail ? `<input type="hidden" name="_replyto" value="${contactEmail}" />` : ''}
        <div class="form-row">
          <div class="form-group"><label>お名前 <span class="req">*</span></label><input type="text" name="name" placeholder="山田 太郎" required /></div>
          <div class="form-group"><label>メールアドレス <span class="req">*</span></label><input type="email" name="email" placeholder="your@email.com" required /></div>
        </div>
        <div class="form-group"><label>電話番号</label><input type="tel" name="tel" placeholder="090-0000-0000" /></div>
        <div class="form-group"><label>${ctx.isRecruit ? 'ご希望・メッセージ' : 'お問い合わせ内容'} <span class="req">*</span></label><textarea name="message" rows="5" placeholder="${ctx.isRecruit ? '希望勤務日・志望動機などをお気軽にどうぞ' : 'ご質問・ご要望をお気軽にどうぞ'}" required></textarea></div>
        <button type="submit" class="btn-primary btn-xl">${cvButtonText} →</button>
        <p class="form-note">個人情報は適切に管理し、第三者に提供することはありません。</p>
      </form>`
    : `<div class="cta-big">
        <a ${cvAction} class="btn-primary btn-xl">${cvButtonText} →</a>
        <p class="cta-sub">${ctx.isRecruit ? 'まずはお気軽にご応募ください。担当者が迅速にご連絡します。' : 'まずはお気軽にご相談ください。担当者が迅速に対応します。'}</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${businessName} | ${lpPurpose}</title>
  <meta name="description" content="${businessName}の${lpPurpose}。${targetAudience}に向けたサービスです。" />
  <meta property="og:title" content="${businessName} | ${lpPurpose}" />
  <meta property="og:description" content="${businessName}の${lpPurpose}。${targetAudience}に向けたサービスです。" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="${heroImg}" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${ctx.isRecruit ? 'JobPosting' : 'LocalBusiness'}",
    "name": "${businessName}",
    "description": "${lpPurpose}"
  }
  </script>
  <style>
    /* ── Variables ── */
    :root {
      --primary: ${tone.colors.primary};
      --secondary: ${tone.colors.secondary};
      --accent: ${tone.colors.accent};
      --bg: ${tone.colors.background};
      --text: ${tone.colors.text};
      --white: #ffffff;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-300: #d1d5db;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
      --shadow-lg: 0 12px 40px rgba(0,0,0,0.18);
      --shadow-xl: 0 24px 64px rgba(0,0,0,0.22);
      --radius: 16px;
      --radius-sm: 8px;
      --radius-lg: 24px;
      --font-head: "${tone.fonts.headline}", "Noto Serif JP", Georgia, serif;
      --font-body: "${tone.fonts.body}", "Noto Sans JP", -apple-system, sans-serif;
      --max-w: 1080px;
      --section-py: 96px;
    }

    /* ── Reset & Base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.7; -webkit-font-smoothing: antialiased; }
    img { max-width: 100%; display: block; }
    a { text-decoration: none; color: inherit; }
    ul { list-style: none; }

    /* ── Japanese text line break fix ── */
    h1, h2, h3, h4 {
      word-break: keep-all;
      overflow-wrap: break-word;
      line-break: strict;
    }
    .hero h1 {
      word-break: keep-all;
      overflow-wrap: break-word;
    }
    .section-title {
      word-break: keep-all;
      overflow-wrap: break-word;
    }

    /* ── Layout ── */
    .container { max-width: var(--max-w); margin: 0 auto; padding: 0 32px; }
    .section { padding: var(--section-py) 0; }
    .section-alt { background: var(--gray-50); }

    /* ── Typography ── */
    .section-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
      color: var(--accent); margin-bottom: 14px;
    }
    .section-badge::before { content: ''; display: block; width: 24px; height: 2px; background: var(--accent); }
    h2.section-title {
      font-family: var(--font-head); font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 900;
      color: var(--text); line-height: 1.3; margin-bottom: 16px;
    }
    .section-lead { font-size: 1.05rem; color: var(--gray-500); max-width: 560px; margin-bottom: 56px; line-height: 1.8; }

    /* ── Buttons ── */
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--accent); color: var(--white);
      font-weight: 700; font-size: 1rem; letter-spacing: 0.02em;
      padding: 14px 36px; border-radius: 50px; border: none; cursor: pointer;
      box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 40%, transparent);
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
      white-space: nowrap;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 50%, transparent); }
    .btn-primary:active { transform: translateY(0); }
    .btn-outline {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: transparent; color: var(--white);
      font-weight: 600; font-size: 1rem; padding: 13px 32px; border-radius: 50px;
      border: 2px solid rgba(255,255,255,0.5); cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .btn-outline:hover { background: rgba(255,255,255,0.12); border-color: var(--white); }
    .btn-xl { font-size: 1.1rem; padding: 18px 48px; }

    /* ── Animations ── */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 50%, transparent); }
      100% { box-shadow: 0 0 0 20px transparent; }
    }
    .anim-up { animation: fadeInUp 0.7s ease both; }
    .anim-left { animation: fadeInLeft 0.7s ease both; }
    .anim-right { animation: fadeInRight 0.7s ease both; }
    .anim-scale { animation: scaleIn 0.6s ease both; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }
    .delay-6 { animation-delay: 0.6s; }

    /* ── Header ── */
    .site-header {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 0 32px; height: 70px;
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(${hexToRgb(tone.colors.background)}, 0.85);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(${hexToRgb(tone.colors.text)}, 0.08);
      transition: background 0.3s;
    }
    .header-logo { font-family: var(--font-head); font-weight: 900; font-size: 1.25rem; color: var(--primary); letter-spacing: -0.02em; }
    .header-nav { display: flex; align-items: center; gap: 32px; }
    .header-nav a { font-size: 0.875rem; font-weight: 500; color: var(--gray-500); transition: color 0.2s; }
    .header-nav a:hover { color: var(--primary); }
    .header-cta .btn-primary { padding: 10px 24px; font-size: 0.875rem; }

    /* ── Hero ── */
    .hero {
      position: relative; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0;
      background-image: url('${heroImg}');
      background-size: cover; background-position: center;
      transform: scale(1.05);
      transition: transform 8s ease;
    }
    .hero:hover .hero-bg { transform: scale(1); }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--primary) 80%, black) 0%,
        color-mix(in srgb, var(--secondary) 60%, black) 60%,
        rgba(0,0,0,0.7) 100%
      );
    }
    .hero-content {
      position: relative; z-index: 2; text-align: center;
      padding: 120px 32px 80px; max-width: 800px;
    }
    .hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.12); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 50px;
      padding: 6px 18px; font-size: 0.8rem; color: rgba(255,255,255,0.9);
      font-weight: 600; letter-spacing: 0.08em; margin-bottom: 28px;
    }
    .hero h1 {
      font-family: var(--font-head);
      font-size: clamp(2.25rem, 6vw, 4.25rem);
      font-weight: 900; color: var(--white); line-height: 1.3;
      margin-bottom: 24px; letter-spacing: -0.02em;
      word-break: keep-all; overflow-wrap: break-word;
    }
    .hero h1 .accent-text {
      background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, var(--white)));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub {
      font-size: clamp(1rem, 2vw, 1.2rem); color: rgba(255,255,255,0.8);
      max-width: 560px; margin: 0 auto 40px; line-height: 1.8;
    }
    .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
    .hero-trust { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; }
    .hero-trust-item { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.7); font-size: 0.85rem; }
    .hero-trust-item::before { content: '✓'; color: var(--accent); font-weight: 700; }
    .scroll-arrow {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.5); font-size: 1.5rem; z-index: 2;
      animation: float 2s ease-in-out infinite;
    }

    /* ── Stats bar ── */
    .stats-bar {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: 48px 0;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
    .stat-item {
      text-align: center; padding: 24px;
      border-right: 1px solid rgba(255,255,255,0.15);
    }
    .stat-item:last-child { border-right: none; }
    .stat-num {
      font-family: var(--font-head); font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 900; color: var(--white); display: block; line-height: 1;
    }
    .stat-unit { font-size: 1.5rem; }
    .stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.75); margin-top: 6px; display: block; }

    /* ── Problem section ── */
    .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .problem-image {
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-xl);
      aspect-ratio: 4/3;
    }
    .problem-image img { width: 100%; height: 100%; object-fit: cover; }
    .problem-list { display: flex; flex-direction: column; gap: 20px; margin-top: 32px; }
    .problem-item {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 20px; border-radius: var(--radius);
      background: var(--white); box-shadow: var(--shadow-sm);
      border-left: 4px solid var(--accent);
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .problem-item:hover { box-shadow: var(--shadow-md); transform: translateX(4px); }
    .problem-icon { font-size: 1.5rem; flex-shrink: 0; }
    .problem-text strong { display: block; font-weight: 700; margin-bottom: 4px; color: var(--text); word-break: keep-all; overflow-wrap: break-word; }
    .problem-text span { font-size: 0.9rem; color: var(--gray-500); }

    /* ── Features ── */
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    .feature-card {
      padding: 36px 28px; border-radius: var(--radius-lg);
      background: var(--white); box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      transition: transform 0.25s, box-shadow 0.25s;
      position: relative; overflow: hidden;
    }
    .feature-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }
    .feature-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
    .feature-icon-wrap {
      width: 60px; height: 60px; border-radius: 16px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; margin-bottom: 20px;
    }
    .feature-card h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 10px; color: var(--text); word-break: keep-all; overflow-wrap: break-word; }
    .feature-card p { font-size: 0.9rem; color: var(--gray-500); line-height: 1.7; }
    .feature-num {
      position: absolute; top: 20px; right: 24px;
      font-family: var(--font-head); font-size: 3rem; font-weight: 900;
      color: var(--gray-100); line-height: 1;
    }

    /* ── Image + text ── */
    .img-text-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
    .img-text-grid.reverse { direction: rtl; }
    .img-text-grid.reverse > * { direction: ltr; }
    .img-wrap {
      border-radius: var(--radius-lg); overflow: hidden;
      box-shadow: var(--shadow-xl); aspect-ratio: 4/3;
    }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .text-content { display: flex; flex-direction: column; gap: 20px; }
    .text-content ul { display: flex; flex-direction: column; gap: 12px; }
    .text-content li {
      display: flex; align-items: center; gap: 12px;
      font-size: 0.95rem; color: var(--gray-700);
    }
    .text-content li::before {
      content: ''; width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent); flex-shrink: 0;
    }

    /* ── Testimonials ── */
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    .testimonial-card {
      background: var(--white); border-radius: var(--radius-lg);
      padding: 32px; box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-100);
      position: relative;
    }
    .testimonial-card::before {
      content: '"'; font-family: var(--font-head); font-size: 5rem; line-height: 1;
      position: absolute; top: 16px; right: 20px;
      color: color-mix(in srgb, var(--accent) 15%, transparent);
      font-weight: 900;
    }
    .testimonial-stars { color: #fbbf24; font-size: 0.875rem; margin-bottom: 12px; letter-spacing: 2px; }
    .testimonial-text { font-size: 0.9rem; color: var(--gray-700); line-height: 1.8; margin-bottom: 20px; }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent); }
    .testimonial-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .testimonial-name { font-weight: 700; font-size: 0.9rem; }
    .testimonial-role { font-size: 0.8rem; color: var(--gray-500); }

    /* ── FAQ ── */
    .faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
    .faq-item { border-radius: var(--radius); overflow: hidden; border: 1px solid var(--gray-100); }
    .faq-item summary {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; cursor: pointer; font-weight: 700; font-size: 0.95rem;
      background: var(--white); user-select: none; list-style: none;
      transition: background 0.15s;
      word-break: keep-all; overflow-wrap: break-word;
    }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item summary:hover { background: var(--gray-50); }
    .faq-item summary::after { content: '+'; font-size: 1.4rem; color: var(--accent); font-weight: 300; line-height: 1; }
    .faq-item[open] summary::after { content: '−'; }
    .faq-item[open] summary { background: color-mix(in srgb, var(--accent) 5%, var(--white)); border-bottom: 1px solid var(--gray-100); }
    .faq-answer { padding: 20px 24px; font-size: 0.9rem; color: var(--gray-700); line-height: 1.8; background: var(--white); }

    /* ── Contact / CTA section ── */
    .contact-section {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      padding: var(--section-py) 0;
    }
    .contact-inner { max-width: 680px; margin: 0 auto; padding: 0 32px; text-align: center; }
    .contact-inner h2 { color: var(--white); }
    .contact-inner .section-badge { color: rgba(255,255,255,0.7); }
    .contact-inner .section-badge::before { background: rgba(255,255,255,0.5); }
    .contact-inner .section-lead { color: rgba(255,255,255,0.75); }
    .contact-form { text-align: left; margin-top: 40px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.85); }
    .form-group input, .form-group textarea {
      padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1); color: var(--white); font-size: 0.95rem;
      font-family: var(--font-body); outline: none; transition: border-color 0.2s, background 0.2s;
    }
    .form-group input::placeholder, .form-group textarea::placeholder { color: rgba(255,255,255,0.4); }
    .form-group input:focus, .form-group textarea:focus { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.15); }
    .form-group textarea { resize: vertical; }
    .contact-form .btn-primary { width: 100%; margin-top: 8px; background: var(--accent); font-size: 1.05rem; padding: 16px; border-radius: var(--radius); }
    .form-note { font-size: 0.78rem; color: rgba(255,255,255,0.5); text-align: center; margin-top: 12px; }
    .req { color: var(--accent); }
    .cta-big { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 40px; }
    .cta-sub { font-size: 0.9rem; color: rgba(255,255,255,0.65); }

    /* ── Footer ── */
    .site-footer { background: color-mix(in srgb, var(--primary) 90%, black); padding: 40px 32px; }
    .footer-inner { max-width: var(--max-w); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .footer-logo { font-family: var(--font-head); font-weight: 900; color: var(--white); font-size: 1.1rem; }
    .footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.4); }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      :root { --section-py: 64px; }
      .container { padding: 0 20px; }
      .site-header { padding: 0 20px; }
      .header-nav { display: none; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.15); }
      .problem-grid, .img-text-grid, .features-grid, .testimonials-grid { grid-template-columns: 1fr; }
      .img-text-grid.reverse { direction: ltr; }
      .form-row { grid-template-columns: 1fr; }
      .hero h1 { font-size: 2rem; }
      .hero-btns { flex-direction: column; align-items: center; }
    }
  </style>
</head>
<body>

<!-- ── Header ── -->
<header class="site-header">
  <div class="header-logo">${businessName}</div>
  <nav class="header-nav">
    <a href="#features">特長</a>
    <a href="#testimonials">${ctx.isRecruit ? 'スタッフの声' : 'お客様の声'}</a>
    <a href="#faq">FAQ</a>
  </nav>
  <div class="header-cta">
    <a ${cvAction} class="btn-primary">${cvButtonText}</a>
  </div>
</header>

<!-- ── Hero ── -->
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-eyebrow anim-up">✦ ${lpPurpose}</div>
    <h1 class="anim-up delay-1">
      ${catch_.includes('、') ? catch_.replace('、', '<br /><span class="accent-text">') + '</span>' : catch_}
    </h1>
    <p class="hero-sub anim-up delay-2">${heroSubText}</p>
    <div class="hero-btns anim-up delay-3">
      <a ${cvAction} class="btn-primary btn-xl">${cvButtonText} →</a>
      <a href="#features" class="btn-outline btn-xl">詳しく見る</a>
    </div>
    <div class="hero-trust anim-up delay-4">
      ${heroTrustItems.map(item => `<span class="hero-trust-item">${item}</span>`).join('')}
    </div>
  </div>
  <div class="scroll-arrow">↓</div>
</section>

<!-- ── Stats bar ── -->
<section class="stats-bar">
  <div class="container">
    <div class="stats-grid">
      ${statsHTML}
    </div>
  </div>
</section>

<!-- ── Problem ── -->
<section class="section" id="problem">
  <div class="container">
    <div class="problem-grid">
      <div class="problem-image anim-left">
        <img src="${sectionImg1}" alt="${businessName}のサービス" loading="lazy" />
      </div>
      <div class="anim-right">
        <div class="section-badge">PROBLEM</div>
        <h2 class="section-title">${ctx.isRecruit ? 'こんなお悩みを<br />抱えていませんか？' : 'こんなお悩み、<br />ありませんか？'}</h2>
        <p class="section-lead">${ctx.isRecruit ? `多くの求職者が抱える不安を、${businessName}は解決します。` : `${targetAudience}の多くが抱える課題を、${businessName}は確実に解決します。`}</p>
        <ul class="problem-list">
          ${painPoints.map((p, i) => `<li class="problem-item anim-up delay-${i + 2}">
            <div class="problem-icon">${['😔', '😟', '😤'][i]}</div>
            <div class="problem-text">
              <strong>${p}</strong>
              <span>${ctx.isRecruit ? 'そのお悩み、私たちが解決します' : '一人で悩まず、専門家に相談しましょう'}</span>
            </div>
          </li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ── Features ── -->
<section class="section section-alt" id="features">
  <div class="container">
    <div style="text-align:center; max-width:600px; margin:0 auto 56px;">
      <div class="section-badge anim-up">FEATURES</div>
      <h2 class="section-title anim-up delay-1">${ctx.isRecruit ? `${businessName}で働く<br />3つの魅力` : `${businessName}が選ばれる<br />3つの理由`}</h2>
      <p class="section-lead anim-up delay-2" style="margin:0 auto">${ctx.isRecruit ? `スタッフが長く活躍できる、${businessName}ならではの環境をご紹介します。` : `${targetAudience}のニーズに応え続ける、私たちの強みをご紹介します。`}</p>
    </div>
    <div class="features-grid">
      ${sp.map((point, i) => {
        const title = point.split('：')[0] || point.slice(0, 20);
        const desc = generateFeatureDesc(point, ctx, businessName);
        return `<div class="feature-card anim-up delay-${i + 2}">
        <div class="feature-num">0${i + 1}</div>
        <div class="feature-icon-wrap">${icons[i] ?? '⭐'}</div>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>`;
      }).join('')}
    </div>
  </div>
</section>

<!-- ── Image + text ── -->
<section class="section" id="about">
  <div class="container">
    <div class="img-text-grid">
      <div class="img-wrap anim-left">
        <img src="${sectionImg2}" alt="${businessName}について" loading="lazy" />
      </div>
      <div class="text-content anim-right">
        <div class="section-badge">WHY US</div>
        <h2 class="section-title">なぜ${businessName}が<br />最適な選択なのか</h2>
        <p style="font-size:0.95rem; color:var(--gray-700); line-height:1.9;">${ctx.isRecruit ? `私たちは働くスタッフ一人ひとりを大切にしています。無理なく長く活躍できる環境づくりに全力で取り組んでいます。` : `私たちは${targetAudience}の課題に真剣に向き合い、一人ひとりに最適なソリューションを提供し続けています。単なる${lpPurpose}に留まらず、長期的な関係を大切にしています。`}</p>
        <ul>
          ${sp.map(p => `<li>${p.split('：')[0] || p.slice(0, 30)}</li>`).join('')}
          ${ctx.isRecruit ? '<li>充実した福利厚生・社内制度</li><li>明確なキャリアパス</li>' : '<li>充実したアフターサポート体制</li><li>明確な料金体系・追加費用なし</li>'}
        </ul>
        <div><a ${cvAction} class="btn-primary">${cvButtonText} →</a></div>
      </div>
    </div>
  </div>
</section>

<!-- ── Testimonials ── -->
<section class="section section-alt" id="testimonials">
  <div class="container">
    <div style="text-align:center; max-width:600px; margin:0 auto 56px;">
      <div class="section-badge anim-up">TESTIMONIALS</div>
      <h2 class="section-title anim-up delay-1">${testimonialsTitle}</h2>
      <p class="section-lead anim-up delay-2" style="margin:0 auto">${testimonialsLead}</p>
    </div>
    <div class="testimonials-grid">
      ${testimonials.map((t, i) => `<div class="testimonial-card anim-up delay-${i + 2}">
        <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar"><img src="${t.img}" alt="${t.name}" loading="lazy" /></div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-role">${t.role}</div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ── FAQ ── -->
<section class="section" id="faq">
  <div class="container">
    <div style="text-align:center; max-width:600px; margin:0 auto 56px;">
      <div class="section-badge anim-up">FAQ</div>
      <h2 class="section-title anim-up delay-1">よくある質問</h2>
    </div>
    <div class="faq-list">
      ${faqs.map((f, i) => `<details class="faq-item anim-up delay-${i + 1}">
        <summary>${f.q}</summary>
        <div class="faq-answer">${f.a}</div>
      </details>`).join('')}
    </div>
  </div>
</section>

<!-- ── Contact / CTA ── -->
<section class="contact-section" id="contact">
  <div class="contact-inner">
    <div class="section-badge anim-up">${cvLabel.toUpperCase()}</div>
    <h2 class="section-title anim-up delay-1" style="color:var(--white)">${contactTitle}</h2>
    <p class="section-lead anim-up delay-2">${contactLead}</p>
    <div class="anim-up delay-3">
      ${formHTML}
    </div>
  </div>
</section>

<!-- ── Footer ── -->
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-logo">${businessName}</div>
    <div class="footer-copy">© ${new Date().getFullYear()} ${businessName}. All rights reserved.</div>
  </div>
</footer>

</body>
</html>`;
}

// ─── Hex to RGB helper ────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '255,255,255';
  return `${r},${g},${b}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as LPInput;
    if (!input.tone || !input.businessName) {
      return NextResponse.json({ error: 'tone and businessName are required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY ?? '';
    const hasAI = apiKey && !apiKey.startsWith('sk-dummy') && !apiKey.startsWith('sk-ant');

    let html: string;
    if (hasAI) {
      try {
        html = await generateLPWithAI(input);
      } catch (err) {
        console.warn('AI generation failed, using fallback:', err);
        html = await buildFallbackLP(input);
      }
    } else {
      html = await buildFallbackLP(input);
    }

    return NextResponse.json({ html });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
