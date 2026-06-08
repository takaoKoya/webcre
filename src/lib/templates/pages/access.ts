import type { ProjectConfig } from '@/types';
import { generateSharedNav } from './shared';

export function generateAccessPage(
  config: ProjectConfig,
  texts: Record<string, unknown>,
  navigation: { label: string; href: string }[]
): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const t = texts as Record<string, Record<string, unknown>>;

  const address = (t.access?.address as string) ?? '東京都渋谷区〇〇1-2-3';
  const hours = (t.access?.hours as string) ?? '10:00 - 19:00（月曜定休）';
  const tel = (t.access?.tel as string) ?? '03-0000-0000';

  const sharedNav = generateSharedNav(config, navigation, 'access');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>アクセス | ${config.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <style>
    :root { --primary: ${primary}; }
    .access-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; align-items: start; margin-top: 2.5rem; }
    .map-placeholder { background: #e2e8f0; border-radius: 12px; height: 400px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 1rem; }
    .access-info { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; }
    .access-row { display: flex; gap: 1rem; padding: 1.25rem 0; border-bottom: 1px solid #f1f5f9; }
    .access-row:last-child { border-bottom: none; }
    .access-label { font-size: 0.7rem; color: var(--primary); letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; min-width: 60px; padding-top: 2px; }
    .access-val { color: #1e293b; font-size: 0.95rem; line-height: 1.7; }
    @media (max-width: 768px) { .access-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero">
    <span class="page-hero-tag">Access</span>
    <h1>アクセス・店舗情報</h1>
    <p>ご来店の際はこちらをご参照ください。</p>
  </div>
  <section class="content">
    <div class="access-grid">
      <div class="map-placeholder fade-in">
        <span>📍 地図が表示されます</span>
      </div>
      <div class="access-info fade-in" style="transition-delay:0.1s">
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:1.5rem;color:#0f172a">${config.businessName}</h2>
        <div class="access-row">
          <span class="access-label">住所</span>
          <span class="access-val">${address}</span>
        </div>
        <div class="access-row">
          <span class="access-label">営業時間</span>
          <span class="access-val">${hours}</span>
        </div>
        <div class="access-row">
          <span class="access-label">電話</span>
          <span class="access-val"><a href="tel:${tel}" style="color:var(--primary);text-decoration:none;font-weight:600">${tel}</a></span>
        </div>
        <div class="access-row">
          <span class="access-label">アクセス</span>
          <span class="access-val">最寄り駅より徒歩5分</span>
        </div>
        <a href="contact.html" style="display:block;margin-top:1.5rem;padding:0.8rem;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.85rem;text-align:center">お問い合わせ・予約はこちら</a>
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
