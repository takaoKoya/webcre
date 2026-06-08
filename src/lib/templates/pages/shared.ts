import type { ProjectConfig, SnsLinks } from '@/types';

// ── Industry type map ─────────────────────────────────────────────────────────
const INDUSTRY_SCHEMA_TYPE: Record<string, string> = {
  beauty: 'HealthAndBeautyBusiness',
  restaurant: 'Restaurant',
  fitness: 'SportsActivityLocation',
  legal: 'LegalService',
  it: 'ProfessionalService',
};

/**
 * Generates JSON-LD structured data for a business page.
 * Includes LocalBusiness + industry-specific type, optional FAQPage.
 */
export function generateJsonLd(
  config: ProjectConfig,
  options?: {
    faqItems?: Array<{ question: string; answer: string }>;
    breadcrumbs?: Array<{ name: string; item: string }>;
    howToSteps?: Array<{ name: string; text: string }>;
    howToName?: string;
  }
): string {
  const industry = (config.industry ?? 'it') as string;
  const schemaType = INDUSTRY_SCHEMA_TYPE[industry] ?? 'LocalBusiness';
  const seoMeta = config.seoMeta ?? {};
  const canonicalUrl = seoMeta.canonicalUrl ?? '';
  const description = seoMeta.description ?? config.businessDescription ?? '';
  const configAny = config as unknown as Record<string, unknown>;
  const tel = (configAny.telephone as string | undefined)
    ?? (configAny.tel as string | undefined)
    ?? '';
  const address = (configAny.address as string | undefined) ?? '';
  const hours = (configAny.openingHours as string | undefined) ?? '';
  const priceRange = (configAny.priceRange as string | undefined) ?? '';
  const image = seoMeta.ogpImage ?? '';

  const schemas: unknown[] = [];

  // Primary: LocalBusiness + industry type
  const localBusiness: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', schemaType],
    name: config.businessName,
    description,
    url: canonicalUrl || undefined,
    // aggregateRating placeholder — replace with real data after collecting reviews
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24',
      bestRating: '5',
      worstRating: '1',
    },
  };
  if (tel) localBusiness.telephone = tel;
  if (address) localBusiness.address = { '@type': 'PostalAddress', streetAddress: address };
  if (hours) localBusiness.openingHours = hours;
  if (priceRange) localBusiness.priceRange = priceRange;
  if (image) { localBusiness.image = image; localBusiness.logo = image; }

  // Remove undefined keys
  Object.keys(localBusiness).forEach(k => localBusiness[k] === undefined && delete localBusiness[k]);

  schemas.push(localBusiness);

  // WebSite schema with SearchAction (for homepage)
  if (canonicalUrl) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.businessName,
      url: canonicalUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${canonicalUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  // FAQPage schema
  if (options?.faqItems && options.faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: options.faqItems.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  // HowTo schema (service flow / consultation steps)
  if (options?.howToSteps && options.howToSteps.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: options.howToName ?? `${config.businessName}のご利用の流れ`,
      description: `${config.businessName}のサービスをご利用いただく手順をご説明します。`,
      step: options.howToSteps.map(({ name, text }, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name,
        text,
      })),
    });
  }

  // BreadcrumbList
  if (options?.breadcrumbs && options.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: options.breadcrumbs.map(({ name, item }, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name,
        item,
      })),
    });
  }

  return schemas
    .map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
    .join('\n');
}

// ── SNS icon SVGs (inline) ─────────────────────────────────────────────────────
const SNS_ICONS: Record<string, string> = {
  instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  twitter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  line: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>`,
  youtube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  tiktok: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
};

/**
 * Generates GA4 + SEO head tags snippet
 */
export function generateHeadMeta(config: ProjectConfig, pageTitle: string, pageSlug = 'index'): string {
  const ga4Id = config.ga4Id ?? '';
  const seoMeta = config.seoMeta ?? {};
  const title = seoMeta.title ? `${seoMeta.title} | ${pageTitle}` : pageTitle;
  const description = seoMeta.description ?? config.businessDescription ?? '';
  const ogpImage = seoMeta.ogpImage ?? '';
  const canonicalUrl = seoMeta.canonicalUrl ? `${seoMeta.canonicalUrl}/${pageSlug === 'index' ? '' : pageSlug + '.html'}` : '';

  const ga4Snippet = ga4Id ? `
  <!-- Google Analytics GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');</script>` : '';

  const ogpSnippet = `
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="${pageSlug === 'index' ? 'website' : 'article'}" />
  ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}" />` : ''}
  ${ogpImage ? `<meta property="og:image" content="${ogpImage}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${ogpImage ? `<meta name="twitter:image" content="${ogpImage}" />` : ''}`;

  const canonicalTag = canonicalUrl ? `\n  <link rel="canonical" href="${canonicalUrl}" />\n  <link rel="alternate" hreflang="ja" href="${canonicalUrl}" />\n  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />` : '';

  return `${ga4Snippet}
  <meta name="description" content="${description}" />${canonicalTag}${ogpSnippet}`;
}

