import { NextRequest, NextResponse } from 'next/server';
import type { ToneAnalysis } from '../analyze-site/route';

export interface LPInput {
  tone: ToneAnalysis;
  // LP詳細
  businessName: string;
  lpPurpose: string;          // キャンペーン告知 / 新商品 / セミナー申込 etc.
  targetAudience: string;     // ターゲット層
  sellingPoints: string[];    // 訴求ポイント (3つ)
  catchphraseHint: string;    // コピーのヒント
  // CV設定
  cvGoal: 'inquiry' | 'purchase' | 'signup' | 'download' | 'line' | 'tel' | 'reservation';
  cvButtonText: string;       // CTAボタン文言
  cvUrl?: string;             // リンク先 URL (任意)
  contactEmail?: string;
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

// ─── AI generation ────────────────────────────────────────────────────────────

async function generateLPWithAI(input: LPInput): Promise<{ html: string }> {
  const openai = (await import('@/lib/openai')).default;

  const prompt = buildLPPrompt(input);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'あなたはプロのウェブデザイナー兼コピーライターです。指定されたトンマナ・目的・CVゴールに完全に沿った、コンバージョン特化のランディングページHTMLを生成します。',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4000,
  });

  let raw = response.choices[0]?.message?.content ?? '';
  // Strip code fences if present
  raw = raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  return { html: raw };
}

function buildLPPrompt(input: LPInput): string {
  const { tone, businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, cvGoal, cvButtonText, cvUrl, contactEmail } = input;

  const cvLabel = CV_LABELS[cvGoal];
  const cvAction = cvUrl
    ? `href="${cvUrl}" target="_blank"`
    : cvGoal === 'inquiry' || cvGoal === 'download'
    ? 'href="#contact"'
    : cvGoal === 'tel'
    ? 'href="tel:"'
    : 'href="#cta"';

  const colorVars = `
    --color-primary: ${tone.colors.primary};
    --color-secondary: ${tone.colors.secondary};
    --color-accent: ${tone.colors.accent};
    --color-bg: ${tone.colors.background};
    --color-text: ${tone.colors.text};
  `.trim();

  const styleDesc = `${tone.toneLabel}（${tone.styleKeywords.join('・')}）`;

  return `以下の仕様に従って、完全なLP（ランディングページ）のHTMLを生成してください。

## デザイン仕様
- トンマナ: ${styleDesc}
- カラーパレット:
  - プライマリ: ${tone.colors.primary}
  - セカンダリ: ${tone.colors.secondary}
  - アクセント: ${tone.colors.accent}
  - 背景: ${tone.colors.background}
  - テキスト: ${tone.colors.text}
- フォント: 見出し「${tone.fonts.headline}」、本文「${tone.fonts.body}」

## LP情報
- ビジネス名: ${businessName}
- LP目的: ${lpPurpose}
- ターゲット: ${targetAudience}
- 訴求ポイント:
${sellingPoints.map((p, i) => `  ${i + 1}. ${p}`).join('\n')}
- コピーのヒント: ${catchphraseHint || '（自由に考案してください）'}

## CVゴール
- 目標アクション: ${cvLabel}
- CTAボタン文言: ${cvButtonText}
${contactEmail ? `- 問い合わせ先: ${contactEmail}` : ''}
${cvUrl ? `- リンク先: ${cvUrl}` : ''}

## 生成ルール
1. DOCTYPE html から始まる完全なHTMLを返す
2. CSSは<style>タグに全てインライン記述（外部ファイル不可）
3. 以下のCSSカスタムプロパティを:rootに定義して使用:
   ${colorVars}
4. セクション構成（コンバージョン最適化LP）:
   - ヘッダー（ロゴ + CTAボタン）
   - ヒーロー（キャッチコピー + サブコピー + CTA）
   - 課題提起（ターゲットの悩み）
   - ソリューション（${businessName}の解決策）
   - 3つの強み（訴求ポイントを活かす）
   - 実績・数字・信頼（ダミーでOK）
   - ${cvGoal === 'inquiry' || cvGoal === 'download' ? 'お問い合わせフォーム（name/email/messageフィールド + 送信ボタン）' : 'CTAセクション（大きなボタン）'}
   - FAQ（3項目）
   - フッター
5. レスポンシブ（モバイルファースト、max-width: 960px）
6. CTAボタンのアクション: ${cvAction}
7. 実績・数字はビジネスに合わせてリアルなダミー数値を使用
8. 日本語コピーは自然で説得力のある文章に
9. フォームは action="https://formspree.io/f/dummy" method="POST" で実装（${contactEmail ? `hidden inputでemail="${contactEmail}"` : 'そのまま'}）
10. アニメーションはCSSのみ（@keyframesでフェードイン等）
11. アクセシビリティ考慮（alt属性、aria-label等）

HTMLのみを返してください。説明文やコードブロック記法は不要です。`;
}

