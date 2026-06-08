import type { ProjectConfig } from '@/types';
import { generateJsonLd } from './pages/shared';

export const beautyLuxuryTemplate = {
  id: 'beauty-luxury',
  name: '美容サロン × ラグジュアリー',
  industry: 'beauty',
  tone: 'luxury',
  sections: ['hero', 'services', 'staff', 'gallery', 'access', 'cta'],
  generateHtml: (config: ProjectConfig, texts: Record<string, unknown>): string => {
    const primary = config.colorPalette?.primary ?? '#d97706';
    const fontFamily = config.fontFamily ?? 'serif';
    const isSerif = fontFamily === 'serif';

    const googleFontsLink = isSerif
      ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />'
      : '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />';
    const bodyFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
    const h1Size = isSerif ? 'clamp(3rem, 8vw, 6rem)' : 'clamp(2.5rem, 7vw, 5rem)';
    const h2Size = isSerif ? 'clamp(1.8rem, 3.5vw, 2.8rem)' : 'clamp(1.6rem, 3vw, 2.4rem)';
    const bodySize = isSerif ? '1.0625rem' : '1rem';
    const bodyLineHeight = isSerif ? '2.0' : '1.8';

    const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

    const heroHeadline = (t.hero?.headline as string) ?? config.businessName;
    const heroSub      = (t.hero?.subheadline as string) ?? '上質な時間を、あなたに。';
    const heroBody     = (t.hero?.body as string) ?? config.businessDescription;
    const heroCta      = (t.hero?.cta as string) ?? 'ご予約はこちら';

    const servicesHeadline = (t.services?.headline as string) ?? 'サービスのご案内';
    const servicesItems = (t.services?.items as Array<Record<string, string>>) ?? [
      { title: 'カット', price: '¥6,600〜', description: 'トレンドを取り入れた洗練されたカット技術で、あなたの個性を最大限に引き出します。' },
      { title: 'カラー', price: '¥11,000〜', description: '髪質を活かした上品なカラーリング。ダメージレスで美しい発色を実現。' },
      { title: 'トリートメント', price: '¥8,800〜', description: '厳選された最上質な成分で髪を内側から輝かせる集中ケア。' },
      { title: 'ヘッドスパ', price: '¥5,500〜', description: '頭皮から全身の疲れを癒す、贅沢なリラクゼーションスパ体験。' },
    ];

    const staffItems = (t.staff?.items as Array<Record<string, string>>) ?? [
      { title: 'チーフスタイリスト', description: '15年以上の経験を持つ熟練スタイリスト。国内外コレクション参加実績あり。あなたの魅力を最大限に引き出します。', name: 'Style Director' },
      { title: 'カラーリスト', description: 'カラーの細かなニュアンスを読み取り、肌トーンに合った最高の色味をご提案。', name: 'Color Specialist' },
      { title: 'ヘッドスパニスト', description: '頭皮環境の改善から始まる本格的な美髪ケアを追求するスペシャリスト。', name: 'Scalp Therapist' },
    ];

    const ctaHeadline = (t.cta?.headline as string) ?? 'ご予約・無料カウンセリング';
    const ctaBody     = (t.cta?.body as string) ?? '一人ひとりに寄り添った丁寧なカウンセリングで、あなただけのスタイルをご提案します。まずはお気軽にご相談ください。';
    const ctaCta      = (t.cta?.cta as string) ?? '無料カウンセリングを予約する';

    const accessAddress = (t.access?.address as string) ?? '東京都渋谷区〇〇1-2-3';
    const accessHours   = (t.access?.hours as string) ?? '10:00 - 20:00（火曜定休）';
    const accessTel     = (t.access?.tel as string) ?? '03-0000-0000';

    const servicesHtml = servicesItems.map((item, i) => `
      <div class="service-card fade-up" style="animation-delay:${i * 0.12}s">
        <div class="service-num">0${i + 1}</div>
        <div class="service-body">
          <div class="service-head">
            <h3 class="service-title">${item.title ?? ''}</h3>
            <span class="service-price">${item.price ?? ''}</span>
          </div>
          <p class="service-desc">${item.description ?? ''}</p>
        </div>
      </div>`).join('');

    const staffHtml = staffItems.slice(0, 3).map((item, i) => `
      <div class="staff-card fade-up" style="animation-delay:${i * 0.15}s">
        <div class="staff-avatar">
          <img src="https://images.unsplash.com/photo-${i === 0 ? '1560066984-138dadb4c035' : i === 1 ? '1522337360788-8b13dee7a37e' : '1504703395950-b89145a5425b'}?w=400&h=400&q=80&fit=crop" alt="${item.name ?? `スタッフ ${i + 1}`}" width="400" height="400" loading="lazy" />
        </div>
        <h3 class="staff-name">${item.name ?? `スタイリスト ${i + 1}`}</h3>
        <p class="staff-role">${item.title ?? ''}</p>
        <p class="staff-desc">${item.description ?? ''}</p>
      </div>`).join('');

    const galleryImages = [
      { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=800&q=80&fit=crop', alt: 'スタイル 1', w: 600, h: 800 },
      { url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&q=80&fit=crop', alt: 'スタイル 2', w: 600, h: 400 },
      { url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&q=80&fit=crop', alt: 'スタイル 3', w: 600, h: 400 },
      { url: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=600&h=400&q=80&fit=crop', alt: 'スタイル 4', w: 600, h: 400 },
      { url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&q=80&fit=crop', alt: 'スタイル 5', w: 600, h: 400 },
    ];

    const galleryHtml = galleryImages.map((img, i) => `
      <div class="gallery-item fade-up" style="animation-delay:${i * 0.08}s">
        <img src="${img.url}" alt="${img.alt}" width="${img.w}" height="${img.h}" loading="lazy" />
      </div>`).join('');

    const faqItems = [
      { question: '初回カウンセリングは無料ですか？', answer: 'はい、初回のカウンセリングは完全無料です。お気軽にご来店ください。' },
      { question: '予約はどのようにすればよいですか？', answer: '電話・LINE・ウェブサイトのいずれからでもご予約いただけます。当日予約も歓迎しております。' },
      { question: 'ダメージが気になりますが施術できますか？', answer: 'はい、ダメージ毛の方にも対応しています。カウンセリングで髪の状態を確認し、最適なメニューをご提案します。' },
      { question: '子連れでの来店は可能ですか？', answer: 'もちろん歓迎しております。お子様がゆったり過ごせるよう、スタッフが対応いたします。' },
    ];

    const testimonialsHtml = [
      { name: 'K.M様', age: '30代', text: 'カウンセリングが丁寧で、初めて自分に本当に合ったヘアスタイルに出会えました。毎回通うのが楽しみです。', rating: 5 },
      { name: 'Y.T様', age: '40代', text: 'ヘッドスパで日頃の疲れが一気に癒されました。頭皮の状態も改善されて、髪にツヤが戻ってきた気がします。', rating: 5 },
      { name: 'A.S様', age: '20代', text: 'SNSで見たスタイルを持参したら完璧に再現してくれました。技術の高さに感激です。また必ず来ます！', rating: 5 },
    ].map((t, i) => `
      <div class="testimonial-card fade-up" style="animation-delay:${i * 0.15}s">
        <div class="testimonial-stars" aria-label="評価5つ星">★★★★★</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">${t.name}（${t.age}）</div>
      </div>`).join('');

    const faqHtml = faqItems.map((item, i) => `
      <div class="faq-item fade-up" style="animation-delay:${i * 0.1}s">
        <details>
          <summary class="faq-q">
            <span class="faq-label" aria-hidden="true">Q</span>
            <span>${item.question}</span>
            <span class="faq-arrow" aria-hidden="true">▼</span>
          </summary>
          <div class="faq-a">
            <span class="faq-label answer" aria-hidden="true">A</span>
            <p>${item.answer}</p>
          </div>
        </details>
      </div>`).join('');

    const jsonLdHtml = generateJsonLd(config, {
      faqItems,
    });

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.businessName} | 美容サロン</title>
  <meta name="description" content="${config.businessDescription ? config.businessDescription.slice(0, 120) : `${config.businessName}の公式サイト。丁寧なカウンセリングで、あなただけのスタイルをご提案します。`}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${googleFontsLink}
  ${jsonLdHtml}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --gold: ${primary};
      --gold-light: #f6d98a;
      --black: #0a0a0a;
      --dark: #111111;
      --mid: #1a1a1a;
      --text: #e8e0d0;
      --text-muted: #8a8075;
      --section-pad: clamp(5rem, 10vw, 10rem);
      --container: 1100px;
      --gutter: clamp(1.25rem, 5vw, 5rem);
    }
    html { scroll-behavior: smooth; }
    body { font-family: ${bodyFont}; background: var(--black); color: var(--text); overflow-x: hidden; font-size: ${bodySize}; line-height: ${bodyLineHeight}; }

    /* ── NAV ─────────────────────────────────────────── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 1.25rem var(--gutter);
      display: flex; align-items: center; justify-content: space-between;
      transition: all 0.4s ease;
    }
    nav.scrolled { background: rgba(10,10,10,0.96); backdrop-filter: blur(20px); padding: 0.75rem var(--gutter); border-bottom: 1px solid rgba(217,119,6,0.12); }
    .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; letter-spacing: 0.15em; color: var(--gold); text-decoration: none; }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a { text-decoration: none; color: rgba(232,224,208,0.65); font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; transition: color 0.3s; }
    .nav-links a:hover { color: var(--gold); }
    .nav-cta { display: inline-block; padding: 0.6rem 1.5rem; border: 1px solid var(--gold); color: var(--gold); font-size: 0.72rem; letter-spacing: 0.1em; text-decoration: none; transition: all 0.3s; }
    .nav-cta:hover { background: var(--gold); color: var(--black); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 0.5rem; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; }
    .hamburger span { display: block; width: 22px; height: 1px; background: var(--gold); transition: all 0.3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
    .mobile-menu {
      display: none; position: fixed; inset: 0; background: rgba(10,10,10,0.98);
      z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem;
      transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .mobile-menu.open { display: flex; transform: translateY(0); }
    .mobile-menu a { font-family: 'Cormorant Garamond', serif; font-size: 2rem; color: var(--text); text-decoration: none; letter-spacing: 0.1em; min-height: 44px; display: flex; align-items: center; }

    /* ── HERO ─────────────────────────────────────────── */
    .hero {
      position: relative; height: 100vh; min-height: 700px;
      display: flex; align-items: center; justify-content: center; text-align: center;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background-image: url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&h=1067&q=85&fit=crop');
      background-size: cover; background-position: center;
      filter: brightness(0.35);
    }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,10,10,0.1), rgba(10,10,10,0.65)); z-index: 1; }
    .hero-content { position: relative; z-index: 2; max-width: 820px; padding: 2rem var(--gutter); }
    .hero-tag { display: inline-block; letter-spacing: 0.35em; font-size: 0.68rem; color: var(--gold); text-transform: uppercase; margin-bottom: 1.5rem; opacity: 0; animation: fadeInUp 0.8s 0.3s forwards; }
    .hero-headline { font-family: 'Cormorant Garamond', serif; font-size: ${h1Size}; font-weight: 300; line-height: 1.2; color: #fff; margin-bottom: 0.75rem; letter-spacing: 0.05em; opacity: 0; animation: fadeInUp 0.8s 0.5s forwards; }
    .hero-sub { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.1rem, 2.5vw, 1.6rem); font-weight: 300; font-style: italic; color: var(--gold-light); margin-bottom: 1.5rem; letter-spacing: 0.05em; opacity: 0; animation: fadeInUp 0.8s 0.7s forwards; }
    .hero-body { font-size: ${bodySize}; color: rgba(232,224,208,0.7); line-height: ${bodyLineHeight}; max-width: 500px; margin: 0 auto 2.5rem; letter-spacing: 0.04em; opacity: 0; animation: fadeInUp 0.8s 0.9s forwards; }
    .hero-cta {
      display: inline-block; padding: 1rem 3rem;
      border: 1px solid var(--gold); color: var(--gold);
      font-size: 0.78rem; letter-spacing: 0.2em; text-decoration: none; text-transform: uppercase;
      transition: all 0.4s ease; position: relative; overflow: hidden;
      opacity: 0; animation: fadeInUp 0.8s 1.1s forwards;
    }
    .hero-cta::before { content: ''; position: absolute; inset: 0; background: var(--gold); transform: translateX(-100%); transition: transform 0.4s ease; z-index: -1; }
    .hero-cta:hover::before { transform: translateX(0); }
    .hero-cta:hover { color: var(--black); }
    .hero-scroll { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: rgba(232,224,208,0.35); font-size: 0.62rem; letter-spacing: 0.25em; text-transform: uppercase; }
    .scroll-line { width: 1px; height: 56px; background: linear-gradient(to bottom, transparent, var(--gold)); animation: scrollDown 2s ease infinite; }
    @keyframes scrollDown { 0%,100% { transform: scaleY(0); transform-origin: top; opacity: 0; } 50% { transform: scaleY(1); transform-origin: top; opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

    /* ── DIVIDER ─────────────────────────────────────── */
    .gold-divider { display: flex; align-items: center; gap: 1rem; max-width: 200px; margin: 0 auto 3rem; }
    .gold-divider::before, .gold-divider::after { content: ''; flex: 1; height: 1px; background: var(--gold); opacity: 0.35; }
    .gold-divider span { color: var(--gold); font-size: 0.75rem; }

    /* ── SECTIONS ───────────────────────────────────── */
    section { padding: var(--section-pad) var(--gutter); }
    .section-inner { max-width: var(--container); margin: 0 auto; }
    .section-tag { display: block; text-align: center; letter-spacing: 0.35em; font-size: 0.63rem; color: var(--gold); text-transform: uppercase; margin-bottom: 0.75rem; }
    .section-title { font-family: 'Cormorant Garamond', serif; font-size: ${h2Size}; text-align: center; font-weight: 300; color: #fff; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
    .section-body { text-align: center; color: var(--text-muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; max-width: 560px; margin: 0 auto; letter-spacing: 0.04em; }

    /* ── SERVICES ───────────────────────────────────── */
    .services-bg { background: var(--dark); }
    .services-list { display: flex; flex-direction: column; gap: 0; margin-top: 3rem; border-top: 1px solid rgba(217,119,6,0.1); }
    .service-card { display: grid; grid-template-columns: 64px 1fr; gap: 2rem; padding: 2rem 0; border-bottom: 1px solid rgba(217,119,6,0.1); align-items: start; transition: background 0.3s; }
    .service-card:hover { background: rgba(217,119,6,0.03); }
    .service-num { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: rgba(217,119,6,0.2); font-weight: 300; line-height: 1; padding-top: 2px; }
    .service-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem; }
    .service-title { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; color: #fff; font-weight: 400; letter-spacing: 0.04em; }
    .service-price { font-size: 0.82rem; color: var(--gold); letter-spacing: 0.08em; white-space: nowrap; }
    .service-desc { color: var(--text-muted); font-size: 0.85rem; line-height: 1.85; letter-spacing: 0.04em; }

    /* ── STAFF ──────────────────────────────────────── */
    .staff-bg { background: var(--black); }
    .staff-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 3rem; margin-top: 3rem; }
    .staff-card { text-align: center; }
    .staff-avatar { width: 180px; height: 180px; border-radius: 50%; overflow: hidden; margin: 0 auto 1.5rem; border: 1px solid rgba(217,119,6,0.25); aspect-ratio: 1; }
    .staff-avatar img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .staff-card:hover .staff-avatar img { transform: scale(1.05); }
    .staff-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: #fff; margin-bottom: 0.2rem; font-weight: 400; }
    .staff-role { font-size: 0.68rem; color: var(--gold); letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 1rem; }
    .staff-desc { color: var(--text-muted); font-size: 0.84rem; line-height: 1.85; padding: 0 0.75rem; }

    /* ── GALLERY ─────────────────────────────────────── */
    .gallery-bg { background: var(--dark); }
    .gallery-track { display: flex; gap: 0.75rem; margin-top: 3rem; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 0.5rem; }
    .gallery-track::-webkit-scrollbar { display: none; }
    .gallery-item { flex: 0 0 auto; width: 300px; aspect-ratio: 3/4; border-radius: 2px; overflow: hidden; scroll-snap-align: start; }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease, filter 0.4s ease; filter: brightness(0.8); }
    .gallery-item:hover img { transform: scale(1.06); filter: brightness(1); }
    .gallery-hint { text-align: center; margin-top: 1rem; font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.15em; display: none; }

    /* ── ACCESS ─────────────────────────────────────── */
    .access-bg { background: var(--black); }
    .access-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; margin-top: 3rem; }
    .access-map { background: var(--mid); aspect-ratio: 4/3; border: 1px solid rgba(217,119,6,0.12); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.82rem; }
    .access-info { display: flex; flex-direction: column; gap: 0; }
    .access-item { display: flex; gap: 1.5rem; padding: 1.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .access-item:first-child { padding-top: 0; }
    .access-label { font-size: 0.62rem; color: var(--gold); letter-spacing: 0.22em; text-transform: uppercase; min-width: 60px; padding-top: 3px; flex-shrink: 0; }
    .access-value { color: var(--text); font-size: 0.9rem; line-height: 1.7; }
    .access-tel-link { color: var(--gold); text-decoration: none; font-size: 1.2rem; font-family: 'Cormorant Garamond', serif; letter-spacing: 0.05em; }
    .access-tel-link:hover { text-decoration: underline; }

    /* ── CTA ─────────────────────────────────────────── */
    .cta-bg { background: linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #0a0a0a 100%); border-top: 1px solid rgba(217,119,6,0.18); border-bottom: 1px solid rgba(217,119,6,0.18); }
    .cta-inner { text-align: center; max-width: 680px; margin: 0 auto; }
    .cta-headline { font-family: 'Cormorant Garamond', serif; font-size: clamp(1.8rem, 4vw, 3rem); color: #fff; font-weight: 300; margin-bottom: 1.5rem; line-height: 1.3; letter-spacing: 0.05em; }
    .cta-body { color: var(--text-muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; letter-spacing: 0.04em; }
    .cta-btn {
      display: inline-block; padding: 1.1rem 3.5rem;
      background: linear-gradient(135deg, var(--gold), #b45309);
      color: var(--black); font-size: 0.82rem; letter-spacing: 0.2em; text-decoration: none;
      text-transform: uppercase; font-weight: 500;
      transition: all 0.3s ease; box-shadow: 0 4px 30px rgba(217,119,6,0.28);
    }
    .cta-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 40px rgba(217,119,6,0.48); }

    /* ── SP FIXED CTA ─────────────────────────────────── */
    .sp-cta-bar { display: none; }

    /* ── TESTIMONIALS ─────────────────────────────────── */
    .testimonials-bg { background: var(--mid); }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 3rem; }
    .testimonial-card { background: var(--dark); border: 1px solid rgba(217,119,6,0.1); padding: 2rem 1.75rem; }
    .testimonial-stars { color: var(--gold); font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 1rem; }
    .testimonial-text { color: var(--text-muted); font-size: 0.9rem; line-height: 1.9; margin-bottom: 1.25rem; font-style: italic; }
    .testimonial-author { font-size: 0.72rem; color: rgba(217,119,6,0.6); letter-spacing: 0.15em; text-transform: uppercase; }

    /* ── FAQ ─────────────────────────────────────────── */
    .faq-bg { background: var(--dark); }
    .faq-list { margin-top: 3rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .faq-item details { border: 1px solid rgba(217,119,6,0.12); }
    .faq-q { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; cursor: pointer; list-style: none; }
    .faq-q::-webkit-details-marker { display: none; }
    .faq-label { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--gold); border: 1px solid rgba(217,119,6,0.3); flex-shrink: 0; }
    .faq-label.answer { color: var(--text-muted); border-color: rgba(232,224,208,0.15); }
    .faq-q span:nth-child(2) { flex: 1; font-size: 0.9rem; color: var(--text); line-height: 1.6; }
    .faq-arrow { font-size: 0.65rem; color: var(--gold); transition: transform 0.3s; flex-shrink: 0; }
    details[open] .faq-arrow { transform: rotate(180deg); }
    .faq-a { display: flex; gap: 1rem; padding: 1rem 1.5rem 1.5rem; border-top: 1px solid rgba(217,119,6,0.08); }
    .faq-a p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.9; }

    /* ── FOOTER ─────────────────────────────────────── */
    footer { background: var(--black); border-top: 1px solid rgba(255,255,255,0.04); padding: 3rem var(--gutter); text-align: center; }
    .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: var(--gold); letter-spacing: 0.15em; margin-bottom: 0.75rem; }
    .footer-copy { color: var(--text-muted); font-size: 0.72rem; letter-spacing: 0.1em; }

    /* ── ANIMATIONS ─────────────────────────────────── */
    .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ─────────────────────────────────── */
    @media (max-width: 768px) {
      nav { padding: 1rem 1.25rem; }
      nav.scrolled { padding: 0.7rem 1.25rem; }
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .access-grid { grid-template-columns: 1fr; gap: 2rem; }
      .gallery-item { width: 250px; }
      .gallery-hint { display: block; }
      section { padding: 4rem 1.25rem 5rem; }
      .sp-cta-bar {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
        background: rgba(10,10,10,0.97); border-top: 1px solid rgba(217,119,6,0.2);
        padding: 0.75rem 1.25rem; gap: 0.75rem;
      }
      .sp-cta-call { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1rem; border: 1px solid var(--gold); color: var(--gold); font-size: 0.8rem; text-decoration: none; letter-spacing: 0.08em; min-height: 44px; }
      .sp-cta-reserve { flex: 2; display: flex; align-items: center; justify-content: center; padding: 0.85rem 1rem; background: linear-gradient(135deg, var(--gold), #b45309); color: var(--black); font-size: 0.82rem; text-decoration: none; letter-spacing: 0.1em; font-weight: 500; min-height: 44px; }
    }
  </style>
</head>
<body>
  <!-- NAV -->
  <nav id="nav" role="navigation" aria-label="メインナビゲーション">
    <a href="#" class="nav-logo" aria-label="${config.businessName} トップページ">${config.businessName}</a>
    <ul class="nav-links" role="list">
      <li><a href="#services">Services</a></li>
      <li><a href="#staff">Staff</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#access">Access</a></li>
    </ul>
    <a href="#cta" class="nav-cta">Reservation</a>
    <button class="hamburger" id="hamburger" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileMenu">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <!-- MOBILE MENU -->
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="モバイルメニュー">
    <a href="#services" onclick="closeMobileMenu()">Services</a>
    <a href="#staff" onclick="closeMobileMenu()">Staff</a>
    <a href="#gallery" onclick="closeMobileMenu()">Gallery</a>
    <a href="#access" onclick="closeMobileMenu()">Access</a>
    <a href="#cta" onclick="closeMobileMenu()">Reservation</a>
  </div>

  <!-- HERO -->
  <section class="hero" id="hero" aria-labelledby="hero-heading">
    <div class="hero-bg" role="img" aria-hidden="true"></div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <span class="hero-tag">Beauty Salon</span>
      <h1 class="hero-headline" id="hero-heading">${heroHeadline}</h1>
      <p class="hero-sub">${heroSub}</p>
      <p class="hero-body">${heroBody}</p>
      <a href="#cta" class="hero-cta">${heroCta}</a>
    </div>
    <div class="hero-scroll" aria-hidden="true">
      <div class="scroll-line"></div>
      <span>Scroll</span>
    </div>
  </section>

  <!-- SERVICES -->
  <section class="services-bg" id="services" aria-labelledby="services-heading">
    <div class="section-inner">
      <span class="section-tag">Services</span>
      <h2 class="section-title" id="services-heading">${servicesHeadline}</h2>
      <p class="section-body">一人ひとりの髪質・ライフスタイルに合わせた、オーダーメイドのヘアサービス。</p>
      <div class="gold-divider"><span>✦</span></div>
      <div class="services-list">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <!-- STAFF -->
  <section class="staff-bg" id="staff" aria-labelledby="staff-heading">
    <div class="section-inner">
      <span class="section-tag">Our Team</span>
      <h2 class="section-title" id="staff-heading">スタイリスト紹介</h2>
      <p class="section-body">技術と感性を磨き続けるスペシャリストたちがあなたをお迎えします。</p>
      <div class="gold-divider"><span>✦</span></div>
      <div class="staff-grid">
        ${staffHtml}
      </div>
    </div>
  </section>

  <!-- GALLERY -->
  <section class="gallery-bg" id="gallery" aria-labelledby="gallery-heading">
    <div class="section-inner">
      <span class="section-tag">Gallery</span>
      <h2 class="section-title" id="gallery-heading">スタイルギャラリー</h2>
      <p class="section-body">実際のお客様の仕上がりをご覧ください。</p>
      <div class="gold-divider"><span>✦</span></div>
      <div class="gallery-track" role="region" aria-label="ギャラリー（横スクロール）">
        ${galleryHtml}
      </div>
      <p class="gallery-hint">← スワイプしてご覧ください →</p>
    </div>
  </section>

  <!-- ACCESS -->
  <section class="access-bg" id="access" aria-labelledby="access-heading">
    <div class="section-inner">
      <span class="section-tag">Access</span>
      <h2 class="section-title" id="access-heading">店舗情報・アクセス</h2>
      <div class="gold-divider"><span>✦</span></div>
      <div class="access-grid">
        <div class="access-map fade-up" role="img" aria-label="地図（準備中）">地図が表示されます</div>
        <div class="access-info fade-up">
          <div class="access-item">
            <span class="access-label">Address</span>
            <span class="access-value">${accessAddress}</span>
          </div>
          <div class="access-item">
            <span class="access-label">Hours</span>
            <span class="access-value">${accessHours}</span>
          </div>
          <div class="access-item">
            <span class="access-label">Tel</span>
            <span class="access-value"><a href="tel:${accessTel}" class="access-tel-link">${accessTel}</a></span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials-bg" id="testimonials" aria-labelledby="testimonials-heading">
    <div class="section-inner">
      <span class="section-tag">Testimonials</span>
      <h2 class="section-title" id="testimonials-heading">お客様の声</h2>
      <p class="section-body">実際にご来店いただいたお客様からいただいた感想です。</p>
      <div class="gold-divider"><span>✦</span></div>
      <div class="testimonials-grid">
        ${testimonialsHtml}
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq-bg" id="faq" aria-labelledby="faq-heading">
    <div class="section-inner">
      <span class="section-tag">FAQ</span>
      <h2 class="section-title" id="faq-heading">よくある質問</h2>
      <p class="section-body">ご来店前によく寄せられるご質問にお答えします。</p>
      <div class="gold-divider"><span>✦</span></div>
      <div class="faq-list" role="list">
        ${faqHtml}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-bg" id="cta" aria-labelledby="cta-heading">
    <div class="cta-inner fade-up">
      <span class="section-tag">Reservation</span>
      <h2 class="cta-headline" id="cta-heading">${ctaHeadline}</h2>
      <div class="gold-divider" style="margin-bottom:1.5rem"><span>✦</span></div>
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
    <a href="tel:${accessTel}" class="sp-cta-call">📞 電話する</a>
    <a href="#cta" class="sp-cta-reserve">予約・相談</a>
  </div>

  <script defer>
    // Scroll nav
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

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

    // IntersectionObserver fade-up
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  </script>
</body>
</html>`;
  },
};