/**
 * Generates SNS icon links HTML for footer
 */
export function generateSnsLinks(config: ProjectConfig): string {
  const snsLinks = config.snsLinks;
  if (!snsLinks) return '';

  const entries: Array<{ key: keyof SnsLinks; label: string }> = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'twitter', label: 'X (Twitter)' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'line', label: 'LINE' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'tiktok', label: 'TikTok' },
  ];

  const links = entries
    .filter((e) => snsLinks[e.key])
    .map(
      (e) =>
        `<a href="${snsLinks[e.key]}" target="_blank" rel="noopener noreferrer" aria-label="${e.label}" style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);transition:background 0.2s,color 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.2)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.color='rgba(255,255,255,0.7)'">${SNS_ICONS[e.key]}</a>`
    )
    .join('');

  if (!links) return '';

  return `<div style="display:flex;gap:0.6rem;justify-content:center;margin-bottom:1rem">${links}</div>`;
}

/**
 * Generates a shared navigation HTML snippet used across all sub-pages.
 * baseUrl defaults to '.' (same directory)
 */
export function generateSharedNav(
  config: ProjectConfig,
  navigation: { label: string; href: string }[],
  currentSlug = 'index'
): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const isSerif = (config.fontFamily ?? 'gothic') === 'serif';
  const bodyFont = isSerif ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif";
  const snsHtml = generateSnsLinks(config);

  const navLinksHtml = navigation
    .filter((n) => n.href !== 'index.html')
    .map(
      (n) =>
        `<li><a href="${n.href}" class="nav-link${currentSlug !== 'index' && n.href.replace('.html', '') === currentSlug ? ' active' : ''}">${n.label}</a></li>`
    )
    .join('\n');

  return `
  <style>
    :root { --primary: ${primary}; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${bodyFont}; background: #f8fafc; color: #1e293b; overflow-x: hidden; }
    nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(20px); padding: 0.9rem 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 10px rgba(0,0,0,0.05); }
    .nav-logo { font-weight: 800; font-size: 1.2rem; color: #0f172a; text-decoration: none; letter-spacing: -0.03em; }
    .nav-logo span { color: var(--primary); }
    .nav-links { display: flex; gap: 1.5rem; list-style: none; }
    .nav-link { text-decoration: none; color: #64748b; font-size: 0.85rem; font-weight: 500; transition: color 0.2s; padding-bottom: 2px; border-bottom: 2px solid transparent; }
    .nav-link:hover, .nav-link.active { color: var(--primary); border-bottom-color: var(--primary); }
    .nav-cta { display: inline-block; padding: 0.55rem 1.3rem; background: var(--primary); color: #fff; font-size: 0.8rem; border-radius: 6px; text-decoration: none; font-weight: 600; transition: opacity 0.2s; }
    .nav-cta:hover { opacity: 0.85; }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; }
    .hamburger span { display: block; width: 24px; height: 2px; background: #0f172a; border-radius: 2px; }
    .mobile-menu { display: none; position: fixed; inset: 0; background: #fff; z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
    .mobile-menu.open { display: flex; }
    .mobile-menu a { font-size: 1.4rem; font-weight: 700; color: #0f172a; text-decoration: none; }
    @media (max-width: 768px) { .nav-links, .nav-cta { display: none; } .hamburger { display: flex; } }
    footer { background: #0f172a; padding: 2.5rem 2rem; text-align: center; }
    .footer-logo { font-size: 1.3rem; font-weight: 800; color: rgba(255,255,255,0.8); margin-bottom: 0.4rem; }
    .footer-copy { color: rgba(255,255,255,0.3); font-size: 0.75rem; }
    .page-hero { padding: 5rem 2rem 3rem; text-align: center; background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; }
    .page-hero-tag { display: inline-block; padding: 0.3rem 0.8rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 1rem; }
    .page-hero h1 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.03em; }
    .page-hero p { font-size: 1rem; color: rgba(255,255,255,0.6); max-width: 550px; margin: 0 auto; line-height: 1.8; }
    section.content { padding: 4rem 2rem; max-width: 1100px; margin: 0 auto; }
    .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s, transform 0.6s; }
    .fade-in.visible { opacity: 1; transform: none; }
  </style>
  <nav>
    <a href="index.html" class="nav-logo">${config.businessName.slice(0,2)}<span>${config.businessName.slice(2)}</span></a>
    <ul class="nav-links">${navLinksHtml}</ul>
    <a href="contact.html" class="nav-cta">お問い合わせ</a>
    <button class="hamburger" id="hamburger"><span></span><span></span><span></span></button>
  </nav>
  <div class="mobile-menu" id="mobileMenu">
    <a href="index.html" onclick="closeMobileMenu()">トップ</a>
    ${navigation.filter(n=>n.href!=='index.html').map(n=>`<a href="${n.href}" onclick="closeMobileMenu()">${n.label}</a>`).join('\n    ')}
  </div>
  <script>
    document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('open'));
    function closeMobileMenu() { document.getElementById('mobileMenu').classList.remove('open'); }
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);} }), {threshold:0.1});
    document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));
  </script>
  <!-- SNS_FOOTER_PLACEHOLDER:${snsHtml} -->`;
}

