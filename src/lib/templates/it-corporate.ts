import type { ProjectConfig } from '@/types';
import { generateJsonLd } from './pages/shared';

export const itCorporateTemplate = {
  id: 'it-corporate',
  name: 'IT企業 × コーポレート',
  industry: 'it',
  tone: 'corporate',
  sections: ['hero', 'services', 'works', 'company', 'recruit', 'cta'],
  generateHtml: (config: ProjectConfig, texts: Record<string, unknown>): string => {
    const primary = config.colorPalette?.primary ?? '#0ea5e9';
    const fontFamily = config.fontFamily ?? 'gothic';
    const isSerif = fontFamily === 'serif';

    const googleFontsLink = isSerif
      ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />'
      : '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet" />';
    const bodyFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
    const h1Size = isSerif ? 'clamp(2rem, 4vw, 3.2rem)' : 'clamp(2.2rem, 4.5vw, 3.5rem)';
    const h2Size = isSerif ? 'clamp(1.6rem, 3vw, 2.5rem)' : 'clamp(1.8rem, 3.5vw, 2.8rem)';
    const bodySize = isSerif ? '1.0625rem' : '1rem';
    const bodyLineHeight = isSerif ? '2.0' : '1.8';

    const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

    const heroHeadline = (t.hero?.headline as string) ?? config.businessName;
    const heroSub      = (t.hero?.subheadline as string) ?? 'テクノロジーで、未来を切り拓く。';
    const heroBody     = (t.hero?.body as string) ?? config.businessDescription;
    const heroCta      = (t.hero?.cta as string) ?? 'お問い合わせ';

    const servicesItems = (t.services?.items as Array<Record<string, string>>) ?? [
      { title: 'システム開発', description: '要件定義から保守運用まで、一貫したシステム開発サービスを提供します。', icon: '💻' },
      { title: 'クラウドインフラ', description: 'AWS・GCPを活用したスケーラブルなインフラ設計・構築・運用を行います。', icon: '☁️' },
      { title: 'DXコンサルティング', description: 'ビジネスプロセスのデジタル化を支援し、業務効率化を実現します。', icon: '📊' },
      { title: 'AIソリューション', description: '機械学習・生成AIを活用した課題解決ソリューションを提案します。', icon: '🤖' },
      { title: 'セキュリティ', description: 'ゼロトラストアーキテクチャに基づく包括的なセキュリティ対策を提供。', icon: '🔒' },
      { title: 'モバイル開発', description: 'iOS / Android ネイティブ及びクロスプラットフォームアプリを開発。', icon: '📱' },
    ];

    const worksItems = [
      { icon: '💼', title: '製造業DX', tag: '開発実績', desc: '受発注システムのフルスクラッチ開発。処理速度5倍・コスト30%削減を達成。' },
      { icon: '🏥', title: '医療SaaS', tag: '開発実績', desc: 'クリニック向けEHRシステム。全国150院に導入実績。' },
      { icon: '🛒', title: 'ECプラットフォーム', tag: '開発実績', desc: 'マルチベンダー型ECサイト構築。月間GMV 3億円規模。' },
    ];

    const ctaHeadline = (t.cta?.headline as string) ?? 'プロジェクトのご相談はお気軽に';
    const ctaBody     = (t.cta?.body as string) ?? '貴社の課題をヒアリングし、最適なソリューションをご提案します。まずはお気軽にご相談ください。';
    const ctaCta      = (t.cta?.cta as string) ?? 'お問い合わせはこちら';

    const servicesHtml = servicesItems.map((item, i) => `
      <div class="service-card fade-up" style="animation-delay:${i * 0.08}s">
        <div class="service-icon-wrap" aria-hidden="true">${item.icon ?? '⚙️'}</div>
        <h3 class="service-title">${item.title ?? ''}</h3>
        <p class="service-desc">${item.description ?? ''}</p>
        <a href="#cta" class="service-link" aria-label="${item.title ?? ''}の詳細">詳しく見る →</a>
      </div>`).join('');

    const worksHtml = worksItems.map(({ icon, title, tag, desc }, i) => `
      <div class="work-card fade-up" style="animation-delay:${i * 0.15}s">
        <div class="work-img" aria-hidden="true">${icon}</div>
        <div class="work-body">
          <span class="work-tag">${tag}</span>
          <h3 class="work-title">${title}</h3>
          <p class="work-desc">${desc}</p>
        </div>
      </div>`).join('');

    const jsonLdHtml = generateJsonLd(config, {
      faqItems: [
        { question: '相談・見積もりは無料ですか？', answer: 'はい、初回のご相談・お見積もりは無料です。お気軽にお問い合わせください。' },
        { question: 'どのような規模の企業に対応していますか？', answer: 'スタートアップから大企業まで幅広く対応しています。企業規模に合わせた最適なソリューションをご提案します。' },
        { question: '導入後のサポート体制はどうなっていますか？', answer: '専任の担当者が対応する24時間サポート体制を整えています。定期的なフォローアップも実施します。' },
        { question: 'セキュリティ対策はどのように行っていますか？', answer: '国際標準のセキュリティ規格に準拠したシステムを提供しており、定期的なセキュリティ診断も実施しています。' },
      ],
    });

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.businessName} | ITソリューション</title>
  <meta name="description" content="${config.businessDescription ? config.businessDescription.slice(0, 120) : `${config.businessName}はシステム開発・DX推進・AIソリューションのITコンサルティング企業です。`}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${googleFontsLink}
  ${jsonLdHtml}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --blue: ${primary};
      --blue-dark: #0284c7;
      --navy: #0c1b33;
      --navy-mid: #112244;
      --bg: #f8fafc;
      --white: #ffffff;
      --text: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --section-pad: clamp(5rem, 10vw, 9rem);
      --container: 1100px;
      --gutter: clamp(1.25rem, 5vw, 5rem);
    }
    html { scroll-behavior: smooth; }
    body { font-family: ${bodyFont}; background: var(--bg); color: var(--text); overflow-x: hidden; font-size: ${bodySize}; line-height: ${bodyLineHeight}; }

    /* ── NAV ─────────────────────────────────────────── */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem var(--gutter); display: flex; align-items: center; justify-content: space-between; transition: all 0.4s; }
    nav.scrolled { background: rgba(255,255,255,0.97); backdrop-filter: blur(20px); padding: 0.75rem var(--gutter); box-shadow: 0 1px 30px rgba(0,0,0,0.07); }
    .nav-logo { font-family: 'Inter', sans-serif; font-size: 1.3rem; font-weight: 800; color: var(--navy); text-decoration: none; letter-spacing: -0.03em; }
    .nav-logo span { color: var(--blue); }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { text-decoration: none; color: var(--muted); font-size: 0.83rem; letter-spacing: 0.02em; transition: color 0.3s; font-weight: 500; }
    .nav-links a:hover { color: var(--navy); }
    .nav-cta { display: inline-block; padding: 0.6rem 1.4rem; background: var(--blue); color: #fff; font-size: 0.8rem; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.3s; min-height: 44px; display: inline-flex; align-items: center; }
    .nav-cta:hover { background: var(--blue-dark); transform: translateY(-1px); box-shadow: 0 4px 15px rgba(14,165,233,0.35); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 0.5rem; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--navy); border-radius: 2px; transition: all 0.3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .mobile-menu { display: none; position: fixed; inset: 0; background: #fff; z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
    .mobile-menu.open { display: flex; transform: translateY(0); }
    .mobile-menu a { font-family: 'Inter', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--navy); text-decoration: none; min-height: 44px; display: flex; align-items: center; }

    /* ── HERO ─────────────────────────────────────────── */
    .hero { position: relative; min-height: 100vh; display: flex; align-items: center; background: var(--navy); overflow: hidden; }
    .hero-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px); background-size: 60px 60px; }
    .hero-glow-1 { position: absolute; top: -20%; right: -10%; width: 60%; height: 80%; background: radial-gradient(ellipse at center, rgba(14,165,233,0.13) 0%, transparent 70%); pointer-events: none; }
    .hero-glow-2 { position: absolute; bottom: -10%; left: -10%; width: 50%; height: 60%; background: radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%); pointer-events: none; }
    /* geometric accent */
    .hero-geo { position: absolute; right: 5%; top: 50%; transform: translateY(-50%); width: clamp(280px, 35vw, 480px); display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 16px; pointer-events: none; }
    .geo-cell { border-radius: 16px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; justify-content: flex-end; padding: 1.5rem; transition: background 0.4s; }
    .geo-cell:hover { background: rgba(14,165,233,0.07); border-color: rgba(14,165,233,0.2); }
    .geo-cell-val { font-family: 'Inter', sans-serif; font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1; }
    .geo-cell-val span { color: var(--blue); }
    .geo-cell-lbl { font-size: 0.72rem; color: rgba(255,255,255,0.35); letter-spacing: 0.06em; margin-top: 0.25rem; }
    .geo-cell:nth-child(1) { grid-row: span 2; }
    .geo-cell:nth-child(1) .geo-cell-val { font-size: 3.5rem; }
    .hero-content { position: relative; z-index: 2; max-width: var(--container); margin: 0 auto; padding: 8rem var(--gutter) 5rem; }
    .hero-text { max-width: 560px; }
    .hero-tag { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.9rem; background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); color: var(--blue); font-size: 0.72rem; border-radius: 4px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem; font-weight: 600; opacity: 0; animation: fadeInUp 0.8s 0.3s forwards; }
    .hero-headline { font-family: 'Inter', sans-serif; font-size: ${h1Size}; font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 1.25rem; letter-spacing: -0.03em; opacity: 0; animation: fadeInUp 0.8s 0.5s forwards; }
    .hero-headline .accent { background: linear-gradient(135deg, var(--blue), #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.55); margin-bottom: 1rem; opacity: 0; animation: fadeInUp 0.8s 0.7s forwards; }
    .hero-body { font-size: ${bodySize}; color: rgba(255,255,255,0.45); line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; opacity: 0; animation: fadeInUp 0.8s 0.9s forwards; }
    .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; opacity: 0; animation: fadeInUp 0.8s 1.1s forwards; }
    .btn-hero-primary { display: inline-flex; align-items: center; padding: 0.9rem 2rem; background: var(--blue); color: #fff; font-size: 0.85rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 20px rgba(14,165,233,0.4); min-height: 44px; }
    .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(14,165,233,0.6); }
    .btn-hero-outline { display: inline-flex; align-items: center; padding: 0.9rem 2rem; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); font-size: 0.85rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: all 0.3s; min-height: 44px; }
    .btn-hero-outline:hover { border-color: rgba(255,255,255,0.5); color: #fff; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    /* ── SECTIONS ───────────────────────────────────── */
    section { padding: var(--section-pad) var(--gutter); }
    .section-inner { max-width: var(--container); margin: 0 auto; }
    .section-tag { display: block; font-size: 0.7rem; color: var(--blue); letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 0.75rem; font-weight: 600; }
    .section-tag.center { text-align: center; }
    .section-title { font-family: 'Inter', sans-serif; font-size: ${h2Size}; color: var(--text); font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.03em; }
    .section-title.center { text-align: center; }
    .section-body { color: var(--muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; }
    .section-body.center { text-align: center; max-width: 580px; margin: 0 auto 3rem; }

    /* ── SERVICES ───────────────────────────────────── */
    .services-bg { background: var(--white); }
    .services-header { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; align-items: end; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .service-card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 2rem; transition: all 0.4s; position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 0.75rem; }
    .service-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--blue), #38bdf8); transform: scaleX(0); transition: transform 0.4s; transform-origin: left; }
    .service-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.07); transform: translateY(-4px); border-color: rgba(14,165,233,0.18); }
    .service-card:hover::after { transform: scaleX(1); }
    .service-icon-wrap { font-size: 2rem; line-height: 1; }
    .service-title { font-family: 'Inter', sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--text); }
    .service-desc { color: var(--muted); font-size: 0.84rem; line-height: 1.75; flex: 1; }
    .service-link { font-size: 0.8rem; color: var(--blue); text-decoration: none; font-weight: 600; margin-top: auto; }
    .service-link:hover { text-decoration: underline; }

    /* ── CLIENT LOGOS ───────────────────────────────── */
    .logos-bg { background: var(--bg); padding: 3rem var(--gutter); }
    .logos-inner { max-width: var(--container); margin: 0 auto; }
    .logos-label { text-align: center; font-size: 0.72rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 2rem; }
    .logos-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem 3rem; align-items: center; }
    .logo-item { height: 36px; background: var(--border); border-radius: 6px; padding: 0 1.5rem; display: flex; align-items: center; font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 700; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; min-width: 100px; justify-content: center; }

    /* ── WORKS ──────────────────────────────────────── */
    .works-bg { background: var(--white); }
    .works-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
    .work-card { background: var(--bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); transition: all 0.4s; }
    .work-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.08); transform: translateY(-4px); }
    .work-img { aspect-ratio: 16/9; background: linear-gradient(135deg, var(--navy) 0%, #1e3a5f 100%); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; }
    .work-body { padding: 1.5rem; }
    .work-tag { display: inline-block; padding: 0.2rem 0.7rem; background: rgba(14,165,233,0.08); color: var(--blue); font-size: 0.68rem; border-radius: 4px; margin-bottom: 0.75rem; font-weight: 600; letter-spacing: 0.05em; }
    .work-title { font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
    .work-desc { color: var(--muted); font-size: 0.82rem; line-height: 1.7; }

    /* ── COMPANY ─────────────────────────────────────── */
    .company-bg { background: var(--bg); }
    .company-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
    .company-visual { background: linear-gradient(135deg, var(--navy), #1e3a5f); border-radius: 16px; padding: 3rem; }
    .company-nums { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .cnum { text-align: center; }
    .cnum-val { font-family: 'Inter', sans-serif; font-size: 2.8rem; font-weight: 800; color: #fff; line-height: 1; }
    .cnum-val span { color: var(--blue); }
    .cnum-label { font-size: 0.76rem; color: rgba(255,255,255,0.38); margin-top: 0.4rem; letter-spacing: 0.08em; }

    /* ── RECRUIT ─────────────────────────────────────── */
    .recruit-bg { background: var(--white); }

    /* ── CTA ─────────────────────────────────────────── */
    .cta-bg { background: linear-gradient(135deg, var(--navy) 0%, #0c2a4a 100%); }
    .cta-inner { text-align: center; max-width: 680px; margin: 0 auto; }
    .cta-headline { font-family: 'Inter', sans-serif; font-size: ${h2Size}; font-weight: 800; color: #fff; margin-bottom: 1rem; letter-spacing: -0.03em; }
    .cta-body { color: rgba(255,255,255,0.6); font-size: ${bodySize}; line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; padding: 1rem 3rem; background: var(--blue); color: #fff; font-size: 0.88rem; border-radius: 8px; text-decoration: none; font-weight: 700; transition: all 0.3s; box-shadow: 0 4px 25px rgba(14,165,233,0.4); min-height: 44px; }
    .cta-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 40px rgba(14,165,233,0.6); }

    /* ── SP FIXED CTA ─────────────────────────────────── */
    .sp-cta-bar { display: none; }

    /* ── FOOTER ─────────────────────────────────────── */
    footer { background: #0a1628; padding: 3rem var(--gutter); text-align: center; }
    .footer-logo { font-family: 'Inter', sans-serif; font-size: 1.5rem; font-weight: 800; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem; letter-spacing: -0.03em; }
    .footer-copy { color: rgba(255,255,255,0.22); font-size: 0.72rem; }

    /* ── ANIMATIONS ─────────────────────────────────── */
    .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ─────────────────────────────────── */
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .hero-geo { display: none; }
      .services-header { grid-template-columns: 1fr; }
      .works-grid { grid-template-columns: 1fr; }
      .company-grid { grid-template-columns: 1fr; gap: 2rem; }
      section { padding: 4rem 1.25rem 5rem; }
      .sp-cta-bar {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
        background: rgba(255,255,255,0.97); border-top: 1px solid var(--border);
        padding: 0.75rem 1.25rem; gap: 0.75rem;
      }
      .sp-cta-call { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1rem; border: 1px solid var(--blue); color: var(--blue); font-size: 0.8rem; text-decoration: none; border-radius: 6px; min-height: 44px; }
      .sp-cta-reserve { flex: 2; display: flex; align-items: center; justify-content: center; padding: 0.85rem 1rem; background: var(--blue); color: #fff; font-size: 0.82rem; text-decoration: none; border-radius: 6px; font-weight: 700; min-height: 44px; }
    }
  </style>
</head>
<body>
  <!-- NAV -->
  <nav id="nav" role="navigation" aria-label="メインナビゲーション">
    <a href="#" class="nav-logo" aria-label="${config.businessName} トップ">${config.businessName.slice(0,2)}<span>${config.businessName.slice(2)}</span></a>
    <ul class="nav-links" role="list">
      <li><a href="#services">サービス</a></li>
      <li><a href="#works">実績</a></li>
      <li><a href="#company">会社概要</a></li>
      <li><a href="#recruit">採用</a></li>
    </ul>
    <a href="#cta" class="nav-cta">お問い合わせ</a>
    <button class="hamburger" id="hamburger" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileMenu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="モバイルメニュー">
    <a href="#services" onclick="closeMobileMenu()">サービス</a>
    <a href="#works" onclick="closeMobileMenu()">実績</a>
    <a href="#company" onclick="closeMobileMenu()">会社概要</a>
    <a href="#cta" onclick="closeMobileMenu()">お問い合わせ</a>
  </div>

  <!-- HERO -->
  <section class="hero" id="hero" aria-labelledby="hero-heading">
    <div class="hero-grid-bg" aria-hidden="true"></div>
    <div class="hero-glow-1" aria-hidden="true"></div>
    <div class="hero-glow-2" aria-hidden="true"></div>
    <!-- geometric metrics visual (hidden on SP) -->
    <div class="hero-geo" aria-hidden="true">
      <div class="geo-cell"><div class="geo-cell-val">200<span>+</span></div><div class="geo-cell-lbl">Projects Delivered</div></div>
      <div class="geo-cell"><div class="geo-cell-val">98<span>%</span></div><div class="geo-cell-lbl">Client Satisfaction</div></div>
      <div class="geo-cell"><div class="geo-cell-val">50<span>+</span></div><div class="geo-cell-lbl">Expert Engineers</div></div>
    </div>
    <div class="hero-content">
      <div class="hero-text">
        <span class="hero-tag">IT Solutions</span>
        <h1 class="hero-headline" id="hero-heading">${heroHeadline}<br/><span class="accent">${heroSub}</span></h1>
        <p class="hero-body">${heroBody}</p>
        <div class="hero-btns">
          <a href="#cta" class="btn-hero-primary">${heroCta}</a>
          <a href="#services" class="btn-hero-outline">サービスを見る</a>
        </div>
      </div>
    </div>
  </section>

  <!-- CLIENT LOGOS -->
  <div class="logos-bg" role="complementary" aria-label="導入企業">
    <div class="logos-inner">
      <p class="logos-label">採用実績のある業種</p>
      <div class="logos-grid" aria-hidden="true">
        <div class="logo-item">製造業</div>
        <div class="logo-item">医療・ヘルスケア</div>
        <div class="logo-item">物流・EC</div>
        <div class="logo-item">金融・保険</div>
        <div class="logo-item">教育・EdTech</div>
        <div class="logo-item">小売・流通</div>
      </div>
    </div>
  </div>

  <!-- SERVICES -->
  <section class="services-bg" id="services" aria-labelledby="services-heading">
    <div class="section-inner">
      <div class="services-header">
        <div>
          <span class="section-tag">What We Do</span>
          <h2 class="section-title" id="services-heading">サービス一覧</h2>
        </div>
        <p class="section-body">お客様のビジネス課題に向き合い、テクノロジーの力で解決策を提供します。要件定義から保守運用まで、ワンストップで対応。</p>
      </div>
      <div class="services-grid" role="list">${servicesHtml}</div>
    </div>
  </section>

  <!-- WORKS -->
  <section class="works-bg" id="works" aria-labelledby="works-heading">
    <div class="section-inner">
      <span class="section-tag center">Our Work</span>
      <h2 class="section-title center" id="works-heading">導入実績・開発事例</h2>
      <p class="section-body center">多様な業種のDX推進・システム構築を支援してきた実績をご紹介します。</p>
      <div class="works-grid" role="list">${worksHtml}</div>
    </div>
  </section>

  <!-- COMPANY -->
  <section class="company-bg" id="company" aria-labelledby="company-heading">
    <div class="section-inner">
      <div class="company-grid">
        <div class="company-visual fade-up" aria-hidden="true">
          <div class="company-nums">
            <div class="cnum"><div class="cnum-val">20<span>+</span></div><div class="cnum-label">Years Experience</div></div>
            <div class="cnum"><div class="cnum-val">200<span>+</span></div><div class="cnum-label">Projects</div></div>
            <div class="cnum"><div class="cnum-val">50<span>+</span></div><div class="cnum-label">Engineers</div></div>
            <div class="cnum"><div class="cnum-val">98<span>%</span></div><div class="cnum-label">Satisfaction</div></div>
          </div>
        </div>
        <div class="company-text fade-up">
          <span class="section-tag">Company</span>
          <h2 class="section-title" id="company-heading">会社概要・私たちについて</h2>
          <p class="section-body">${config.businessDescription}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- RECRUIT -->
  <section class="recruit-bg" id="recruit" aria-labelledby="recruit-heading">
    <div class="section-inner">
      <span class="section-tag">Join Us</span>
      <h2 class="section-title" id="recruit-heading">採用情報</h2>
      <p class="section-body" style="max-width:600px;margin-bottom:2.5rem">テクノロジーで世界を変えたい仲間を募集しています。あなたのアイデアと情熱を活かせる環境があります。リモートワーク可・フレックス制。</p>
      <a href="#cta" style="display:inline-flex;align-items:center;min-height:44px;padding:0.85rem 2.5rem;border:2px solid var(--blue);color:var(--blue);font-size:0.85rem;border-radius:8px;text-decoration:none;font-weight:700;transition:all 0.3s;background:transparent" onmouseover="this.style.background='var(--blue)';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='var(--blue)'">採用ページを見る</a>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-bg" id="cta" aria-labelledby="cta-heading">
    <div class="cta-inner fade-up">
      <h2 class="cta-headline" id="cta-heading">${ctaHeadline}</h2>
      <p class="cta-body">${ctaBody}</p>
      <a href="mailto:info@example.com" class="cta-btn">${ctaCta}</a>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>

  <!-- SP FIXED CTA -->
  <div class="sp-cta-bar" aria-label="スマートフォン用CTA">
    <a href="tel:03-0000-0000" class="sp-cta-call">📞 電話</a>
    <a href="#cta" class="sp-cta-reserve">お問い合わせ</a>
  </div>

  <script defer>
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50), { passive: true });

    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  </script>
</body>
</html>`;
  },
};