// ─── Fallback HTML ────────────────────────────────────────────────────────────

function buildFallbackLP(input: LPInput): string {
  const { tone, businessName, lpPurpose, sellingPoints, cvButtonText, cvUrl, cvGoal } = input;
  const cvAction = cvUrl ? `href="${cvUrl}" target="_blank"` : 'href="#contact"';
  const cvLabel = CV_LABELS[cvGoal];

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${businessName}</title>
  <style>
    :root {
      --color-primary: ${tone.colors.primary};
      --color-secondary: ${tone.colors.secondary};
      --color-accent: ${tone.colors.accent};
      --color-bg: ${tone.colors.background};
      --color-text: ${tone.colors.text};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "${tone.fonts.body}", sans-serif; background: var(--color-bg); color: var(--color-text); line-height: 1.7; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
    /* Header */
    header { background: var(--color-primary); color: #fff; padding: 16px 0; position: sticky; top: 0; z-index: 100; }
    header .inner { display: flex; align-items: center; justify-content: space-between; max-width: 960px; margin: 0 auto; padding: 0 24px; }
    header .logo { font-size: 1.25rem; font-weight: 700; }
    .btn-cta { display: inline-block; padding: 10px 28px; border-radius: 50px; background: var(--color-accent); color: #fff; font-weight: 700; text-decoration: none; font-size: 0.95rem; transition: opacity 0.2s; }
    .btn-cta:hover { opacity: 0.85; }
    /* Hero */
    .hero { min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); color: #fff; }
    .hero h1 { font-family: "${tone.fonts.headline}", serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; margin-bottom: 20px; line-height: 1.25; }
    .hero p { font-size: 1.1rem; opacity: 0.85; margin-bottom: 36px; max-width: 560px; margin-left: auto; margin-right: auto; }
    .hero .btn-cta { font-size: 1.1rem; padding: 16px 48px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
    /* Sections */
    section { padding: 72px 0; }
    section:nth-child(even) { background: #f9f9f9; }
    .section-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-accent); margin-bottom: 12px; }
    h2 { font-family: "${tone.fonts.headline}", serif; font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 800; margin-bottom: 16px; color: var(--color-primary); }
    .subtitle { font-size: 1rem; opacity: 0.7; margin-bottom: 48px; max-width: 560px; }
    /* Cards */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-top: 40px; }
    .card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); border-top: 4px solid var(--color-accent); }
    .card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; color: var(--color-primary); }
    .card p { font-size: 0.9rem; opacity: 0.75; }
    /* Stats */
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 24px; margin-top: 40px; text-align: center; }
    .stat-num { font-size: 2.5rem; font-weight: 900; color: var(--color-accent); }
    .stat-label { font-size: 0.85rem; opacity: 0.7; margin-top: 4px; }
    /* FAQ */
    .faq-item { border-bottom: 1px solid #eee; padding: 20px 0; }
    .faq-q { font-weight: 700; margin-bottom: 8px; }
    .faq-a { opacity: 0.7; font-size: 0.95rem; }
    /* Contact */
    .form-wrap { background: var(--color-primary); color: #fff; border-radius: 24px; padding: 48px; max-width: 560px; margin: 0 auto; }
    .form-wrap h2 { color: #fff; }
    .form-wrap .subtitle { opacity: 0.7; }
    input, textarea { width: 100%; padding: 12px 16px; margin-bottom: 16px; border-radius: 10px; border: none; font-size: 1rem; background: rgba(255,255,255,0.15); color: #fff; }
    input::placeholder, textarea::placeholder { opacity: 0.5; color: #fff; }
    textarea { height: 120px; resize: vertical; }
    button[type=submit] { width: 100%; padding: 16px; border-radius: 50px; background: var(--color-accent); color: #fff; font-size: 1rem; font-weight: 700; border: none; cursor: pointer; transition: opacity 0.2s; }
    button[type=submit]:hover { opacity: 0.85; }
    /* Footer */
    footer { background: var(--color-primary); color: rgba(255,255,255,0.6); text-align: center; padding: 32px 24px; font-size: 0.85rem; }
    @media (max-width: 600px) {
      .hero { min-height: 60vh; }
      .form-wrap { padding: 32px 20px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="inner">
      <div class="logo">${businessName}</div>
      <a class="${'btn-cta'}" ${cvAction}>${cvButtonText}</a>
    </div>
  </header>
  <section class="hero">
    <div>
      <h1>${tone.catchphraseHint || businessName + 'が、あなたの課題を解決します'}</h1>
      <p>${lpPurpose} — まずはお気軽にご相談ください</p>
      <a class="btn-cta" ${cvAction}>${cvButtonText}</a>
    </div>
  </section>
  <section>
    <div class="container">
      <div class="section-label">FEATURES</div>
      <h2>3つの強み</h2>
      <p class="subtitle">選ばれ続ける理由があります</p>
      <div class="cards">
        ${sellingPoints.map((sp, i) => `
        <div class="card">
          <h3>0${i + 1}. ${sp.split('：')[0] ?? sp}</h3>
          <p>${sp.includes('：') ? sp.split('：')[1] : '詳細はお問い合わせください。'}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>
  <section>
    <div class="container" style="text-align:center">
      <div class="section-label">RESULTS</div>
      <h2>実績・信頼</h2>
      <div class="stats">
        <div><div class="stat-num">500+</div><div class="stat-label">導入実績</div></div>
        <div><div class="stat-num">98%</div><div class="stat-label">顧客満足度</div></div>
        <div><div class="stat-num">10年</div><div class="stat-label">業界経験</div></div>
        <div><div class="stat-num">24h</div><div class="stat-label">サポート対応</div></div>
      </div>
    </div>
  </section>
  <section>
    <div class="container">
      <div class="section-label">FAQ</div>
      <h2>よくある質問</h2>
      <div class="faq-item"><p class="faq-q">Q. 初回相談は無料ですか？</p><p class="faq-a">A. はい、初回のご相談は完全無料です。お気軽にお問い合わせください。</p></div>
      <div class="faq-item"><p class="faq-q">Q. どのくらいで対応してもらえますか？</p><p class="faq-a">A. お問い合わせから24時間以内にご連絡します。</p></div>
      <div class="faq-item"><p class="faq-q">Q. 費用はどのくらいかかりますか？</p><p class="faq-a">A. ご要望に応じて柔軟にご対応します。まずはお見積りをご依頼ください。</p></div>
    </div>
  </section>
  <section id="contact">
    <div class="container">
      <div class="form-wrap">
        <div class="section-label" style="color:var(--color-accent)">${cvLabel}</div>
        <h2>${cvButtonText}</h2>
        <p class="subtitle">まずはお気軽にご連絡ください</p>
        <form action="https://formspree.io/f/dummy" method="POST">
          <input type="text" name="name" placeholder="お名前" required />
          <input type="email" name="email" placeholder="メールアドレス" required />
          <textarea name="message" placeholder="お問い合わせ内容"></textarea>
          <button type="submit">${cvButtonText}</button>
        </form>
      </div>
    </div>
  </section>
  <footer>
    <p>© ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as LPInput;

    if (!input.tone || !input.businessName) {
      return NextResponse.json({ error: 'tone and businessName are required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY ?? '';
    const hasAI = apiKey && !apiKey.startsWith('sk-dummy');

    let html: string;
    if (hasAI) {
      try {
        const result = await generateLPWithAI(input);
        html = result.html;
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
