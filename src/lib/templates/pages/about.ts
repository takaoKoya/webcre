import type { ProjectConfig } from '@/types';
import { generateSharedNav } from './shared';

export function generateAboutPage(
  config: ProjectConfig,
  texts: Record<string, unknown>,
  navigation: { label: string; href: string }[]
): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

  const headline = (t.about?.headline as string) ?? '会社概要';
  const body = (t.about?.body as string) ?? config.businessDescription;

  const sharedNav = generateSharedNav(config, navigation, 'about');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>会社概要 | ${config.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <style>
    :root { --primary: ${primary}; }
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; margin-top: 2.5rem; }
    .about-visual { background: linear-gradient(135deg, #0f172a, #1e3a5f); border-radius: 16px; padding: 3rem; color: #fff; }
    .stat { margin-bottom: 2rem; }
    .stat-val { font-size: 2.5rem; font-weight: 800; color: var(--primary); line-height: 1; }
    .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 0.3rem; letter-spacing: 0.08em; }
    .about-text { }
    .about-text h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; color: #0f172a; letter-spacing: -0.03em; }
    .about-text p { color: #64748b; font-size: 0.95rem; line-height: 1.9; margin-bottom: 1.5rem; }
    .tag-label { display: inline-block; padding: 0.25rem 0.7rem; background: rgba(99,102,241,0.08); color: var(--primary); font-size: 0.7rem; border-radius: 4px; margin-bottom: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
    @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero">
    <span class="page-hero-tag">About Us</span>
    <h1>${headline}</h1>
    <p>${config.businessName}について、私たちのミッションと価値観をご紹介します。</p>
  </div>
  <section class="content">
    <div class="about-grid">
      <div class="about-visual fade-in">
        <div class="stat"><div class="stat-val">20+</div><div class="stat-label">Years of Experience</div></div>
        <div class="stat"><div class="stat-val">500+</div><div class="stat-label">Happy Clients</div></div>
        <div class="stat"><div class="stat-val">99%</div><div class="stat-label">Satisfaction Rate</div></div>
      </div>
      <div class="about-text fade-in" style="transition-delay:0.1s">
        <span class="tag-label">Company</span>
        <h2>${config.businessName}</h2>
        <p>${body}</p>
        <p>${config.businessDescription}</p>
        <a href="contact.html" style="display:inline-block;padding:0.8rem 2rem;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.85rem">お問い合わせはこちら</a>
      </div>
    </div>
  </section>
  <footer>
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}
