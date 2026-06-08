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

// ─── Image resolution: site images → Unsplash → Picsum ──────────────────────

const UNSPLASH_KEYWORDS: Record<string, string[]> = {
  beauty: ['beauty salon', 'spa treatment', 'hair salon', 'skincare', 'wellness'],
  medical: ['doctor clinic', 'healthcare', 'medical office', 'hospital', 'health'],
  restaurant: ['restaurant dining', 'fine dining', 'japanese food', 'cafe interior', 'cuisine'],
  fitness: ['gym fitness', 'workout training', 'sports', 'healthy lifestyle', 'exercise'],
  legal: ['law office', 'attorney meeting', 'business professional', 'justice'],
  realestate: ['luxury home interior', 'modern house', 'real estate', 'property'],
  education: ['education learning', 'classroom', 'university study', 'knowledge'],
  it: ['technology office', 'software development', 'digital innovation', 'coding'],
  construction: ['construction architecture', 'modern building', 'engineering'],
  retail: ['retail shop', 'boutique store', 'shopping', 'product display'],
  other: ['business team', 'professional office', 'modern workspace', 'success'],
};

function getUnsplashUrl(keyword: string, w = 1200, h = 700): string {
  // Unsplash Source API — no key required, returns relevant image
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keyword)}`;
}

function resolveImages(input: LPInput): string[] {
  const { tone, industry } = input;
  const siteImgs: string[] = tone.siteImages ?? [];

  // If we have site images, use them (first 5 content images)
  if (siteImgs.length >= 2) {
    // Pad to 5 with Unsplash if needed
    const keywords = UNSPLASH_KEYWORDS[industry ?? 'other'] ?? UNSPLASH_KEYWORDS.other;
    const padded = [...siteImgs];
    for (let i = padded.length; i < 5; i++) {
      padded.push(getUnsplashUrl(keywords[i % keywords.length]));
    }
    return padded.slice(0, 5);
  }

  // No site images → Unsplash with industry keywords
  const keywords = UNSPLASH_KEYWORDS[industry ?? 'other'] ?? UNSPLASH_KEYWORDS.other;
  return keywords.map((kw, i) => getUnsplashUrl(kw, i === 0 ? 1400 : 800, i === 0 ? 800 : 500));
}

function getAvatarUrl(n: number): string {
  return `https://i.pravatar.cc/80?img=${n}`;
}

// ─── AI generation ────────────────────────────────────────────────────────────

async function generateLPWithAI(input: LPInput): Promise<string> {
  const openai = (await import('@/lib/openai')).default;

  const images = resolveImages(input);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(input, images) },
    ],
    max_tokens: 6000,
  });

  let raw = response.choices[0]?.message?.content ?? '';
  raw = raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  if (!raw.startsWith('<!DOCTYPE')) raw = buildFallbackLP(input);
  return raw;
}

const SYSTEM_PROMPT = `あなたは世界最高水準のウェブデザイナー兼コンバージョンコピーライターです。
指定された条件で、実際のプロが作るような完成度の高いランディングページHTMLを生成します。
以下のデザイン原則を必ず守ってください：
- ファーストビューは視覚的に圧倒的インパクト（大きな見出し・美しい背景）
- 提供された画像URLを必ずそのまま使用すること（差し替え・プレースホルダー禁止）
- アバター画像（https://i.pravatar.cc/80?img=N）でリアルな顔写真を使用
- CSSアニメーション（fadeInUp, fadeInLeft等）で洗練された動き
- ブランドカラーを活かした美しいグラデーション
- 余白を大きく取ったプレミアム感のあるレイアウト
- 数字・実績の視覚的な強調
- モバイルファースト完全レスポンシブ`;

