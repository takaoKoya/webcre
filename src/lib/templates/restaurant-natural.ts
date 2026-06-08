import type { ProjectConfig } from '@/types';
import { generateJsonLd } from './pages/shared';

export const restaurantNaturalTemplate = {
  id: 'restaurant-natural',
  name: '飲食店 × ナチュラル',
  industry: 'restaurant',
  tone: 'natural',
  sections: ['hero', 'concept', 'menu', 'chef', 'access', 'cta'],
  generateHtml: (config: ProjectConfig, texts: Record<string, unknown>): string => {
    const primary = config.colorPalette?.primary ?? '#22c55e';
    const fontFamily = config.fontFamily ?? 'serif';
    const isSerif = fontFamily === 'serif';

    const googleFontsLink = isSerif
      ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />'
      : '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />';
    const bodyFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
    const h1Size = isSerif ? 'clamp(2.4rem, 5.5vw, 4.5rem)' : 'clamp(2.8rem, 6vw, 5rem)';
    const h2Size = isSerif ? 'clamp(1.6rem, 3.2vw, 2.4rem)' : 'clamp(1.8rem, 3.5vw, 2.8rem)';
    const bodySize = isSerif ? '1.0625rem' : '1rem';
    const bodyLineHeight = isSerif ? '2.0' : '1.8';

    const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

    const heroHeadline = (t.hero?.headline as string) ?? config.businessName;
    const heroSub      = (t.hero?.subheadline as string) ?? '大地の恵みを、丁寧に。';
    const heroBody     = (t.hero?.body as string) ?? config.businessDescription;
    const heroCta      = (t.hero?.cta as string) ?? 'ご予約はこちら';

    const conceptHeadline = (t.concept?.headline as string) ?? 'こだわりのコンセプト';
    const conceptBody     = (t.concept?.body as string) ?? '地元の農家と直接契約した新鮮な食材を使い、シェフが丁寧に一品一品を仕上げます。素材本来の味を活かした、体にやさしい料理をお楽しみください。';

    // タブ別メニューアイテム
    const lunchItems = (t.menu?.lunchItems as Array<Record<string, string>>) ?? [
      { title: 'ランチコース A', price: '¥1,650', description: '旬の野菜スープ・メイン・ライスのシンプルセット。' },
      { title: 'ランチコース B', price: '¥2,200', description: '前菜・メイン・デザート・ドリンク付きの充実ランチ。' },
      { title: '野菜プレート', price: '¥1,430', description: '10種類以上の野菜を使ったカラフルなプレート。' },
      { title: 'パスタランチ', price: '¥1,320', description: '毎日変わる日替わりパスタ。スープ付き。' },
    ];
    const dinnerItems = (t.menu?.dinnerItems as Array<Record<string, string>>) ?? [
      { title: 'ディナーコース', price: '¥5,500〜', description: 'シェフ渾身の全5品コース。季節の食材を最大限に活かします。' },
      { title: 'ペアリングコース', price: '¥8,800〜', description: 'ナチュラルワインとのペアリング付き7品コース。' },
      { title: 'アラカルト', price: '¥770〜', description: '好みの一品を自由に組み合わせ。シェアにもおすすめ。' },
      { title: 'シェフズスペシャル', price: '¥3,300', description: '今日の厳選食材を使ったシェフのスペシャルプレート。' },
    ];
    const drinkItems = (t.menu?.drinkItems as Array<Record<string, string>>) ?? [
      { title: 'ナチュラルワイン', price: '¥770〜', description: '自然農法で作られたナチュラルワインを常時20種ご用意。' },
      { title: 'クラフトビール', price: '¥660〜', description: '地元醸造所とのコラボ限定クラフトビール。' },
      { title: 'ハーブウォーター', price: '¥385', description: '庭で育てたフレッシュハーブのミネラルウォーター。' },
      { title: 'オーガニックジュース', price: '¥550', description: '旬のフルーツを使った搾りたてフレッシュジュース。' },
    ];

    const accessAddress = (t.access?.address as string) ?? '東京都世田谷区〇〇2-3-4';
    const accessHours   = (t.access?.hours as string) ?? 'ランチ 11:30〜14:00 / ディナー 17:30〜22:00（月曜定休）';
    const accessTel     = (t.access?.tel as string) ?? '03-0000-0000';

    const ctaHeadline = (t.cta?.headline as string) ?? 'ご予約・お問い合わせ';
    const ctaBody     = (t.cta?.body as string) ?? '大切な方との食事、記念日のお祝いに。スタッフ一同、心よりお待ちしております。';
    const ctaCta      = (t.cta?.cta as string) ?? '今すぐ予約する';

    const renderMenuItems = (items: Array<Record<string, string>>) =>
      items.map((item, i) => `
        <div class="menu-row fade-up" style="animation-delay:${i * 0.1}s">
          <div class="menu-row-info">
            <h3 class="menu-row-title">${item.title ?? ''}</h3>
            <p class="menu-row-desc">${item.description ?? ''}</p>
          </div>
          <span class="menu-row-price">${item.price ?? ''}</span>
        </div>`).join('');

    const jsonLdHtml = generateJsonLd(config, {
      faqItems: [
        { question: '予約は必要ですか？', answer: 'ランチはご予約なしでもご利用いただけますが、ディナーは事前のご予約をお勧めします。お電話またはウェブからご予約いただけます。' },
        { question: 'アレルギー対応はしていますか？', answer: 'はい、食物アレルギーのあるお客様にも対応しております。ご来店前にお問い合わせいただければ、対応メニューをご案内します。' },
        { question: '子供連れでも利用できますか？', answer: 'もちろんです。お子様メニューもご用意しており、ファミリーでのお食事も大歓迎です。' },
        { question: '駐車場はありますか？', answer: '店舗近くに提携駐車場がございます。詳しくはお電話でお問い合わせください。' },
      ],
    });

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.businessName} | レストラン</title>
  <meta name="description" content="${config.businessDescription ? config.businessDescription.slice(0, 120) : `${config.businessName}。地元食材にこだわったナチュラルな料理をお楽しみください。ランチ・ディナー営業中。`}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${googleFontsLink}
  ${jsonLdHtml}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --green: ${primary};
      --green-dark: #15803d;
      --beige: #faf6f0;
      --beige-dark: #f0ebe0;
      --beige-mid: #e8e0d0;
      --brown: #7c5c3e;
      --brown-light: #a07850;
      --text: #3a2e22;
      --text-muted: #7a6a58;
      --section-pad: clamp(5rem, 10vw, 9rem);
      --container: 1100px;
      --gutter: clamp(1.25rem, 5vw, 5rem);
    }
    html { scroll-behavior: smooth; }
    body { font-family: ${bodyFont}; background: var(--beige); color: var(--text); overflow-x: hidden; font-size: ${bodySize}; line-height: ${bodyLineHeight}; }

    /* ── NAV ─────────────────────────────────────────── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 1.25rem var(--gutter);
      display: flex; align-items: center; justify-content: space-between;
      transition: all 0.4s;
    }
    nav.scrolled { background: rgba(250,246,240,0.96); backdrop-filter: blur(20px); padding: 0.75rem var(--gutter); box-shadow: 0 1px 20px rgba(0,0,0,0.05); }
    .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: var(--brown); text-decoration: none; letter-spacing: 0.05em; }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { text-decoration: none; color: var(--text-muted); font-size: 0.82rem; letter-spacing: 0.08em; transition: color 0.3s; }
    .nav-links a:hover { color: var(--green-dark); }
    .nav-cta { display: inline-block; padding: 0.55rem 1.4rem; background: var(--green); color: #fff; font-size: 0.78rem; border-radius: 30px; text-decoration: none; letter-spacing: 0.05em; transition: all 0.3s; }
    .nav-cta:hover { background: var(--green-dark); transform: translateY(-1px); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 0.5rem; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--brown); border-radius: 2px; transition: all 0.3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .mobile-menu { display: none; position: fixed; inset: 0; background: var(--beige); z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
    .mobile-menu.open { display: flex; transform: translateY(0); }
    .mobile-menu a { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: var(--text); text-decoration: none; min-height: 44px; display: flex; align-items: center; }

    /* ── HERO ─────────────────────────────────────────── */
    .hero { position: relative; height: 100vh; min-height: 700px; display: flex; align-items: center; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; background-image: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&h=1200&q=85&fit=crop'); background-size: cover; background-position: center; filter: brightness(0.5); }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(250,246,240,0.08) 0%, transparent 60%); }
    .hero-content { position: relative; z-index: 2; max-width: 650px; padding: 2rem 3rem 2rem 5vw; }
    .hero-tag { display: inline-block; padding: 0.3rem 1rem; background: rgba(34,197,94,0.85); color: #fff; font-size: 0.7rem; border-radius: 30px; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1.5rem; opacity: 0; animation: fadeInUp 0.8s 0.3s forwards; }
    .hero-headline { font-family: 'Playfair Display', serif; font-size: ${h1Size}; font-weight: 600; color: #fff; line-height: 1.15; margin-bottom: 0.75rem; opacity: 0; animation: fadeInUp 0.8s 0.5s forwards; }
    .hero-sub { font-family: 'Playfair Display', serif; font-size: clamp(1rem, 2.5vw, 1.5rem); font-style: italic; color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; opacity: 0; animation: fadeInUp 0.8s 0.7s forwards; }
    .hero-body { font-size: ${bodySize}; color: rgba(255,255,255,0.75); line-height: ${bodyLineHeight}; margin-bottom: 2rem; max-width: 480px; opacity: 0; animation: fadeInUp 0.8s 0.9s forwards; }
    .hero-cta { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.9rem 2.5rem; background: #fff; color: var(--brown); font-size: 0.85rem; border-radius: 50px; text-decoration: none; letter-spacing: 0.08em; font-weight: 500; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2); opacity: 0; animation: fadeInUp 0.8s 1.1s forwards; }
    .hero-cta:hover { background: var(--green); color: #fff; transform: translateY(-2px); box-shadow: 0 8px 30px rgba(34,197,94,0.4); }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    /* ── SECTIONS ───────────────────────────────────── */
    section { padding: var(--section-pad) var(--gutter); }
    .section-inner { max-width: var(--container); margin: 0 auto; }
    .section-label { display: block; text-align: center; font-size: 0.7rem; color: var(--green-dark); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 0.75rem; }
    .section-title { font-family: 'Playfair Display', serif; font-size: ${h2Size}; text-align: center; color: var(--text); margin-bottom: 1rem; line-height: 1.3; }
    .section-body-text { text-align: center; color: var(--text-muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; max-width: 580px; margin: 0 auto; }
    .leaf-divider { display: flex; align-items: center; justify-content: center; gap: 1rem; margin: 1rem 0 3rem; }
    .leaf-divider::before, .leaf-divider::after { content: ''; display: block; width: 60px; height: 1px; background: rgba(34,197,94,0.4); }
    .leaf-divider span { color: var(--green); font-size: 1.1rem; }

    /* ── CONCEPT ─────────────────────────────────────── */
    .concept-bg { background: #fff; }
    .concept-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
    .concept-img { border-radius: 4px; overflow: hidden; aspect-ratio: 4/5; }
    .concept-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .concept-img:hover img { transform: scale(1.03); }
    .concept-text .label { font-size: 0.7rem; color: var(--green-dark); letter-spacing: 0.3em; text-transform: uppercase; display: block; margin-bottom: 1rem; }
    .concept-text h2 { font-family: 'Playfair Display', serif; font-size: ${h2Size}; color: var(--text); margin-bottom: 1.5rem; line-height: 1.35; }
    .concept-text p { color: var(--text-muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; }
    .concept-feature-list { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
    .concept-feature { display: flex; align-items: flex-start; gap: 1rem; }
    .concept-feature-icon { width: 32px; height: 32px; background: rgba(34,197,94,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--green-dark); font-size: 0.9rem; flex-shrink: 0; }
    .concept-feature p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.7; padding-top: 2px; }

    /* ── MENU ─────────────────────────────────────────── */
    .menu-bg { background: var(--beige); }
    .menu-tabs { display: flex; justify-content: center; gap: 0; margin-bottom: 3rem; border-bottom: 2px solid var(--beige-mid); }
    .menu-tab { padding: 0.75rem 2rem; border: none; background: none; cursor: pointer; font-family: ${bodyFont}; font-size: 0.85rem; color: var(--text-muted); letter-spacing: 0.08em; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s; min-height: 44px; }
    .menu-tab.active { color: var(--green-dark); border-bottom-color: var(--green-dark); font-weight: 600; }
    .menu-tab:hover { color: var(--green-dark); }
    .menu-panel { display: none; }
    .menu-panel.active { display: block; }
    .menu-list { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--beige-mid); }
    .menu-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; padding: 1.5rem 0; border-bottom: 1px solid var(--beige-mid); transition: background 0.2s; }
    .menu-row:hover { background: rgba(34,197,94,0.03); }
    .menu-row-info { flex: 1; }
    .menu-row-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; color: var(--text); margin-bottom: 0.35rem; }
    .menu-row-desc { color: var(--text-muted); font-size: 0.83rem; line-height: 1.7; }
    .menu-row-price { color: var(--green-dark); font-size: 0.88rem; font-weight: 600; white-space: nowrap; padding-top: 3px; flex-shrink: 0; }

    /* ── CHEF ─────────────────────────────────────────── */
    .chef-bg { background: var(--beige-dark); }
    .chef-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
    .chef-img { border-radius: 4px; overflow: hidden; aspect-ratio: 3/4; order: 2; }
    .chef-img img { width: 100%; height: 100%; object-fit: cover; }
    .chef-text { order: 1; }
    .chef-text .label { font-size: 0.7rem; color: var(--green-dark); letter-spacing: 0.3em; text-transform: uppercase; display: block; margin-bottom: 1rem; }
    .chef-text h2 { font-family: 'Playfair Display', serif; font-size: ${h2Size}; color: var(--text); margin-bottom: 1.5rem; line-height: 1.35; }
    .chef-text p { color: var(--text-muted); font-size: 0.9rem; line-height: 2; margin-bottom: 1rem; }
    .chef-name { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.08); }
    .chef-name .name { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--text); }
    .chef-name .role { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.1em; margin-top: 0.2rem; }

    /* ── ACCESS ─────────────────────────────────────── */
    .access-bg { background: #fff; }
    .access-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3rem; }
    .access-map { background: var(--beige-dark); aspect-ratio: 4/3; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.85rem; }
    .access-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .access-item { display: flex; gap: 1rem; align-items: flex-start; }
    .access-icon { width: 36px; height: 36px; background: rgba(34,197,94,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
    .access-content .label { font-size: 0.68rem; color: var(--green-dark); letter-spacing: 0.12em; text-transform: uppercase; display: block; margin-bottom: 0.2rem; }
    .access-content .value { color: var(--text); font-size: 0.9rem; line-height: 1.65; }
    .access-tel-link { color: var(--green-dark); text-decoration: none; font-weight: 600; font-size: 1.1rem; }
    .access-tel-link:hover { text-decoration: underline; }

    /* ── CTA ─────────────────────────────────────────── */
    .cta-bg { background: var(--green); }
    .cta-inner { text-align: center; max-width: 680px; margin: 0 auto; }
    .cta-headline { font-family: 'Playfair Display', serif; font-size: ${h2Size}; color: #fff; margin-bottom: 1rem; line-height: 1.35; }
    .cta-body { color: rgba(255,255,255,0.85); font-size: ${bodySize}; line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; }
    .cta-btn { display: inline-block; padding: 1rem 3rem; background: #fff; color: var(--green-dark); font-size: 0.85rem; border-radius: 50px; text-decoration: none; letter-spacing: 0.1em; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    .cta-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 8px 35px rgba(0,0,0,0.2); }

    /* ── SP FIXED CTA ─────────────────────────────────── */
    .sp-cta-bar { display: none; }

    /* ── FOOTER ─────────────────────────────────────── */
    footer { background: var(--text); padding: 3rem var(--gutter); text-align: center; }
    .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: rgba(255,255,255,0.9); margin-bottom: 0.5rem; }
    .footer-copy { color: rgba(255,255,255,0.35); font-size: 0.75rem; }

    /* ── ANIMATIONS ─────────────────────────────────── */
    .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ─────────────────────────────────── */
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .concept-grid, .chef-grid, .access-grid { grid-template-columns: 1fr; gap: 2rem; }
      .chef-img, .chef-text { order: unset; }
      .hero-content { padding: 2rem 1.5rem; }
      section { padding: 4rem 1.25rem 5rem; }
      .menu-tabs { overflow-x: auto; justify-content: flex-start; }
      .sp-cta-bar {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
        background: rgba(250,246,240,0.97); border-top: 1px solid rgba(34,197,94,0.25);
        padding: 0.75rem 1.25rem; gap: 0.75rem;
      }
      .sp-cta-call { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1rem; border: 1px solid var(--green); color: var(--green-dark); font-size: 0.82rem; text-decoration: none; border-radius: 6px; min-height: 44px; }
      .sp-cta-reserve { flex: 2; display: flex; align-items: center; justify-content: center; padding: 0.85rem 1rem; background: var(--green); color: #fff; font-size: 0.82rem; text-decoration: none; border-radius: 6px; font-weight: 600; min-height: 44px; }
    }
  </style>
</head>
<body>
  <!-- NAV -->
  <nav id="nav" role="navigation" aria-label="メインナビゲーション">
    <a href="#" class="nav-logo" aria-label="${config.businessName} トップ">${config.businessName}</a>
    <ul class="nav-links" role="list">
      <li><a href="#concept">コンセプト</a></li>
      <li><a href="#menu">メニュー</a></li>
      <li><a href="#chef">シェフ</a></li>
      <li><a href="#access">アクセス</a></li>
    </ul>
    <a href="#cta" class="nav-cta">予約する</a>
    <button class="hamburger" id="hamburger" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileMenu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="モバイルメニュー">
    <a href="#concept" onclick="closeMobileMenu()">コンセプト</a>
    <a href="#menu" onclick="closeMobileMenu()">メニュー</a>
    <a href="#chef" onclick="closeMobileMenu()">シェフ</a>
    <a href="#access" onclick="closeMobileMenu()">アクセス</a>
    <a href="#cta" onclick="closeMobileMenu()">予約する</a>
  </div>

  <!-- HERO -->
  <section class="hero" id="hero" aria-labelledby="hero-heading">
    <div class="hero-bg" role="img" aria-hidden="true"></div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <span class="hero-tag">Restaurant</span>
      <h1 class="hero-headline" id="hero-heading">${heroHeadline}</h1>
      <p class="hero-sub">${heroSub}</p>
      <p class="hero-body">${heroBody}</p>
      <a href="#cta" class="hero-cta">${heroCta}</a>
    </div>
  </section>

  <!-- CONCEPT -->
  <section class="concept-bg" id="concept" aria-labelledby="concept-heading">
    <div class="section-inner">
      <div class="concept-grid">
        <div class="concept-img fade-up">
          <img src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&h=1000&q=80&fit=crop" alt="コンセプトイメージ" width="800" height="1000" loading="lazy" />
        </div>
        <div class="concept-text fade-up">
          <span class="label">Our Concept</span>
          <h2 id="concept-heading">${conceptHeadline}</h2>
          <p>${conceptBody}</p>
          <ul class="concept-feature-list" role="list">
            <li class="concept-feature">
              <div class="concept-feature-icon" aria-hidden="true">🌱</div>
              <p>地元農家から直送された新鮮な有機野菜を毎日仕入れています。</p>
            </li>
            <li class="concept-feature">
              <div class="concept-feature-icon" aria-hidden="true">♻️</div>
              <p>食品ロスゼロを目指した持続可能な料理作りを徹底しています。</p>
            </li>
            <li class="concept-feature">
              <div class="concept-feature-icon" aria-hidden="true">🫀</div>
              <p>アレルギー対応・ヴィーガン対応メニューをご用意しています。</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- MENU -->
  <section class="menu-bg" id="menu" aria-labelledby="menu-heading">
    <div class="section-inner">
      <span class="section-label">Menu</span>
      <h2 class="section-title" id="menu-heading">メニューのご案内</h2>
      <p class="section-body-text">季節ごとに変わる旬の食材を使ったコースからアラカルトまで幅広くご用意しています。</p>
      <div class="leaf-divider"><span>🌿</span></div>
      <div class="menu-tabs" role="tablist" aria-label="メニューカテゴリ">
        <button class="menu-tab active" role="tab" aria-selected="true" aria-controls="panel-lunch" id="tab-lunch">ランチ</button>
        <button class="menu-tab" role="tab" aria-selected="false" aria-controls="panel-dinner" id="tab-dinner">ディナー</button>
        <button class="menu-tab" role="tab" aria-selected="false" aria-controls="panel-drink" id="tab-drink">ドリンク</button>
      </div>
      <div id="panel-lunch" class="menu-panel active" role="tabpanel" aria-labelledby="tab-lunch">
        <div class="menu-list">${renderMenuItems(lunchItems)}</div>
      </div>
      <div id="panel-dinner" class="menu-panel" role="tabpanel" aria-labelledby="tab-dinner">
        <div class="menu-list">${renderMenuItems(dinnerItems)}</div>
      </div>
      <div id="panel-drink" class="menu-panel" role="tabpanel" aria-labelledby="tab-drink">
        <div class="menu-list">${renderMenuItems(drinkItems)}</div>
      </div>
    </div>
  </section>

  <!-- CHEF -->
  <section class="chef-bg" id="chef" aria-labelledby="chef-heading">
    <div class="section-inner">
      <div class="chef-grid">
        <div class="chef-text fade-up">
          <span class="label">Chef's Story</span>
          <h2 id="chef-heading">シェフ紹介</h2>
          <p>地元の農家さんと顔の見える関係を築き、旬の食材を毎日直送でお届けいただいています。食材の声に耳を傾け、素材本来の美味しさを最大限に引き出すことが私のテーマです。</p>
          <p>フランスと日本の名店で修業を積んだ後、地元の食文化に貢献したいという思いで帰郷。地域の農家・漁師と協力しながら、食のサステナビリティを追求しています。</p>
          <div class="chef-name">
            <p class="name">Executive Chef</p>
            <p class="role">${config.businessName}</p>
          </div>
        </div>
        <div class="chef-img fade-up">
          <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=1000&q=80&fit=crop" alt="エグゼクティブシェフ" width="800" height="1000" loading="lazy" />
        </div>
      </div>
    </div>
  </section>

  <!-- ACCESS -->
  <section class="access-bg" id="access" aria-labelledby="access-heading">
    <div class="section-inner">
      <span class="section-label">Access</span>
      <h2 class="section-title" id="access-heading">アクセス・営業情報</h2>
      <div class="leaf-divider"><span>🌿</span></div>
      <div class="access-grid">
        <div class="access-map fade-up" role="img" aria-label="地図（準備中）">地図が表示されます</div>
        <div class="access-list fade-up">
          <div class="access-item">
            <div class="access-icon" aria-hidden="true">📍</div>
            <div class="access-content">
              <span class="label">住所</span>
              <span class="value">${accessAddress}</span>
            </div>
          </div>
          <div class="access-item">
            <div class="access-icon" aria-hidden="true">🕐</div>
            <div class="access-content">
              <span class="label">営業時間</span>
              <span class="value">${accessHours}</span>
            </div>
          </div>
          <div class="access-item">
            <div class="access-icon" aria-hidden="true">📞</div>
            <div class="access-content">
              <span class="label">電話予約</span>
              <span class="value"><a href="tel:${accessTel}" class="access-tel-link">${accessTel}</a></span>
            </div>
          </div>
        </div>
      </div>
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
    <a href="tel:${accessTel}" class="sp-cta-call">📞 電話予約</a>
    <a href="#cta" class="sp-cta-reserve">ネット予約</a>
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

    // Menu tabs
    const tabs = document.querySelectorAll('.menu-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const panelId = tab.getAttribute('aria-controls');
        document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
        if (panelId) document.getElementById(panelId)?.classList.add('active');
      });
    });

    // IntersectionObserver
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  </script>
</body>
</html>`;
  },
};
