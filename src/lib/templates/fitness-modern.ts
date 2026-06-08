import type { ProjectConfig } from '@/types';
import { generateJsonLd } from './pages/shared';

export const fitnessModernTemplate = {
  id: 'fitness-modern',
  name: 'フィットネス × モダン',
  industry: 'fitness',
  tone: 'modern',
  sections: ['hero', 'programs', 'trainers', 'facilities', 'pricing', 'cta'],
  generateHtml: (config: ProjectConfig, texts: Record<string, unknown>): string => {
    const primary = config.colorPalette?.primary ?? '#6366f1';
    const fontFamily = config.fontFamily ?? 'gothic';
    const isSerif = fontFamily === 'serif';

    const googleFontsLink = isSerif
      ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Barlow+Condensed:wght@400;600;700;900&display=swap" rel="stylesheet" />'
      : '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700;900&family=Barlow+Condensed:wght@400;600;700;900&display=swap" rel="stylesheet" />';
    const bodyFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
    const h1Size = isSerif ? 'clamp(3rem, 8vw, 6.5rem)' : 'clamp(3.5rem, 9vw, 7.5rem)';
    const h2Size = isSerif ? 'clamp(2.2rem, 4.5vw, 3.5rem)' : 'clamp(2.5rem, 5vw, 4rem)';
    const bodySize = isSerif ? '1.0625rem' : '1rem';
    const bodyLineHeight = isSerif ? '2.0' : '1.8';

    const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

    const heroHeadline = (t.hero?.headline as string) ?? config.businessName;
    const heroSub      = (t.hero?.subheadline as string) ?? '限界を超えろ。';
    const heroBody     = (t.hero?.body as string) ?? config.businessDescription;
    const heroCta      = (t.hero?.cta as string) ?? '無料体験を申し込む';

    const programItems = (t.programs?.items as Array<Record<string, string>>) ?? [
      { title: 'HIIT', description: '短時間で最大効果。高強度インターバルトレーニング。週2〜3回推奨。', icon: '⚡' },
      { title: 'ウェイトトレーニング', description: '科学的アプローチで筋肉を効率よく構築。初心者〜上級者対応。', icon: '🏋️' },
      { title: 'ヨガ＆ストレッチ', description: 'カラダとメンタルの両方を整える回復プログラム。全レベル歓迎。', icon: '🧘' },
      { title: 'パーソナルトレーニング', description: 'あなた専用のプログラムで確実な結果を。担当制で継続サポート。', icon: '👤' },
    ];

    const pricingItems = (t.pricing?.items as Array<Record<string, string>>) ?? [
      { title: 'ライト', price: '¥5,500', period: '/月', description: '月10回まで利用可能', features: 'グループレッスン参加可|ロッカー利用可|フリーウェイト使用可', recommended: '' },
      { title: 'スタンダード', price: '¥9,900', period: '/月', description: '一番人気のプラン', features: '月無制限利用|パーソナル月1回付き|全施設利用可|栄養カウンセリング付き', recommended: 'true' },
      { title: 'プレミアム', price: '¥19,800', period: '/月', description: 'プロを目指す本格プラン', features: '月無制限利用|パーソナル週1回|専属トレーナー付き|食事管理サポート', recommended: '' },
    ];

    const accessTel = (t.access?.tel as string) ?? '03-0000-0000';

    const ctaHeadline = (t.cta?.headline as string) ?? '無料体験受付中';
    const ctaBody     = (t.cta?.body as string) ?? '今すぐ体験を申し込んで、新しい自分に出会おう。入会前に雰囲気を確かめられます。';
    const ctaCta      = (t.cta?.cta as string) ?? '無料体験を予約する';

    const programsHtml = programItems.map((item, i) => `
      <div class="program-card fade-up" style="animation-delay:${i * 0.1}s">
        <div class="program-icon" aria-hidden="true">${item.icon ?? ['⚡','🏋️','🧘','👤'][i % 4]}</div>
        <h3 class="program-title">${item.title ?? ''}</h3>
        <p class="program-desc">${item.description ?? ''}</p>
      </div>`).join('');

    const pricingHtml = pricingItems.map((item, i) => {
      const features = (item.features ?? '').split('|').filter(Boolean);
      const isRec = item.recommended === 'true' || i === 1;
      return `
      <div class="price-card fade-up ${isRec ? 'featured' : ''}" style="animation-delay:${i * 0.15}s">
        ${isRec ? '<div class="price-badge">人気 No.1</div>' : ''}
        <div class="price-header">
          <h3 class="price-name">${item.title ?? ''}</h3>
          <p class="price-desc-small">${item.description ?? ''}</p>
        </div>
        <div class="price-amount">${item.price ?? ''}<span>${item.period ?? '/月'}</span></div>
        <ul class="price-features" role="list">
          ${features.map(f => `<li class="price-feature-item"><span class="price-check" aria-hidden="true">✓</span>${f}</li>`).join('')}
        </ul>
        <a href="#cta" class="price-btn ${isRec ? 'primary' : ''}">このプランを選ぶ</a>
      </div>`;
    }).join('');

    const jsonLdHtml = generateJsonLd(config, {
      faqItems: [
        { question: '入会金はかかりますか？', answer: '期間限定キャンペーン中は入会金無料です。通常入会金は¥11,000（税込）となります。' },
        { question: '初心者でも大丈夫ですか？', answer: 'もちろんです。入会時に体力測定・フィットネス目標の確認を行い、初心者の方でも安心して続けられるプログラムをご提案します。' },
        { question: '無料体験はありますか？', answer: 'はい、初回無料体験を実施しています。事前予約制ですので、お電話またはウェブからお申し込みください。' },
        { question: '月途中での入会はできますか？', answer: '毎月1日・15日に入会受付を行っております。月途中でのご入会も日割り計算でご対応します。' },
      ],
    });

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.businessName} | フィットネスジム</title>
  <meta name="description" content="${config.businessDescription ? config.businessDescription.slice(0, 120) : `${config.businessName}。最新設備と専属トレーナーで、あなたの目標達成をサポート。無料体験受付中。`}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${googleFontsLink}
  ${jsonLdHtml}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: ${primary};
      --primary-dark: #4f46e5;
      --neon: #a5b4fc;
      --bg: #080b14;
      --dark: #0f1220;
      --mid: #161927;
      --text: #e2e8f0;
      --muted: #64748b;
      --section-pad: clamp(5rem, 10vw, 9rem);
      --container: 1100px;
      --gutter: clamp(1.25rem, 5vw, 5rem);
    }
    html { scroll-behavior: smooth; }
    body { font-family: ${bodyFont}; background: var(--bg); color: var(--text); overflow-x: hidden; font-size: ${bodySize}; line-height: ${bodyLineHeight}; }

    /* ── NAV ─────────────────────────────────────────── */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem var(--gutter); display: flex; align-items: center; justify-content: space-between; transition: all 0.4s; }
    nav.scrolled { background: rgba(8,11,20,0.96); backdrop-filter: blur(20px); padding: 0.75rem var(--gutter); border-bottom: 1px solid rgba(99,102,241,0.18); }
    .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 900; letter-spacing: 0.1em; color: #fff; text-decoration: none; text-transform: uppercase; }
    .nav-logo span { color: var(--primary); }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { text-decoration: none; color: var(--muted); font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.3s; font-weight: 500; }
    .nav-links a:hover { color: #fff; }
    .nav-cta { display: inline-block; padding: 0.6rem 1.5rem; background: var(--primary); color: #fff; font-size: 0.78rem; border-radius: 6px; text-decoration: none; letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase; transition: all 0.3s; }
    .nav-cta:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 0.5rem; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; }
    .hamburger span { display: block; width: 22px; height: 2px; background: #fff; transition: all 0.3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .mobile-menu { display: none; position: fixed; inset: 0; background: var(--bg); z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
    .mobile-menu.open { display: flex; transform: translateY(0); }
    .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 2.5rem; font-weight: 700; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; min-height: 44px; display: flex; align-items: center; }

    /* ── HERO ─────────────────────────────────────────── */
    .hero { position: relative; height: 100vh; min-height: 700px; display: flex; align-items: center; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&h=1200&q=85&fit=crop'); background-size: cover; background-position: center; filter: brightness(0.28); }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, transparent 50%, rgba(8,11,20,0.8) 100%); }
    .hero-content { position: relative; z-index: 2; max-width: 750px; padding: 2rem 2rem 2rem 6vw; }
    .hero-tag { display: inline-block; padding: 0.3rem 1rem; border: 1px solid var(--primary); color: var(--neon); font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 1.5rem; font-weight: 500; opacity: 0; animation: fadeInUp 0.8s 0.3s forwards; }
    .hero-headline { font-family: 'Barlow Condensed', sans-serif; font-size: ${h1Size}; font-weight: 900; color: #fff; line-height: 0.95; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 1rem; opacity: 0; animation: fadeInUp 0.8s 0.5s forwards; }
    .hero-sub { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(1.2rem, 3vw, 2rem); font-weight: 400; color: var(--neon); margin-bottom: 1.5rem; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0; animation: fadeInUp 0.8s 0.7s forwards; }
    .hero-body { font-size: ${bodySize}; color: rgba(226,232,240,0.65); line-height: ${bodyLineHeight}; max-width: 500px; margin-bottom: 2.5rem; opacity: 0; animation: fadeInUp 0.8s 0.9s forwards; }
    .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; opacity: 0; animation: fadeInUp 0.8s 1.1s forwards; }
    .btn-primary { display: inline-block; padding: 1rem 2.5rem; background: var(--primary); color: #fff; font-size: 0.85rem; border-radius: 6px; text-decoration: none; letter-spacing: 0.1em; font-weight: 700; text-transform: uppercase; transition: all 0.3s; box-shadow: 0 4px 25px rgba(99,102,241,0.5); min-height: 44px; display: inline-flex; align-items: center; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(99,102,241,0.7); }
    .btn-outline { display: inline-flex; align-items: center; padding: 1rem 2.5rem; border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.8); font-size: 0.85rem; border-radius: 6px; text-decoration: none; letter-spacing: 0.1em; font-weight: 600; text-transform: uppercase; transition: all 0.3s; min-height: 44px; }
    .btn-outline:hover { border-color: rgba(255,255,255,0.7); color: #fff; }
    .hero-stats { display: flex; gap: 3rem; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.07); opacity: 0; animation: fadeInUp 0.8s 1.3s forwards; }
    .stat-item { }
    .stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 2.8rem; font-weight: 900; color: #fff; line-height: 1; }
    .stat-num[data-count] { color: #fff; }
    .stat-label { font-size: 0.72rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.25rem; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    /* ── SECTIONS ───────────────────────────────────── */
    section { padding: var(--section-pad) var(--gutter); }
    .section-inner { max-width: var(--container); margin: 0 auto; }
    .section-tag { display: block; text-align: center; font-size: 0.68rem; color: var(--primary); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 0.75rem; font-weight: 600; }
    .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: ${h2Size}; text-align: center; color: #fff; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
    .section-body { text-align: center; color: var(--muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; max-width: 560px; margin: 0 auto 3rem; }

    /* ── PROGRAMS ───────────────────────────────────── */
    .programs-bg { background: var(--dark); }
    .programs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
    .program-card { padding: 2.25rem; background: var(--mid); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; transition: all 0.4s; position: relative; overflow: hidden; }
    .program-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--primary), transparent); transform: scaleX(0); transition: transform 0.4s; transform-origin: left; }
    .program-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-4px); }
    .program-card:hover::before { transform: scaleX(1); }
    .program-icon { font-size: 2.2rem; margin-bottom: 1rem; }
    .program-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .program-desc { color: var(--muted); font-size: 0.84rem; line-height: 1.75; }

    /* ── TRAINERS ───────────────────────────────────── */
    .trainers-bg { background: var(--bg); }
    .trainers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .trainer-card { background: var(--dark); border-radius: 12px; overflow: hidden; transition: all 0.4s; }
    .trainer-card:hover { transform: translateY(-4px); }
    .trainer-img { aspect-ratio: 3/4; overflow: hidden; position: relative; }
    .trainer-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .trainer-card:hover .trainer-img img { transform: scale(1.05); }
    .trainer-img::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to top, var(--dark), transparent); }
    .trainer-body { padding: 1.5rem; }
    .trainer-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
    .trainer-role { font-size: 0.72rem; color: var(--primary); letter-spacing: 0.1em; text-transform: uppercase; margin: 0.25rem 0 0.75rem; }
    .trainer-desc { color: var(--muted); font-size: 0.83rem; line-height: 1.7; }

    /* ── FACILITIES ─────────────────────────────────── */
    .facilities-bg { background: var(--dark); }
    .facilities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 3rem; }
    .facility-item { overflow: hidden; border-radius: 8px; position: relative; }
    .facility-item:first-child { grid-column: span 2; }
    .facility-item img { width: 100%; height: 100%; object-fit: cover; aspect-ratio: 4/3; transition: transform 0.5s; filter: brightness(0.75); display: block; }
    .facility-item:first-child img { aspect-ratio: 16/9; }
    .facility-item:hover img { transform: scale(1.05); filter: brightness(0.95); }

    /* ── PRICING ─────────────────────────────────────── */
    .pricing-bg { background: var(--bg); }
    .pricing-intro { margin-bottom: 3rem; }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; align-items: stretch; }
    .price-card { background: var(--dark); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 2.5rem; text-align: center; position: relative; transition: all 0.4s; display: flex; flex-direction: column; }
    .price-card:hover { border-color: rgba(99,102,241,0.25); transform: translateY(-4px); }
    .price-card.featured { background: linear-gradient(150deg, rgba(99,102,241,0.18), var(--dark)); border-color: var(--primary); transform: scale(1.03); }
    .price-card.featured:hover { transform: scale(1.03) translateY(-4px); }
    .price-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; font-size: 0.68rem; padding: 0.3rem 1.1rem; border-radius: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
    .price-header { margin-bottom: 1.5rem; }
    .price-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.3rem; }
    .price-desc-small { font-size: 0.78rem; color: var(--muted); }
    .price-amount { font-family: 'Barlow Condensed', sans-serif; font-size: 3.2rem; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 2rem; }
    .price-amount span { font-size: 1rem; color: var(--muted); font-weight: 400; }
    .price-features { list-style: none; text-align: left; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; }
    .price-feature-item { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.83rem; color: var(--muted); line-height: 1.5; }
    .price-check { color: var(--primary); font-weight: 700; flex-shrink: 0; }
    .price-btn { display: block; padding: 0.85rem 2rem; border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.7); font-size: 0.82rem; border-radius: 8px; text-decoration: none; letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase; transition: all 0.3s; min-height: 44px; display: flex; align-items: center; justify-content: center; }
    .price-btn:hover { border-color: rgba(255,255,255,0.45); color: #fff; }
    .price-btn.primary { background: var(--primary); border-color: var(--primary); color: #fff; }
    .price-btn.primary:hover { background: var(--primary-dark); }

    /* ── CTA ─────────────────────────────────────────── */
    .cta-bg { background: linear-gradient(135deg, var(--primary-dark) 0%, #7c3aed 100%); }
    .cta-inner { text-align: center; max-width: 680px; margin: 0 auto; }
    .cta-headline { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(3rem, 6vw, 5rem); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
    .cta-body { color: rgba(255,255,255,0.8); font-size: ${bodySize}; line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; padding: 1.1rem 3.5rem; background: #fff; color: var(--primary-dark); font-size: 0.85rem; border-radius: 8px; text-decoration: none; letter-spacing: 0.1em; font-weight: 800; text-transform: uppercase; transition: all 0.3s; box-shadow: 0 4px 30px rgba(0,0,0,0.3); min-height: 44px; }
    .cta-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 40px rgba(0,0,0,0.4); }

    /* ── SP FIXED CTA ─────────────────────────────────── */
    .sp-cta-bar { display: none; }

    /* ── FOOTER ─────────────────────────────────────── */
    footer { background: var(--bg); border-top: 1px solid rgba(255,255,255,0.05); padding: 3rem var(--gutter); text-align: center; }
    .footer-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
    .footer-copy { color: var(--muted); font-size: 0.72rem; letter-spacing: 0.08em; }

    /* ── ANIMATIONS ─────────────────────────────────── */
    .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ─────────────────────────────────── */
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .facilities-grid { grid-template-columns: 1fr 1fr; }
      .facility-item:first-child { grid-column: auto; }
      .price-card.featured { transform: scale(1); }
      .hero-content { padding: 2rem 1.5rem; }
      .hero-stats { gap: 1.5rem; }
      section { padding: 4rem 1.25rem 5rem; }
      .sp-cta-bar {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
        background: rgba(8,11,20,0.97); border-top: 1px solid rgba(99,102,241,0.2);
        padding: 0.75rem 1.25rem; gap: 0.75rem;
      }
      .sp-cta-call { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1rem; border: 1px solid var(--primary); color: var(--neon); font-size: 0.8rem; text-decoration: none; border-radius: 6px; min-height: 44px; }
      .sp-cta-reserve { flex: 2; display: flex; align-items: center; justify-content: center; padding: 0.85rem 1rem; background: var(--primary); color: #fff; font-size: 0.82rem; text-decoration: none; border-radius: 6px; font-weight: 700; min-height: 44px; text-transform: uppercase; letter-spacing: 0.08em; }
    }
  </style>
</head>
<body>
  <!-- NAV -->
  <nav id="nav" role="navigation" aria-label="メインナビゲーション">
    <a href="#" class="nav-logo" aria-label="${config.businessName} トップ">${config.businessName.slice(0,1)}<span>${config.businessName.slice(1)}</span></a>
    <ul class="nav-links" role="list">
      <li><a href="#programs">Programs</a></li>
      <li><a href="#trainers">Trainers</a></li>
      <li><a href="#pricing">Pricing</a></li>
    </ul>
    <a href="#cta" class="nav-cta">Free Trial</a>
    <button class="hamburger" id="hamburger" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileMenu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="モバイルメニュー">
    <a href="#programs" onclick="closeMobileMenu()">Programs</a>
    <a href="#trainers" onclick="closeMobileMenu()">Trainers</a>
    <a href="#pricing" onclick="closeMobileMenu()">Pricing</a>
    <a href="#cta" onclick="closeMobileMenu()">Free Trial</a>
  </div>

  <!-- HERO -->
  <section class="hero" id="hero" aria-labelledby="hero-heading">
    <div class="hero-bg" role="img" aria-hidden="true"></div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <span class="hero-tag">Fitness Gym</span>
      <h1 class="hero-headline" id="hero-heading">${heroHeadline}</h1>
      <p class="hero-sub">${heroSub}</p>
      <p class="hero-body">${heroBody}</p>
      <div class="hero-btns">
        <a href="#cta" class="btn-primary">${heroCta}</a>
        <a href="#programs" class="btn-outline">プログラムを見る</a>
      </div>
      <div class="hero-stats" role="list" aria-label="実績数値">
        <div class="stat-item" role="listitem"><div class="stat-num" data-count="500" aria-label="会員数500名以上">0+</div><div class="stat-label">Members</div></div>
        <div class="stat-item" role="listitem"><div class="stat-num" data-count="20" aria-label="プログラム20種類以上">0+</div><div class="stat-label">Programs</div></div>
        <div class="stat-item" role="listitem"><div class="stat-num" data-count="10" aria-label="トレーナー10名以上">0+</div><div class="stat-label">Trainers</div></div>
      </div>
    </div>
  </section>

  <!-- PROGRAMS -->
  <section class="programs-bg" id="programs" aria-labelledby="programs-heading">
    <div class="section-inner">
      <span class="section-tag">What We Offer</span>
      <h2 class="section-title" id="programs-heading">プログラム</h2>
      <p class="section-body">あなたの目標に合わせた多彩なトレーニングプログラムをご用意しています。</p>
      <div class="programs-grid">${programsHtml}</div>
    </div>
  </section>

  <!-- TRAINERS -->
  <section class="trainers-bg" id="trainers" aria-labelledby="trainers-heading">
    <div class="section-inner">
      <span class="section-tag">Our Experts</span>
      <h2 class="section-title" id="trainers-heading">トレーナー紹介</h2>
      <p class="section-body">国内外で実績を積んだプロのトレーナーが、あなたのゴールまでサポートします。</p>
      <div class="trainers-grid">
        ${[
          ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=800&q=80&fit=crop', 'Head Trainer', 'ウェイトトレーニング歴15年。国内大会で数々の実績を持つ。'],
          ['https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&h=800&q=80&fit=crop', 'HIIT Specialist', 'HIIT・有酸素トレーニングの専門家。短期間での体型変化を得意とする。'],
          ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&q=80&fit=crop', 'Yoga & Recovery', 'ヨガインストラクター資格保有。怪我予防と回復をサポート。'],
        ].map(([img, role, desc], i) => `
        <div class="trainer-card fade-up" style="animation-delay:${i * 0.15}s">
          <div class="trainer-img"><img src="${img}" alt="トレーナー ${i + 1}" width="600" height="800" loading="lazy" /></div>
          <div class="trainer-body">
            <div class="trainer-name">Trainer ${i + 1}</div>
            <div class="trainer-role">${role}</div>
            <p class="trainer-desc">${desc}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- FACILITIES -->
  <section class="facilities-bg" id="facilities" aria-labelledby="facilities-heading">
    <div class="section-inner">
      <span class="section-tag">Our Space</span>
      <h2 class="section-title" id="facilities-heading">施設紹介</h2>
      <p class="section-body">最新マシンを揃えた広々としたトレーニングスペース。快適な環境で集中してトレーニング。</p>
      <div class="facilities-grid fade-up">
        <div class="facility-item"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=506&q=80&fit=crop" alt="メインフロア" width="900" height="506" loading="lazy" /></div>
        <div class="facility-item"><img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=450&q=80&fit=crop" alt="ウェイトエリア" width="600" height="450" loading="lazy" /></div>
        <div class="facility-item"><img src="https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=450&q=80&fit=crop" alt="カーディオエリア" width="600" height="450" loading="lazy" /></div>
        <div class="facility-item"><img src="https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=450&q=80&fit=crop" alt="ヨガルーム" width="600" height="450" loading="lazy" /></div>
        <div class="facility-item"><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&q=80&fit=crop" alt="ロッカールーム" width="600" height="450" loading="lazy" /></div>
      </div>
    </div>
  </section>

  <!-- PRICING -->
  <section class="pricing-bg" id="pricing" aria-labelledby="pricing-heading">
    <div class="section-inner">
      <span class="section-tag">Choose Your Plan</span>
      <h2 class="section-title" id="pricing-heading">料金プランの比較</h2>
      <p class="section-body pricing-intro">目的・ライフスタイルに合ったプランをお選びください。いつでもプラン変更可能です。</p>
      <div class="pricing-grid" role="list" aria-label="料金プラン比較">${pricingHtml}</div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-bg" id="cta" aria-labelledby="cta-heading">
    <div class="cta-inner fade-up">
      <h2 class="cta-headline" id="cta-heading">${ctaHeadline}</h2>
      <p class="cta-body">${ctaBody}</p>
      <a href="tel:${accessTel}" class="cta-btn">${ctaCta}</a>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>

  <!-- SP FIXED CTA -->
  <div class="sp-cta-bar" aria-label="スマートフォン用CTA">
    <a href="tel:${accessTel}" class="sp-cta-call">📞 電話</a>
    <a href="#cta" class="sp-cta-reserve">無料体験を申込む</a>
  </div>

  <script defer>
    // Scroll nav
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50), { passive: true });

    // Hamburger
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

    // CountUp animation
    function countUp(el) {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.textContent.includes('%') ? '%' : '+';
      let current = 0;
      const duration = 1800;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 16);
    }
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('[data-count]').forEach(el => countUp(el));
          statObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) statObserver.observe(statsSection);

    // IntersectionObserver fade-up
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  </script>
</body>
</html>`;
  },
};
