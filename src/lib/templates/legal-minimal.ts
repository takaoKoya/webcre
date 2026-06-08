import type { ProjectConfig } from '@/types';
import { generateJsonLd } from './pages/shared';

export const legalMinimalTemplate = {
  id: 'legal-minimal',
  name: '士業 × ミニマル',
  industry: 'legal',
  tone: 'minimal',
  sections: ['hero', 'services', 'profile', 'flow', 'faq', 'cta'],
  generateHtml: (config: ProjectConfig, texts: Record<string, unknown>): string => {
    const primary = config.colorPalette?.primary ?? '#64748b';
    const fontFamily = config.fontFamily ?? 'serif';
    const isSerif = fontFamily === 'serif';

    const googleFontsLink = isSerif
      ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;600&display=swap" rel="stylesheet" />'
      : '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />';
    const bodyFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
    const serifFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
    const h1Size = isSerif ? 'clamp(2rem, 4vw, 3rem)' : 'clamp(1.8rem, 3.5vw, 2.6rem)';
    const h2Size = isSerif ? 'clamp(1.6rem, 3vw, 2.4rem)' : 'clamp(1.4rem, 2.5vw, 2rem)';
    const bodySize = isSerif ? '1.0625rem' : '1rem';
    const bodyLineHeight = isSerif ? '2.0' : '1.8';

    const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

    const heroHeadline = (t.hero?.headline as string) ?? config.businessName;
    const heroSub      = (t.hero?.subheadline as string) ?? 'あなたの法的課題を、確実に解決します。';
    const heroBody     = (t.hero?.body as string) ?? config.businessDescription;
    const heroCta      = (t.hero?.cta as string) ?? '無料相談を予約する';

    const servicesItems = (t.services?.items as Array<Record<string, string>>) ?? [
      { title: '法人設立サポート', price: '¥66,000〜', description: '会社設立の手続きをワンストップでサポート。スピーディな登記申請を実現します。', detail: '定款作成・公証役場手続き・登記申請まで一括代行。合同会社・株式会社どちらも対応。' },
      { title: '相続・遺言', price: '¥55,000〜', description: '遺産分割協議書の作成から相続登記まで、複雑な相続手続きをサポートします。', detail: '相続財産調査・法定相続人確認・遺産分割協議書作成・相続登記まで対応。' },
      { title: '不動産登記', price: '¥44,000〜', description: '売買・贈与・抵当権設定等、不動産に関する各種登記手続きを代行します。', detail: '所有権移転・抵当権設定・抹消登記など。司法書士による正確・迅速な対応。' },
      { title: '成年後見', price: 'ご相談', description: '認知症や障がいのある方の財産管理・身上保護をサポートします。', detail: '任意後見・法定後見どちらも対応。家庭裁判所への申立書作成を含む。' },
    ];

    const faqItems = (t.faq?.items as Array<Record<string, string>>) ?? [
      { question: '初回相談は無料ですか？', answer: 'はい、初回30分の相談は無料です。まずはお気軽にお問い合わせください。電話・ビデオ通話でのご相談も可能です。' },
      { question: '費用の目安を教えてください。', answer: '業務内容によって異なりますが、事前に明確なお見積もりをご提示いたします。追加費用が発生する場合は必ず事前にご説明します。' },
      { question: '急ぎの案件にも対応できますか？', answer: 'はい、緊急案件にも対応いたします。状況によっては即日対応も可能ですので、まずはお電話でご相談ください。' },
      { question: '相談はオンラインでも可能ですか？', answer: 'Zoom・Google Meetなどビデオ通話でのご相談に対応しております。全国どこからでもご利用いただけます。' },
      { question: '書類の収集も代行してもらえますか？', answer: 'はい、お客様の代わりに各種証明書・謄本の取得も代行可能です。お手間を最小限に抑えてお手続きを進めます。' },
    ];

    const ctaHeadline = (t.cta?.headline as string) ?? '無料相談受付中';
    const ctaBody     = (t.cta?.body as string) ?? '法的なお悩みは、一人で抱え込まず専門家にご相談ください。初回30分は無料です。';
    const ctaCta      = (t.cta?.cta as string) ?? '今すぐ無料相談を予約する';
    const accessTel   = (t.access?.tel as string) ?? '03-0000-0000';

    const servicesHtml = servicesItems.map((item, i) => `
      <div class="service-item fade-up" style="animation-delay:${i * 0.1}s">
        <details>
          <summary class="service-summary">
            <div class="service-summary-left">
              <span class="service-num">${String(i + 1).padStart(2, '0')}</span>
              <h3 class="service-title">${item.title ?? ''}</h3>
              <p class="service-desc-short">${item.description ?? ''}</p>
            </div>
            <div class="service-summary-right">
              <span class="service-price">${item.price ?? ''}</span>
              <span class="service-arrow" aria-hidden="true">▼</span>
            </div>
          </summary>
          <div class="service-detail">
            <p>${item.detail ?? item.description ?? ''}</p>
          </div>
        </details>
      </div>`).join('');

    const faqHtml = faqItems.map((item, i) => `
      <div class="faq-item fade-up" style="animation-delay:${i * 0.1}s">
        <details>
          <summary class="faq-q">
            <span class="faq-label" aria-hidden="true">Q</span>
            <span>${item.question ?? ''}</span>
            <span class="faq-arrow" aria-hidden="true">▼</span>
          </summary>
          <div class="faq-a">
            <span class="faq-label answer" aria-hidden="true">A</span>
            <p>${item.answer ?? ''}</p>
          </div>
        </details>
      </div>`).join('');

    const jsonLdHtml = generateJsonLd(config, {
      faqItems: faqItems.map(f => ({ question: f.question ?? '', answer: f.answer ?? '' })),
      howToSteps: [
        { name: 'ご相談・お問い合わせ', text: 'お電話またはメールフォームよりお気軽にご連絡ください。24時間受付。' },
        { name: '初回無料相談（30分）', text: 'ご状況のヒアリングと必要な手続き・費用をご説明します。' },
        { name: 'お見積もり・ご契約', text: '費用を明確にご提示した上で、ご納得いただいた後にご契約。' },
        { name: '書類の収集・作成', text: '必要書類の収集も代行。お客様のご負担を最小限に。' },
        { name: '完了・アフターサポート', text: '手続き完了後も、ご不明な点はいつでもご相談いただけます。' },
      ],
      howToName: 'ご依頼の流れ',
    });

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.businessName} | 法律・士業事務所</title>
  <meta name="description" content="${config.businessDescription ? config.businessDescription.slice(0, 120) : `${config.businessName}。相続・不動産登記・法人設立など幅広い法務手続きをサポート。初回相談無料。`}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${googleFontsLink}
  ${jsonLdHtml}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #1a2744;
      --navy-dark: #0f1a32;
      --navy-mid: #243356;
      --gold: #b8960c;
      --gold-light: #d4b44a;
      --accent: ${primary};
      --bg: #f7f6f3;
      --white: #ffffff;
      --text: #2c2c2c;
      --muted: #6b6b6b;
      --border: #e0ddd8;
      --section-pad: clamp(4.5rem, 9vw, 8rem);
      --container: 1000px;
      --gutter: clamp(1.25rem, 5vw, 5rem);
    }
    html { scroll-behavior: smooth; }
    body { font-family: ${bodyFont}; background: var(--bg); color: var(--text); overflow-x: hidden; font-size: ${bodySize}; line-height: ${bodyLineHeight}; }

    /* ── NAV ─────────────────────────────────────────── */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem var(--gutter); display: flex; align-items: center; justify-content: space-between; transition: all 0.4s; }
    nav.scrolled { background: rgba(255,255,255,0.97); backdrop-filter: blur(20px); padding: 0.85rem var(--gutter); box-shadow: 0 1px 20px rgba(0,0,0,0.06); }
    .nav-logo { font-family: ${serifFont}; font-size: 1.1rem; color: var(--navy); text-decoration: none; letter-spacing: 0.08em; font-weight: 600; }
    .nav-links { display: flex; gap: 2.5rem; list-style: none; }
    .nav-links a { text-decoration: none; color: var(--muted); font-size: 0.82rem; letter-spacing: 0.05em; transition: color 0.3s; }
    .nav-links a:hover { color: var(--navy); }
    .nav-cta { display: inline-flex; align-items: center; padding: 0.6rem 1.4rem; background: var(--navy); color: #fff; font-size: 0.78rem; text-decoration: none; font-weight: 500; letter-spacing: 0.05em; transition: all 0.3s; min-height: 44px; }
    .nav-cta:hover { background: var(--navy-dark); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 0.5rem; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; }
    .hamburger span { display: block; width: 20px; height: 1px; background: var(--navy); transition: all 0.3s; }
    .hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
    .mobile-menu { display: none; position: fixed; inset: 0; background: #fff; z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); }
    .mobile-menu.open { display: flex; transform: translateY(0); }
    .mobile-menu a { font-family: ${serifFont}; font-size: 1.5rem; color: var(--navy); text-decoration: none; min-height: 44px; display: flex; align-items: center; }

    /* ── HERO ─────────────────────────────────────────── */
    .hero { position: relative; min-height: 100vh; background: var(--navy-dark); display: flex; align-items: center; overflow: hidden; }
    .hero-pattern { position: absolute; inset: 0; opacity: 0.025; background-image: repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 60px); }
    .hero-accent-line { position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: linear-gradient(to bottom, var(--gold), transparent); }
    .hero-content { position: relative; z-index: 2; max-width: var(--container); margin: 0 auto; padding: 8rem var(--gutter) 5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
    .hero-tag { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: var(--gold-light); letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 2rem; opacity: 0; animation: fadeInUp 0.8s 0.3s forwards; }
    .hero-tag::before { content: ''; display: block; width: 28px; height: 1px; background: var(--gold); }
    .hero-headline { font-family: ${serifFont}; font-size: ${h1Size}; font-weight: 600; color: #fff; line-height: 1.35; margin-bottom: 1.25rem; letter-spacing: 0.04em; opacity: 0; animation: fadeInUp 0.8s 0.5s forwards; }
    .hero-sub { font-size: 1rem; color: rgba(255,255,255,0.52); margin-bottom: 1.25rem; letter-spacing: 0.05em; line-height: 1.7; opacity: 0; animation: fadeInUp 0.8s 0.7s forwards; }
    .hero-body { font-size: ${bodySize}; color: rgba(255,255,255,0.38); line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; opacity: 0; animation: fadeInUp 0.8s 0.9s forwards; }
    .hero-cta { display: inline-flex; align-items: center; padding: 1rem 2.5rem; border: 1px solid rgba(184,150,12,0.6); color: var(--gold-light); font-size: 0.82rem; text-decoration: none; letter-spacing: 0.1em; transition: all 0.4s; position: relative; overflow: hidden; min-height: 44px; opacity: 0; animation: fadeInUp 0.8s 1.1s forwards; }
    .hero-cta::before { content: ''; position: absolute; inset: 0; background: var(--gold); transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease; z-index: -1; }
    .hero-cta:hover { color: var(--navy-dark); border-color: var(--gold); }
    .hero-cta:hover::before { transform: scaleX(1); }
    .hero-trust { display: flex; flex-direction: column; gap: 1rem; }
    .trust-item { display: flex; align-items: flex-start; gap: 1.5rem; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); transition: all 0.3s; }
    .trust-item:hover { border-color: rgba(184,150,12,0.28); background: rgba(184,150,12,0.03); }
    .trust-icon { font-size: 1.5rem; flex-shrink: 0; }
    .trust-title { font-size: 0.84rem; font-weight: 600; color: rgba(255,255,255,0.8); margin-bottom: 0.2rem; }
    .trust-desc { font-size: 0.76rem; color: rgba(255,255,255,0.33); line-height: 1.6; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    /* ── SECTIONS ───────────────────────────────────── */
    section { padding: var(--section-pad) var(--gutter); }
    .section-inner { max-width: var(--container); margin: 0 auto; }
    .section-label { display: block; font-size: 0.65rem; color: var(--gold); letter-spacing: 0.38em; text-transform: uppercase; margin-bottom: 1rem; font-weight: 500; }
    .section-title { font-family: ${serifFont}; font-size: ${h2Size}; color: var(--navy); margin-bottom: 1.5rem; font-weight: 600; letter-spacing: 0.04em; line-height: 1.35; }
    .gold-rule { width: 40px; height: 2px; background: var(--gold); margin: 0 0 2.5rem; }

    /* ── SERVICES ACCORDION ─────────────────────────── */
    .services-bg { background: var(--white); }
    .services-list { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--border); margin-top: 0; }
    .service-item { border-bottom: 1px solid var(--border); }
    .service-item details summary { list-style: none; }
    .service-item details summary::-webkit-details-marker { display: none; }
    .service-summary { display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; padding: 1.75rem 0; cursor: pointer; transition: background 0.2s; }
    .service-summary:hover { background: rgba(26,39,68,0.02); }
    .service-summary-left { display: grid; grid-template-columns: 56px 1fr; gap: 1.25rem; align-items: start; }
    .service-summary-right { display: flex; align-items: center; gap: 1.5rem; flex-shrink: 0; }
    .service-num { font-family: ${serifFont}; font-size: 1.6rem; color: rgba(26,39,68,0.1); font-weight: 600; line-height: 1; padding-top: 4px; }
    .service-title { font-size: 1rem; font-weight: 600; color: var(--navy); margin-bottom: 0.3rem; letter-spacing: 0.03em; }
    .service-desc-short { color: var(--muted); font-size: 0.84rem; line-height: 1.7; }
    .service-price { font-size: 0.82rem; color: var(--gold); font-weight: 600; white-space: nowrap; letter-spacing: 0.05em; }
    .service-arrow { font-size: 0.55rem; color: var(--muted); transition: transform 0.3s; }
    details[open] .service-arrow { transform: rotate(180deg); }
    .service-detail { padding: 0 0 1.75rem 4.25rem; }
    .service-detail p { color: var(--muted); font-size: 0.87rem; line-height: ${bodyLineHeight}; border-left: 2px solid var(--gold); padding-left: 1.25rem; }

    /* ── FEE TABLE ──────────────────────────────────── */
    .fee-bg { background: var(--bg); }
    .fee-table { width: 100%; border-collapse: collapse; margin-top: 0; }
    .fee-table caption { font-size: 0.75rem; color: var(--muted); text-align: left; margin-bottom: 1rem; caption-side: bottom; padding-top: 0.75rem; letter-spacing: 0.03em; }
    .fee-table th { background: var(--navy); color: rgba(255,255,255,0.85); font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 1rem 1.5rem; text-align: left; }
    .fee-table td { padding: 1rem 1.5rem; font-size: 0.88rem; border-bottom: 1px solid var(--border); line-height: 1.65; }
    .fee-table tr:last-child td { border-bottom: none; }
    .fee-table tr:hover td { background: rgba(26,39,68,0.025); }
    .fee-price-cell { font-weight: 600; color: var(--navy); white-space: nowrap; }

    /* ── PROFILE ─────────────────────────────────────── */
    .profile-bg { background: var(--white); }
    .profile-grid { display: grid; grid-template-columns: 260px 1fr; gap: 4rem; align-items: start; }
    .profile-photo { width: 260px; aspect-ratio: 3/4; overflow: hidden; }
    .profile-photo img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(15%); }
    .profile-name-block { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); }
    .profile-name { font-family: ${serifFont}; font-size: 1.6rem; color: var(--navy); font-weight: 600; margin-bottom: 0.2rem; }
    .profile-role { font-size: 0.78rem; color: var(--gold); letter-spacing: 0.15em; text-transform: uppercase; }
    .profile-bio { color: var(--muted); font-size: ${bodySize}; line-height: ${bodyLineHeight}; }
    .profile-licenses { margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .license-tag { display: inline-block; padding: 0.3rem 0.85rem; border: 1px solid var(--border); color: var(--navy); font-size: 0.73rem; letter-spacing: 0.05em; }

    /* ── FLOW ─────────────────────────────────────────── */
    .flow-bg { background: var(--navy); }
    .flow-title-en { font-size: 0.65rem; color: var(--gold); letter-spacing: 0.38em; text-transform: uppercase; display: block; margin-bottom: 1rem; }
    .flow-title { font-family: ${serifFont}; font-size: ${h2Size}; color: #fff; margin-bottom: 0.5rem; font-weight: 600; letter-spacing: 0.04em; line-height: 1.35; }
    .flow-list { display: flex; flex-direction: column; gap: 0; margin-top: 3rem; position: relative; }
    .flow-list::before { content: ''; position: absolute; left: 27px; top: 40px; bottom: 40px; width: 1px; background: rgba(184,150,12,0.18); }
    .flow-step { display: grid; grid-template-columns: 56px 1fr; gap: 2rem; padding: 1.75rem 0; }
    .flow-num-box { width: 56px; height: 56px; border: 1px solid rgba(184,150,12,0.35); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--navy); }
    .flow-num-box span { font-family: ${serifFont}; font-size: 0.95rem; color: var(--gold-light); }
    .flow-step-title { font-size: 0.98rem; font-weight: 600; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.03em; }
    .flow-step-desc { font-size: 0.84rem; color: rgba(255,255,255,0.42); line-height: 1.85; }

    /* ── FAQ ─────────────────────────────────────────── */
    .faq-bg { background: var(--white); }
    .faq-list { margin-top: 0; }
    .faq-item { border-bottom: 1px solid var(--border); }
    .faq-item details summary { list-style: none; }
    .faq-item details summary::-webkit-details-marker { display: none; }
    .faq-q { display: flex; align-items: center; gap: 1rem; padding: 1.5rem 0; cursor: pointer; transition: color 0.3s; min-height: 60px; }
    .faq-q:hover { color: var(--navy); }
    .faq-label { width: 28px; height: 28px; border: 1px solid var(--border); display: inline-flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: var(--navy); flex-shrink: 0; }
    .faq-label.answer { border-color: rgba(184,150,12,0.4); color: var(--gold); }
    .faq-q > span:nth-child(2) { flex: 1; font-size: 0.9rem; color: var(--text); font-weight: 500; line-height: 1.55; }
    .faq-arrow { font-size: 0.55rem; color: var(--muted); transition: transform 0.3s; }
    details[open] .faq-arrow { transform: rotate(180deg); }
    .faq-a { display: flex; gap: 1rem; padding: 0 0 1.5rem 0; align-items: flex-start; }
    .faq-a p { color: var(--muted); font-size: 0.87rem; line-height: 1.95; flex: 1; }

    /* ── CTA ─────────────────────────────────────────── */
    .cta-bg { background: var(--navy-dark); border-top: 3px solid var(--gold); }
    .cta-inner { text-align: center; max-width: 620px; margin: 0 auto; }
    .cta-headline { font-family: ${serifFont}; font-size: clamp(1.8rem, 4vw, 2.8rem); color: #fff; font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.04em; line-height: 1.4; }
    .cta-body { color: rgba(255,255,255,0.48); font-size: ${bodySize}; line-height: ${bodyLineHeight}; margin-bottom: 2.5rem; }
    .cta-btn { display: inline-flex; align-items: center; justify-content: center; padding: 1.1rem 3.5rem; background: var(--gold); color: var(--navy-dark); font-size: 0.82rem; text-decoration: none; letter-spacing: 0.12em; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 20px rgba(184,150,12,0.28); min-height: 44px; }
    .cta-btn:hover { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(184,150,12,0.48); }
    .cta-tel { display: block; margin-top: 1.5rem; color: rgba(255,255,255,0.5); font-size: 0.82rem; letter-spacing: 0.05em; }
    .cta-tel a { color: var(--gold-light); text-decoration: none; font-family: ${serifFont}; font-size: 1.6rem; display: block; margin-top: 0.3rem; letter-spacing: 0.05em; }
    .cta-tel a:hover { text-decoration: underline; }

    /* ── SP FIXED CTA ─────────────────────────────────── */
    .sp-cta-bar { display: none; }

    /* ── FOOTER ─────────────────────────────────────── */
    footer { background: #080d1a; padding: 3rem var(--gutter); text-align: center; }
    .footer-logo { font-family: ${serifFont}; font-size: 1.2rem; color: rgba(255,255,255,0.58); margin-bottom: 0.5rem; letter-spacing: 0.08em; }
    .footer-copy { color: rgba(255,255,255,0.2); font-size: 0.7rem; letter-spacing: 0.05em; }

    /* ── ANIMATIONS ─────────────────────────────────── */
    .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.65s ease, transform 0.65s ease; }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ─────────────────────────────────── */
    @media (max-width: 768px) {
      nav { padding: 1rem 1.25rem; }
      nav.scrolled { padding: 0.75rem 1.25rem; }
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .hero-content { grid-template-columns: 1fr; padding: 6rem 1.5rem 3rem; gap: 2rem; }
      .hero-trust { display: none; }
      .profile-grid { grid-template-columns: 1fr; gap: 2rem; }
      .profile-photo { width: 100%; aspect-ratio: 3/4; }
      .service-summary { grid-template-columns: 1fr; }
      .service-summary-right { justify-content: space-between; }
      .fee-table { font-size: 0.82rem; }
      .fee-table th, .fee-table td { padding: 0.75rem 1rem; }
      section { padding: 4rem 1.25rem 5rem; }
      .sp-cta-bar {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
        background: rgba(15,26,50,0.97); border-top: 1px solid rgba(184,150,12,0.2);
        padding: 0.75rem 1.25rem; gap: 0.75rem;
      }
      .sp-cta-call { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem 1rem; border: 1px solid var(--gold); color: var(--gold-light); font-size: 0.8rem; text-decoration: none; min-height: 44px; }
      .sp-cta-reserve { flex: 2; display: flex; align-items: center; justify-content: center; padding: 0.85rem 1rem; background: var(--gold); color: var(--navy-dark); font-size: 0.82rem; text-decoration: none; font-weight: 700; min-height: 44px; letter-spacing: 0.05em; }
    }
  </style>
</head>
<body>
  <!-- NAV -->
  <nav id="nav" role="navigation" aria-label="メインナビゲーション">
    <a href="#" class="nav-logo" aria-label="${config.businessName} トップ">${config.businessName}</a>
    <ul class="nav-links" role="list">
      <li><a href="#services">業務案内</a></li>
      <li><a href="#profile">事務所概要</a></li>
      <li><a href="#flow">ご依頼の流れ</a></li>
      <li><a href="#faq">よくある質問</a></li>
    </ul>
    <a href="#cta" class="nav-cta">無料相談</a>
    <button class="hamburger" id="hamburger" aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileMenu">
      <span></span><span></span><span></span>
    </button>
  </nav>
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="モバイルメニュー">
    <a href="#services" onclick="closeMobileMenu()">業務案内</a>
    <a href="#profile" onclick="closeMobileMenu()">事務所概要</a>
    <a href="#flow" onclick="closeMobileMenu()">ご依頼の流れ</a>
    <a href="#faq" onclick="closeMobileMenu()">よくある質問</a>
    <a href="#cta" onclick="closeMobileMenu()">無料相談</a>
  </div>

  <!-- HERO -->
  <section class="hero" id="hero" aria-labelledby="hero-heading">
    <div class="hero-pattern" aria-hidden="true"></div>
    <div class="hero-accent-line" aria-hidden="true"></div>
    <div class="hero-content">
      <div>
        <span class="hero-tag">Law Office</span>
        <h1 class="hero-headline" id="hero-heading">${heroHeadline}</h1>
        <p class="hero-sub">${heroSub}</p>
        <p class="hero-body">${heroBody}</p>
        <a href="#cta" class="hero-cta">${heroCta}</a>
      </div>
      <div class="hero-trust fade-up" style="animation-delay:0.2s">
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">⚖️</span>
          <div><div class="trust-title">豊富な実績</div><div class="trust-desc">設立以来1,000件以上のご相談実績。複雑な案件にも確実に対応。</div></div>
        </div>
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">🔒</span>
          <div><div class="trust-title">守秘義務の徹底</div><div class="trust-desc">ご相談内容は厳重に管理。秘密は必ず守ります。</div></div>
        </div>
        <div class="trust-item">
          <span class="trust-icon" aria-hidden="true">📋</span>
          <div><div class="trust-title">明確な料金体系</div><div class="trust-desc">事前に丁寧に費用をご説明。追加費用は一切なし。</div></div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES (Accordion) -->
  <section class="services-bg" id="services" aria-labelledby="services-heading">
    <div class="section-inner">
      <span class="section-label">Services</span>
      <h2 class="section-title" id="services-heading">業務案内・料金の目安</h2>
      <div class="gold-rule"></div>
      <div class="services-list">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <!-- FEE TABLE -->
  <section class="fee-bg" id="fees" aria-labelledby="fees-heading">
    <div class="section-inner fade-up">
      <span class="section-label">Fee Schedule</span>
      <h2 class="section-title" id="fees-heading">主な業務の料金一覧</h2>
      <div class="gold-rule"></div>
      <table class="fee-table">
        <caption>※ 税込金額です。実費（登録免許税・公証費用等）は別途かかります。詳細はご相談時にご説明します。</caption>
        <thead>
          <tr>
            <th scope="col">業務内容</th>
            <th scope="col">報酬（目安）</th>
            <th scope="col">備考</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>合同会社設立</td>
            <td class="fee-price-cell">¥66,000〜</td>
            <td>定款作成・登記申請含む</td>
          </tr>
          <tr>
            <td>株式会社設立</td>
            <td class="fee-price-cell">¥88,000〜</td>
            <td>公証役場費用・登記申請含む</td>
          </tr>
          <tr>
            <td>相続登記</td>
            <td class="fee-price-cell">¥55,000〜</td>
            <td>不動産1件・単純な相続の場合</td>
          </tr>
          <tr>
            <td>遺産分割協議書作成</td>
            <td class="fee-price-cell">¥33,000〜</td>
            <td>相続人・財産の複雑さによる</td>
          </tr>
          <tr>
            <td>不動産売買登記</td>
            <td class="fee-price-cell">¥44,000〜</td>
            <td>所有権移転・抵当権設定</td>
          </tr>
          <tr>
            <td>初回相談（30分）</td>
            <td class="fee-price-cell" style="color:var(--gold)">無料</td>
            <td>電話・ビデオ通話可</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- PROFILE -->
  <section class="profile-bg" id="profile" aria-labelledby="profile-heading">
    <div class="section-inner">
      <span class="section-label">Profile</span>
      <h2 class="section-title" id="profile-heading">事務所・代表者紹介</h2>
      <div class="gold-rule"></div>
      <div class="profile-grid">
        <div class="profile-photo fade-up">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&q=80&fit=crop&crop=face" alt="代表プロフィール写真" width="400" height="533" loading="lazy" />
        </div>
        <div class="fade-up" style="animation-delay:0.15s">
          <div class="profile-name-block">
            <div class="profile-name">代表 〇〇 〇〇</div>
            <div class="profile-role">司法書士 / 行政書士</div>
          </div>
          <p class="profile-bio">${config.businessDescription}<br/><br/>お客様お一人おひとりの状況を丁寧にヒアリングし、最適な解決策をご提案します。法的手続きに不安を感じている方も、まずはお気軽にご相談ください。</p>
          <div class="profile-licenses" role="list" aria-label="資格・保有ライセンス">
            <span class="license-tag" role="listitem">司法書士</span>
            <span class="license-tag" role="listitem">行政書士</span>
            <span class="license-tag" role="listitem">土地家屋調査士</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FLOW (Timeline) -->
  <section class="flow-bg" id="flow" aria-labelledby="flow-heading">
    <div class="section-inner">
      <span class="flow-title-en">Process</span>
      <h2 class="flow-title" id="flow-heading">ご依頼の流れ</h2>
      <div class="flow-list" role="list">
        ${[
          ['ご相談・お問い合わせ', 'お電話またはメールフォームよりお気軽にご連絡ください。24時間受付。'],
          ['初回無料相談（30分）', 'ご状況のヒアリングと必要な手続き・費用をご説明します。'],
          ['お見積もり・ご契約', '費用を明確にご提示した上で、ご納得いただいた後にご契約。'],
          ['書類の収集・作成', '必要書類の収集も代行。お客様のご負担を最小限に。'],
          ['完了・アフターサポート', '手続き完了後も、ご不明な点はいつでもご相談いただけます。'],
        ].map(([title, desc], i) => `
        <div class="flow-step fade-up" role="listitem" style="animation-delay:${i * 0.1}s">
          <div class="flow-num-box" aria-label="ステップ ${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span></div>
          <div>
            <div class="flow-step-title">${title}</div>
            <p class="flow-step-desc">${desc}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq-bg" id="faq" aria-labelledby="faq-heading">
    <div class="section-inner">
      <span class="section-label">FAQ</span>
      <h2 class="section-title" id="faq-heading">よくある質問</h2>
      <div class="gold-rule"></div>
      <div class="faq-list">
        ${faqHtml}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-bg" id="cta" aria-labelledby="cta-heading">
    <div class="cta-inner fade-up">
      <h2 class="cta-headline" id="cta-heading">${ctaHeadline}</h2>
      <p class="cta-body">${ctaBody}</p>
      <a href="#cta" class="cta-btn">${ctaCta}</a>
      <p class="cta-tel">お急ぎの方はお電話でも受け付けています<a href="tel:${accessTel}">${accessTel}</a></p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>

  <!-- SP FIXED CTA -->
  <div class="sp-cta-bar" aria-label="スマートフォン用CTA">
    <a href="tel:${accessTel}" class="sp-cta-call">📞 電話相談</a>
    <a href="#cta" class="sp-cta-reserve">無料相談を予約</a>
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
    }), { threshold: 0.08 });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
  </script>
</body>
</html>`;
  },
};
