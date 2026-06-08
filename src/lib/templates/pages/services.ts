import type { ProjectConfig } from '@/types';
import { generateSharedNav } from './shared';

export function generateServicesPage(
  config: ProjectConfig,
  texts: Record<string, unknown>,
  navigation: { label: string; href: string }[]
): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;

  const headline = (t.services?.headline as string) ?? 'サービス/メニュー';
  const body = (t.services?.body as string) ?? '私たちが提供するサービスをご紹介します。';
  const items = (t.services?.items as Array<Record<string, string>>) ?? [
    { title: 'サービス 1', description: 'サービスの詳細説明がここに入ります。' },
    { title: 'サービス 2', description: 'サービスの詳細説明がここに入ります。' },
    { title: 'サービス 3', description: 'サービスの詳細説明がここに入ります。' },
  ];

  const sharedNav = generateSharedNav(config, navigation, 'services');

  const cardsHtml = items.map((item, i) => `
    <div class="service-card fade-in" style="transition-delay:${i * 0.1}s">
      <div class="service-num" style="color:var(--primary);opacity:0.3;font-size:2.5rem;font-weight:800;margin-bottom:0.75rem">${String(i + 1).padStart(2, '0')}</div>
      <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.6rem;color:#0f172a">${item.title ?? ''}</h3>
      <p style="color:#64748b;font-size:0.9rem;line-height:1.8">${item.description ?? ''}</p>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>サービス | ${config.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <style>
    :root { --primary: ${primary}; }
    .service-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; transition: all 0.3s; }
    .service-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); transform: translateY(-3px); border-color: var(--primary); }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero">
    <span class="page-hero-tag">Services</span>
    <h1>${headline}</h1>
    <p>${body}</p>
  </div>
  <section class="content">
    <div class="services-grid">${cardsHtml}</div>
  </section>
  <footer>
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}