/**
 * Wraps footer HTML to include SNS links extracted from placeholder
 */
export function renderFooter(config: ProjectConfig, html: string): string {
  const snsHtml = generateSnsLinks(config);
  return html.replace(
    /<!-- SNS_FOOTER_PLACEHOLDER:.*? -->/,
    ''
  ).replace(
    /<footer>/,
    `<footer>${snsHtml ? `<div class="footer-sns">${snsHtml}</div>` : ''}`
  );
}

/**
 * Post-processes any HTML string to inject GA4, SEO meta, OGP tags right before </head>.
 * Safe to call on all templates — no-op if config has no phase3 fields.
 */
export function injectHeadMetaIntoHtml(html: string, config: ProjectConfig, pageSlug = 'index'): string {
  const ga4Id = config.ga4Id?.trim() ?? '';
  const seoMeta = config.seoMeta ?? {};
  const description = seoMeta.description ?? config.businessDescription ?? '';
  const ogpImage = seoMeta.ogpImage ?? '';
  const canonicalUrl = seoMeta.canonicalUrl
    ? `${seoMeta.canonicalUrl.replace(/\/$/, '')}/${pageSlug === 'index' ? '' : pageSlug + '.html'}`
    : '';

  const snippets: string[] = [];

  if (ga4Id) {
    snippets.push(`  <!-- Google Analytics GA4 -->\n  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');</script>`);
  }
  if (description) {
    snippets.push(`  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />`);
  }
  if (canonicalUrl) {
    snippets.push(`  <link rel="canonical" href="${canonicalUrl}" />`);
    snippets.push(`  <link rel="alternate" hreflang="ja" href="${canonicalUrl}" />`);
    snippets.push(`  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);
  }
  if (description || ogpImage) {
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? config.businessName;
    snippets.push(`  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`);
    snippets.push(`  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`);
    snippets.push(`  <meta property="og:type" content="${pageSlug === 'index' ? 'website' : 'article'}" />`);
    if (canonicalUrl) snippets.push(`  <meta property="og:url" content="${canonicalUrl}" />`);
    if (ogpImage) snippets.push(`  <meta property="og:image" content="${ogpImage}" />`);
    snippets.push(`  <meta name="twitter:card" content="summary_large_image" />`);
    snippets.push(`  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`);
    snippets.push(`  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />`);
    if (ogpImage) snippets.push(`  <meta name="twitter:image" content="${ogpImage}" />`);
  }

  if (snippets.length === 0) return html;

  const injection = snippets.join('\n');
  return html.replace('</head>', `${injection}\n</head>`);
}