function buildPrompt(input: LPInput, images: string[]): string {
  const { tone, businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, cvGoal, cvButtonText, cvUrl, contactEmail } = input;
  const cvLabel = CV_LABELS[cvGoal];
  const cvAction = cvUrl ? `href="${cvUrl}" target="_blank"` : cvGoal === 'tel' ? 'href="tel:"' : 'href="#contact"';
  const heroImage = images[0];
  const sectionImage1 = images[1] ?? images[0];
  const sectionImage2 = images[2] ?? images[0];
  const sp = sellingPoints.filter(Boolean);
  const avatars = [1, 5, 12].map(getAvatarUrl);

  return `以下の仕様で、完全な高品質ランディングページHTMLを生成してください。

## ブランド・デザイン情報
- ビジネス名: ${businessName}
- トンマナ: ${tone.toneLabel}（${tone.styleKeywords.join('・')}）
- プライマリカラー: ${tone.colors.primary}
- セカンダリカラー: ${tone.colors.secondary}
- アクセントカラー: ${tone.colors.accent}
- 背景色: ${tone.colors.background}
- テキスト色: ${tone.colors.text}
- 見出しフォント: ${tone.fonts.headline}
- 本文フォント: ${tone.fonts.body}

## LP情報
- LP目的: ${lpPurpose}
- ターゲット: ${targetAudience}
- 訴求ポイント:
${sp.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}
- キャッチコピーヒント: ${catchphraseHint || '（魅力的に考案してください）'}

## CVゴール
- アクション: ${cvLabel}（${cvButtonText}）
- CTAボタン: ${cvAction}
${contactEmail ? `- 受信メール: ${contactEmail}` : ''}

## 使用する画像URL（必ず使用すること）
- ヒーロー背景: ${heroImage}
- セクション画像1: ${sectionImage1}
- セクション画像2: ${sectionImage2}
- 顔写真1: ${avatars[0]}
- 顔写真2: ${avatars[1]}
- 顔写真3: ${avatars[2]}

## 必須セクション構成（この順番で）

1. **スティッキーヘッダー** — ロゴ左 + ナビ + CTAボタン右。backdrop-blur効果
2. **ヒーローセクション** — 100vhフルスクリーン。background-imageにヒーロー画像 + 暗めオーバーレイ。中央に大きな見出し（font-size: clamp(2.5rem, 6vw, 4.5rem)）・サブコピー・CTAボタン2つ（プライマリ + アウトライン）・スクロール誘導矢印
3. **実績バー** — 3〜4個の数字実績を横並びで。背景はプライマリカラー
4. **課題提起** — ターゲットの悩みを3つ（チェックマーク付き）。右にセクション画像
5. **ソリューション・3つの強み** — アイコン（絵文字）＋訴求ポイントをカードで。ホバーでリフトアップ
6. **実績画像セクション** — セクション画像2を使った画像+テキスト左右レイアウト
7. **お客様の声** — 顔写真3枚。星5つ。引用文。名前・属性。カード形式
8. **FAQ** — 5項目。クリックで開閉（CSS onlyまたはJS）
9. **お問い合わせ / CTAセクション** — アクセントカラー背景。${cvGoal === 'inquiry' || cvGoal === 'download' ? 'お名前・メール・メッセージフォーム' : '大きなCTAボタン'}
10. **フッター** — コピーライト

## 絶対要件
- DOCTYPE htmlから始まる完全なHTMLのみ返す（説明不要）
- <style>に全CSS記述（外部CSS不可）
- CSSカスタムプロパティ使用（:root定義）
- @keyframes fadeInUp, fadeInLeft, scaleIn のアニメーション
- Intersection Observer不要。CSSアニメーションはページロード時に発火
- 画像は必ずobject-fit: coverで美しくトリミング
- ボタンはbox-shadow + transitionでリッチに
- モバイル対応（max-width 768px breakpoint）
- フォームaction="${contactEmail ? `https://formspree.io/f/dummy" data-email="${contactEmail}` : 'https://formspree.io/f/dummy'}"
- スムーズスクロール（scroll-behavior: smooth）
- 合計1000行以上の高品質HTML`;
}

// ─── High-quality fallback HTML ───────────────────────────────────────────────

function buildFallbackLP(input: LPInput): string {
  const { tone, businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, cvGoal, cvButtonText, cvUrl, contactEmail } = input;
  const images = resolveImages(input);
  const heroImg = images[0];
  const sectionImg1 = images[1] ?? images[0];
  const sectionImg2 = images[2] ?? images[0];
  const cvLabel = CV_LABELS[cvGoal];
  const cvAction = cvUrl ? `href="${cvUrl}" target="_blank"` : cvGoal === 'tel' ? 'href="tel:"' : 'href="#contact"';
  const sp = [...sellingPoints.filter(Boolean), '圧倒的な実績と信頼', '充実したアフターサポート', '業界最高水準の品質'].slice(0, 3);
  const catch_ = catchphraseHint || `${businessName}が、あなたの未来を変える`;

  const avatars = [1, 5, 12, 25, 33, 45].map(n => `https://i.pravatar.cc/80?img=${n}`);

  const spIcons = ['✦', '◆', '★'];

  const painPoints = [
    `${targetAudience.split('・')[0] || 'お客様'}の課題を根本から解決`,
    '時間・コスト・品質の三拍子を実現',
    '専門チームが最初から最後まで伴走',
  ];

  const testimonials = [
    { name: '田中 美咲様', role: '30代・会社員', text: `${businessName}に相談してから、毎日の生活がガラリと変わりました。こんなに結果が出るとは思っていなかったので本当に感謝しています。`, img: avatars[0], rating: 5 },
    { name: '鈴木 健太様', role: '40代・経営者', text: '最初は半信半疑でしたが、プロのサポートで確実に成果が出ています。もっと早く相談すれば良かったと思うくらいです。', img: avatars[1], rating: 5 },
    { name: '山田 花子様', role: '20代・フリーランス', text: `他社と比較しましたが、${businessName}の丁寧さと専門性は別格でした。コスパも最高で今後もお願いしたいです。`, img: avatars[2], rating: 5 },
  ];

  const faqs = [
    { q: '初回相談は無料ですか？', a: 'はい、初回のご相談・お見積りは完全無料です。まずはお気軽にお問い合わせください。' },
    { q: `${lpPurpose}に関して何から始めればいいですか？`, a: 'まずはお問い合わせフォームよりご連絡ください。専任スタッフが現状をお伺いし、最適なプランをご提案します。' },
    { q: '対応エリアはどこですか？', a: 'オンラインでの対応も可能ですので、全国どこからでもご相談いただけます。' },
    { q: '契約後にキャンセルはできますか？', a: 'はい、キャンセルポリシーに従って柔軟に対応しております。詳細はお問い合わせください。' },
    { q: '実績や事例を見ることはできますか？', a: 'はい、ご要望に応じて事例集をご共有しております。お問い合わせの際にお申し付けください。' },
  ];

  const formHTML = (cvGoal === 'inquiry' || cvGoal === 'download')
    ? `<form action="https://formspree.io/f/dummy" method="POST" class="contact-form">
        ${contactEmail ? `<input type="hidden" name="_replyto" value="${contactEmail}" />` : ''}
        <div class="form-row">
          <div class="form-group"><label>お名前 <span class="req">*</span></label><input type="text" name="name" placeholder="山田 太郎" required /></div>
          <div class="form-group"><label>メールアドレス <span class="req">*</span></label><input type="email" name="email" placeholder="your@email.com" required /></div>
        </div>
        <div class="form-group"><label>電話番号</label><input type="tel" name="tel" placeholder="090-0000-0000" /></div>
        <div class="form-group"><label>お問い合わせ内容 <span class="req">*</span></label><textarea name="message" rows="5" placeholder="ご質問・ご要望をお気軽にどうぞ" required></textarea></div>
        <button type="submit" class="btn-primary btn-xl">${cvButtonText} →</button>
        <p class="form-note">個人情報は適切に管理し、第三者に提供することはありません。</p>
      </form>`
    : `<div class="cta-big">
        <a ${cvAction} class="btn-primary btn-xl">${cvButtonText} →</a>
        <p class="cta-sub">まずはお気軽にご相談ください。担当者が迅速に対応します。</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${businessName} | ${lpPurpose}</title>
  <meta name="description" content="${businessName}の${lpPurpose}。${targetAudience}に向けたサービスです。" />
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
      color: var(--text); line-height: 1.2; margin-bottom: 16px;
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
      font-weight: 900; color: var(--white); line-height: 1.15;
      margin-bottom: 24px; letter-spacing: -0.02em;
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
    .problem-text strong { display: block; font-weight: 700; margin-bottom: 4px; color: var(--text); }
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
    .feature-card h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 10px; color: var(--text); }
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
    <a href="#testimonials">お客様の声</a>
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
    <p class="hero-sub anim-up delay-2">${targetAudience}に向けた、${businessName}ならではのアプローチ。<br />あなたの悩みを根本から解決します。</p>
    <div class="hero-btns anim-up delay-3">
      <a ${cvAction} class="btn-primary btn-xl">${cvButtonText} →</a>
      <a href="#features" class="btn-outline btn-xl">詳しく見る</a>
    </div>
    <div class="hero-trust anim-up delay-4">
      <span class="hero-trust-item">無料相談受付中</span>
      <span class="hero-trust-item">実績500社以上</span>
      <span class="hero-trust-item">満足度98%</span>
    </div>
  </div>
  <div class="scroll-arrow">↓</div>
</section>

<!-- ── Stats bar ── -->
<section class="stats-bar">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item anim-up delay-1">
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
      </div>
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
        <h2 class="section-title">こんなお悩み、<br />ありませんか？</h2>
        <p class="section-lead">${targetAudience}の多くが抱える課題を、${businessName}は確実に解決します。</p>
        <ul class="problem-list">
          ${painPoints.map((p, i) => `<li class="problem-item anim-up delay-${i + 2}">
            <div class="problem-icon">${['😔', '😟', '😤'][i]}</div>
            <div class="problem-text">
              <strong>${p}</strong>
              <span>一人で悩まず、専門家に相談しましょう</span>
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
      <h2 class="section-title anim-up delay-1">${businessName}が選ばれる<br />3つの理由</h2>
      <p class="section-lead anim-up delay-2" style="margin:0 auto">${targetAudience}のニーズに応え続ける、私たちの強みをご紹介します。</p>
    </div>
    <div class="features-grid">
      ${sp.map((point, i) => `<div class="feature-card anim-up delay-${i + 2}">
        <div class="feature-num">0${i + 1}</div>
        <div class="feature-icon-wrap">${spIcons[i]}</div>
        <h3>${point.split('：')[0] || point.slice(0, 20)}</h3>
        <p>${point.includes('：') ? point.split('：').slice(1).join('：') : point + 'を徹底的に追求し、お客様の期待を超える成果をお届けします。'}</p>
      </div>`).join('')}
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
        <p style="font-size:0.95rem; color:var(--gray-700); line-height:1.9;">私たちは${targetAudience}の課題に真剣に向き合い、一人ひとりに最適なソリューションを提供し続けています。単なる${lpPurpose}に留まらず、長期的な関係を大切にしています。</p>
        <ul>
          ${sp.map(p => `<li>${p.split('：')[0] || p.slice(0, 30)}</li>`).join('')}
          <li>充実したアフターサポート体制</li>
          <li>明確な料金体系・追加費用なし</li>
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
      <h2 class="section-title anim-up delay-1">お客様の声</h2>
      <p class="section-lead anim-up delay-2" style="margin:0 auto">実際にご利用いただいたお客様からの声をご紹介します</p>
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
    <h2 class="section-title anim-up delay-1" style="color:var(--white)">まずは無料で<br />ご相談ください</h2>
    <p class="section-lead anim-up delay-2">${businessName}の専任スタッフが、あなたの状況に合わせて丁寧にご対応します。</p>
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
        html = buildFallbackLP(input);
      }
    } else {
      html = buildFallbackLP(input);
    }

    return NextResponse.json({ html });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
