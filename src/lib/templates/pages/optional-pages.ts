import type { ProjectConfig } from '@/types';
import { generateSharedNav, generateHeadMeta, generateSnsLinks } from './shared';

// ── Helper: build footer with SNS links ──────────────────────────────────────
function buildFooter(config: ProjectConfig): string {
  const snsHtml = generateSnsLinks(config);
  return `<footer>
    ${snsHtml ? `<div style="display:flex;gap:0.6rem;justify-content:center;margin-bottom:1rem">${snsHtml}</div>` : ''}
    <div class="footer-logo">${config.businessName}</div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} ${config.businessName}. All rights reserved.</p>
  </footer>`;
}

// ── Blog page ─────────────────────────────────────────────────────────────────
export function generateBlogPage(config: ProjectConfig, _texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const sharedNav = generateSharedNav(config, navigation, 'blog');
  const headMeta = generateHeadMeta(config, `ブログ・ニュース | ${config.businessName}`, 'blog');

  const industryPosts: Record<string, Array<{ title: string; date: string; tag: string; excerpt: string; imgId: string }>> = {
    beauty: [
      { title: '秋の髪色トレンド2025：人気カラーを徹底解説', date: '2025年2月10日', tag: 'トレンド', excerpt: '今季大注目のアッシュブラウンからテラコッタまで、旬のカラーレシピをご紹介します。', imgId: 'photo-1560066984-138dadb4c035' },
      { title: '傷んだ髪を復活させる！自宅でできるヘアケア5選', date: '2025年1月25日', tag: 'ヘアケア', excerpt: 'パサつきや切れ毛に悩む方必見。サロン品質のケアを自宅で再現する方法を公開。', imgId: 'photo-1522337360788-8b13dee7a37e' },
      { title: '新スタッフ紹介：ベテランスタイリストが加わりました', date: '2024年12月20日', tag: 'スタッフ', excerpt: '15年のキャリアを持つスタイリストが仲間に加わりました。得意なスタイルをご紹介します。', imgId: 'photo-1562322140-8baeececf3df' },
    ],
    restaurant: [
      { title: '春野菜特集：シェフが語る季節のおすすめ食材', date: '2025年3月5日', tag: '食材', excerpt: '春の訪れとともに旬を迎える野菜を使った新メニューを特集。シェフのこだわりを語ります。', imgId: 'photo-1504674900247-0877df9cc836' },
      { title: '記念日ディナーのご予約受付中：特別コース限定20席', date: '2025年2月1日', tag: 'お知らせ', excerpt: 'バレンタイン・記念日に最適なスペシャルコースをご用意しました。今すぐご予約を。', imgId: 'photo-1414235077428-338989a2e8c0' },
      { title: '地元農家との連携レポート：食材の産地を訪問しました', date: '2024年11月15日', tag: '農家訪問', excerpt: '野菜・果物の産地直送ルートを確立するために農家さんを取材。こだわりの秘密を探りました。', imgId: 'photo-1488459716781-31db52582fe9' },
    ],
    fitness: [
      { title: '3ヶ月で-10kg達成！会員様の体験談インタビュー', date: '2025年2月20日', tag: '体験談', excerpt: 'パーソナルトレーニングを活用して目標を達成したAさんのダイエット成功ストーリー。', imgId: 'photo-1517836357463-d25dfeac3438' },
      { title: '初心者向け：ジムで最初に取り組むべきトレーニング5種', date: '2025年1月30日', tag: 'トレーニング', excerpt: 'ジム通いを始めた方が知っておくべき基本メニューをトレーナーが丁寧に解説します。', imgId: 'photo-1534258936925-c58bed479fcb' },
      { title: '新マシン導入のお知らせ：パワーラック増設完了', date: '2024年12月10日', tag: 'お知らせ', excerpt: '会員の皆さまのご要望にお応えして、パワーラックを2台増設しました。快適にご利用ください。', imgId: 'photo-1574680096145-d05b474e2155' },
    ],
    it: [
      { title: 'DX推進レポート2025：中小企業のデジタル化最前線', date: '2025年3月1日', tag: 'レポート', excerpt: 'クライアント企業のDX事例を集約したレポートを公開。業務効率30%改善の秘訣を解説。', imgId: 'photo-1451187580459-43490279c0fa' },
      { title: 'ChatGPT活用術：業務自動化で月40時間削減した方法', date: '2025年2月5日', tag: 'AI活用', excerpt: '生成AIを使った業務プロセス改善の具体的な事例と実装ステップをご紹介します。', imgId: 'photo-1518770660439-4636190af475' },
      { title: '採用情報：エンジニア5名募集中（フルリモートOK）', date: '2025年1月20日', tag: '採用', excerpt: '急成長中のチームに加わりませんか？フルリモート勤務可能。経験者・未経験者ともに歓迎です。', imgId: 'photo-1461749280684-dccba630e2f6' },
    ],
    legal: [
      { title: '2025年 相続法改正のポイントを弁護士が解説', date: '2025年2月28日', tag: '法律情報', excerpt: '今年施行された相続法の改正内容と、遺言書や遺産分割への影響をわかりやすくまとめました。', imgId: 'photo-1589829545856-d10d557cf95f' },
      { title: '会社設立を考える方へ：法人化のメリット・デメリット', date: '2025年1月15日', tag: '会社設立', excerpt: '個人事業主から法人化するタイミングと、知っておくべき手続きを専門家が解説します。', imgId: 'photo-1450101499163-c8848c66ca85' },
      { title: '不動産トラブル実例集：こんな相談が増えています', date: '2024年12月5日', tag: '事例紹介', excerpt: '最近増加している不動産に関する法的トラブルの傾向と対処法をご紹介します。', imgId: 'photo-1486406146926-c627a92ad1ab' },
    ],
  };

  const defaultPosts = [
    { title: '新サービスのお知らせ', date: '2025年2月15日', tag: 'お知らせ', excerpt: 'このたび新しいサービスを開始しました。詳細はこちらをご覧ください。ぜひご活用ください。', imgId: 'photo-1499750310107-5fef28a66643' },
    { title: '年末年始の営業時間のご案内', date: '2025年1月5日', tag: 'お知らせ', excerpt: '年末年始の営業時間についてご案内いたします。ご不便をおかけして申し訳ありません。', imgId: 'photo-1454165804606-c3d57bc86b40' },
    { title: 'スタッフ紹介：新メンバーが加わりました', date: '2024年11月20日', tag: 'スタッフ', excerpt: '新しいスタッフが仲間に加わりました。豊富な経験を持つ頼もしいメンバーです。どうぞよろしく。', imgId: 'photo-1522202176988-66273c2fd55f' },
  ];

  const posts = industryPosts[config.industry] ?? defaultPosts;

  const postsHtml = posts.map((p, i) => `
    <article class="post-card fade-in" style="transition-delay:${i * 0.1}s">
      <div class="post-img">
        <img src="https://images.unsplash.com/${p.imgId}?w=600&q=80&fit=crop" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" loading="lazy" />
      </div>
      <div style="padding:1.5rem">
        <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.75rem">
          <span style="font-size:0.7rem;padding:0.2rem 0.6rem;background:rgba(99,102,241,0.08);color:var(--primary);border-radius:4px;font-weight:600">${p.tag}</span>
          <span style="color:#94a3b8;font-size:0.75rem">${p.date}</span>
        </div>
        <h3 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem;line-height:1.5">${p.title}</h3>
        <p style="color:#64748b;font-size:0.85rem;line-height:1.7">${p.excerpt}</p>
        <a href="#" style="display:inline-flex;align-items:center;gap:0.3rem;margin-top:1rem;font-size:0.8rem;color:var(--primary);font-weight:600;text-decoration:none">続きを読む <span>→</span></a>
      </div>
    </article>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ブログ・ニュース | ${config.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>
    :root { --primary: ${primary}; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 2.5rem; }
    .post-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: all 0.3s; }
    .post-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); transform: translateY(-3px); }
    .post-img { height: 200px; overflow: hidden; background: #e2e8f0; }
    .blog-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 2rem; }
    .blog-tag-btn { padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid #e2e8f0; background: #fff; font-size: 0.8rem; color: #64748b; cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .blog-tag-btn.active, .blog-tag-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    @media (max-width: 640px) { .blog-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero">
    <span class="page-hero-tag">Blog</span>
    <h1>ブログ・ニュース</h1>
    <p>最新情報をお届けします。</p>
  </div>
  <section class="content">
    <div class="blog-tags">
      <button class="blog-tag-btn active" onclick="filterPosts('all',this)">すべて</button>
      ${[...new Set(posts.map(p=>p.tag))].map(tag=>`<button class="blog-tag-btn" onclick="filterPosts('${tag}',this)">${tag}</button>`).join('')}
    </div>
    <div class="blog-grid" id="blogGrid">${postsHtml}</div>
  </section>
  ${buildFooter(config)}
  <script>
    function filterPosts(tag, btn) {
      document.querySelectorAll('.blog-tag-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.post-card').forEach(function(card){
        var cardTag = card.querySelector('span[style*="background"]') && card.querySelector('span[style*="0.08"]')?.textContent;
        if (tag === 'all' || (cardTag && cardTag.trim() === tag)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

// ── Gallery page ──────────────────────────────────────────────────────────────
export function generateGalleryPage(config: ProjectConfig, _texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const sharedNav = generateSharedNav(config, navigation, 'gallery');
  const headMeta = generateHeadMeta(config, `ギャラリー | ${config.businessName}`, 'gallery');

  const industryPhotos: Record<string, Array<{ id: string; alt: string; cat: string }>> = {
    beauty: [
      { id: 'photo-1560066984-138dadb4c035', alt: 'サロン内装', cat: '内装' },
      { id: 'photo-1522337360788-8b13dee7a37e', alt: 'カット施術', cat: '施術' },
      { id: 'photo-1562322140-8baeececf3df', alt: 'カラーリング', cat: '施術' },
      { id: 'photo-1519699047748-de8e457a634e', alt: 'スタイリング', cat: '仕上がり' },
      { id: 'photo-1582095133179-bfd08e2fb6b8', alt: 'ヘアアレンジ', cat: '仕上がり' },
      { id: 'photo-1595476108010-b4d1f102b1b1', alt: 'トリートメント', cat: '施術' },
      { id: 'photo-1504896226491-3f8c79bc0e0b', alt: 'スタイル1', cat: '仕上がり' },
      { id: 'photo-1527799820374-dcf8d9d4a388', alt: 'スタイル2', cat: '仕上がり' },
      { id: 'photo-1605497788044-5a32c7078486', alt: 'スタイル3', cat: '仕上がり' },
    ],
    restaurant: [
      { id: 'photo-1504674900247-0877df9cc836', alt: 'メイン料理', cat: '料理' },
      { id: 'photo-1414235077428-338989a2e8c0', cat: '料理', alt: 'ディナーコース' },
      { id: 'photo-1488459716781-31db52582fe9', alt: '季節の野菜', cat: '食材' },
      { id: 'photo-1467003909585-2f8a72700288', alt: '店内風景', cat: '店内' },
      { id: 'photo-1565299624946-b28f40a0ae38', alt: 'ピザ', cat: '料理' },
      { id: 'photo-1482049016688-2d3e1b311543', alt: 'ランチ', cat: '料理' },
      { id: 'photo-1540189549336-e6e99bdb6b7a', alt: 'サラダ', cat: '料理' },
      { id: 'photo-1476224203421-9ac39bcb3327', alt: 'デザート', cat: 'デザート' },
      { id: 'photo-1559386484-97dfc0e15539', alt: 'カフェ', cat: '店内' },
    ],
    fitness: [
      { id: 'photo-1517836357463-d25dfeac3438', alt: 'ウェイトトレーニング', cat: 'トレーニング' },
      { id: 'photo-1534258936925-c58bed479fcb', alt: 'フリーウェイト', cat: 'トレーニング' },
      { id: 'photo-1574680096145-d05b474e2155', alt: 'マシントレーニング', cat: 'マシン' },
      { id: 'photo-1571019614242-c5c5dee9f50b', alt: 'ランニング', cat: 'カーディオ' },
      { id: 'photo-1526506118085-60ce8714f8c5', alt: 'ヨガ', cat: 'ヨガ' },
      { id: 'photo-1545389336-cf090694435e', alt: 'ストレッチ', cat: 'ヨガ' },
      { id: 'photo-1541534741688-6078c6bfb5c5', alt: 'プール', cat: '施設' },
      { id: 'photo-1567013127542-490d757e51cd', alt: 'ロッカールーム', cat: '施設' },
      { id: 'photo-1593079831268-3381b0db4a77', alt: 'パーソナル指導', cat: 'トレーニング' },
    ],
    it: [
      { id: 'photo-1497366216548-37526070297c', alt: 'オフィス環境', cat: 'オフィス' },
      { id: 'photo-1497366811353-6870744d04b2', alt: 'チームワーク', cat: 'チーム' },
      { id: 'photo-1522071820081-009f0129c71c', alt: 'ミーティング', cat: 'チーム' },
      { id: 'photo-1518770660439-4636190af475', alt: '開発環境', cat: '開発' },
      { id: 'photo-1461749280684-dccba630e2f6', alt: 'コーディング', cat: '開発' },
      { id: 'photo-1504639725590-34d0984388bd', alt: 'プレゼンテーション', cat: 'チーム' },
      { id: 'photo-1551288049-bebda4e38f71', alt: 'データ分析', cat: '開発' },
      { id: 'photo-1560472354-b33ff0c44a43', alt: 'サーバールーム', cat: '開発' },
      { id: 'photo-1581091226825-a6a2a5aee158', alt: 'テクノロジー', cat: '開発' },
    ],
  };

  const defaultPhotos = [
    { id: 'photo-1497366216548-37526070297c', alt: '店舗外観', cat: '外観' },
    { id: 'photo-1497366811353-6870744d04b2', alt: '店舗内装', cat: '内装' },
    { id: 'photo-1522071820081-009f0129c71c', cat: '商品', alt: '商品1' },
    { id: 'photo-1560472354-b33ff0c44a43', alt: 'サービス1', cat: 'サービス' },
    { id: 'photo-1581091226825-a6a2a5aee158', alt: 'サービス2', cat: 'サービス' },
    { id: 'photo-1504639725590-34d0984388bd', alt: 'スタッフ', cat: 'スタッフ' },
    { id: 'photo-1551288049-bebda4e38f71', alt: '実績1', cat: '実績' },
    { id: 'photo-1541534741688-6078c6bfb5c5', alt: '実績2', cat: '実績' },
    { id: 'photo-1567013127542-490d757e51cd', alt: '実績3', cat: '実績' },
  ];

  const photos = industryPhotos[config.industry] ?? defaultPhotos;
  const cats = ['すべて', ...new Set(photos.map(p => p.cat))];

  const galleryHtml = photos.map((p, i) => `
    <div class="gallery-item fade-in" data-cat="${p.cat}" style="transition-delay:${i * 0.05}s" onclick="openLightbox('https://images.unsplash.com/${p.id}?w=1200&q=90&fit=crop','${p.alt}')">
      <img src="https://images.unsplash.com/${p.id}?w=400&q=80&fit=crop" alt="${p.alt}" loading="lazy" />
      <div class="gallery-overlay">
        <span class="gallery-zoom">🔍</span>
        <span class="gallery-cat-label">${p.cat}</span>
      </div>
    </div>`).join('');

  const filterBtns = cats.map((c, i) => `<button class="filter-btn${i === 0 ? ' active' : ''}" onclick="filterGallery('${c}',this)">${c}</button>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ギャラリー | ${config.businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>
    :root { --primary: ${primary}; }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 2rem 0 1.5rem; }
    .filter-btn { padding: 0.4rem 1.1rem; border-radius: 20px; border: 1px solid #e2e8f0; background: #fff; font-size: 0.8rem; color: #64748b; cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .filter-btn.active, .filter-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
    .gallery-item { position: relative; overflow: hidden; border-radius: 10px; background: #e2e8f0; aspect-ratio: 4/3; cursor: pointer; }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; display: block; }
    .gallery-item:hover img { transform: scale(1.07); }
    .gallery-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.3s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; }
    .gallery-item:hover .gallery-overlay { background: rgba(0,0,0,0.4); }
    .gallery-zoom { font-size: 1.5rem; opacity: 0; transition: opacity 0.3s; }
    .gallery-cat-label { font-size: 0.75rem; color: #fff; background: var(--primary); padding: 0.2rem 0.7rem; border-radius: 4px; opacity: 0; transition: opacity 0.3s; font-weight: 600; }
    .gallery-item:hover .gallery-zoom, .gallery-item:hover .gallery-cat-label { opacity: 1; }
    /* Lightbox */
    #lightbox { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; align-items: center; justify-content: center; flex-direction: column; }
    #lightbox.open { display: flex; }
    #lightbox img { max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 25px 80px rgba(0,0,0,0.5); }
    #lightboxCaption { color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-top: 1rem; }
    #lightboxClose { position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); border: none; color: #fff; font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: background 0.2s; }
    #lightboxClose:hover { background: rgba(255,255,255,0.2); }
    @media (max-width: 768px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .gallery-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero">
    <span class="page-hero-tag">Gallery</span>
    <h1>ギャラリー</h1>
    <p>実績・作品をご覧ください。</p>
  </div>
  <section class="content">
    <div class="filter-bar">${filterBtns}</div>
    <div class="gallery-grid" id="galleryGrid">${galleryHtml}</div>
  </section>
  <!-- Lightbox -->
  <div id="lightbox" onclick="closeLightbox(event)">
    <button id="lightboxClose" onclick="closeLightboxBtn()">✕</button>
    <img id="lightboxImg" src="" alt="" />
    <p id="lightboxCaption"></p>
  </div>
  ${buildFooter(config)}
  <script>
    function filterGallery(cat, btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gallery-item').forEach(function(item) {
        if (cat === 'すべて' || item.dataset.cat === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
    function openLightbox(src, alt) {
      var lb = document.getElementById('lightbox');
      document.getElementById('lightboxImg').src = src;
      document.getElementById('lightboxImg').alt = alt;
      document.getElementById('lightboxCaption').textContent = alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightboxBtn() {
      document.getElementById('lightbox').classList.remove('open');
      document.body.style.overflow = '';
    }
    function closeLightbox(e) {
      if (e.target === document.getElementById('lightbox')) closeLightboxBtn();
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightboxBtn();
    });
  </script>
</body>
</html>`;
}

// ── Pricing page ──────────────────────────────────────────────────────────────
export function generatePricingPage(config: ProjectConfig, texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;
  const sharedNav = generateSharedNav(config, navigation, 'pricing');
  const headMeta = generateHeadMeta(config, `料金プラン | ${config.businessName}`, 'pricing');

  const items = (t.pricing?.items as Array<Record<string, string>>) ?? [
    { title: 'ライトプラン', price: '¥5,000', description: '入門向けプラン。基本機能をお手軽にご利用いただけます。' },
    { title: 'スタンダードプラン', price: '¥10,000', description: '最も人気のプラン。ビジネスに必要な機能が揃っています。' },
    { title: 'プレミアムプラン', price: '¥20,000', description: '全機能フルアクセス。専任サポート付きで安心です。' },
  ];
  const cardsHtml = items.map((item, i) => `
    <div class="plan-card fade-in ${i===1?'featured':''}" style="transition-delay:${i*0.1}s">
      <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--primary);font-weight:600;margin-bottom:0.5rem">${item.title??''}</div>
      ${i===1?`<div style="display:inline-block;padding:0.2rem 0.6rem;background:var(--primary);color:#fff;font-size:0.65rem;border-radius:4px;font-weight:600;margin-bottom:0.75rem">人気No.1</div>`:''}
      <div style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:0.5rem">${item.price??''}<span style="font-size:0.8rem;font-weight:400;color:#64748b">/月</span></div>
      <p style="color:#64748b;font-size:0.85rem;line-height:1.7;margin-bottom:1.5rem">${item.description??''}</p>
      <a href="contact.html" style="display:block;padding:0.8rem;text-align:center;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.85rem;${i===1?`background:var(--primary);color:#fff`:`border:2px solid var(--primary);color:var(--primary)`}">このプランを選ぶ</a>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>料金 | ${config.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>:root{--primary:${primary}}.plans-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;margin-top:2.5rem}.plan-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:2rem;transition:all 0.3s}.plan-card.featured{border-color:var(--primary);box-shadow:0 0 0 2px var(--primary)}.plan-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,0.1)}</style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero"><span class="page-hero-tag">Pricing</span><h1>料金プラン</h1><p>目的に合わせてお選びください。</p></div>
  <section class="content"><div class="plans-grid">${cardsHtml}</div></section>
  ${buildFooter(config)}
</body>
</html>`;
}

// ── FAQ page ──────────────────────────────────────────────────────────────────
export function generateFaqPage(config: ProjectConfig, texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const t = texts as Record<string, Record<string, unknown> & { items?: Array<Record<string, string>> }>;
  const sharedNav = generateSharedNav(config, navigation, 'faq');
  const headMeta = generateHeadMeta(config, `よくある質問 | ${config.businessName}`, 'faq');

  const items = (t.faq?.items as Array<Record<string, string>>) ?? [
    { question: '初めての方でも利用できますか？', answer: 'はい、もちろんです。お気軽にお問い合わせください。' },
    { question: '料金はどのくらいかかりますか？', answer: 'プランによって異なります。まずはお問い合わせください。' },
    { question: '営業時間を教えてください。', answer: '平日10:00〜19:00です。詳しくはアクセスページをご確認ください。' },
    { question: 'キャンセルはできますか？', answer: '前日までにご連絡いただければキャンセル可能です。' },
  ];
  const faqHtml = items.map((item, i) => `
    <div class="faq-item fade-in" style="transition-delay:${i*0.08}s">
      <button class="faq-q" onclick="toggleFaq(this)">
        <span>Q. ${item.question??''}</span>
        <span class="arrow">▼</span>
      </button>
      <div class="faq-a">A. ${item.answer??''}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FAQ | ${config.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>:root{--primary:${primary}}.faq-wrap{max-width:720px;margin:2.5rem auto 0}.faq-item{border:1px solid #e2e8f0;border-radius:10px;margin-bottom:0.75rem;overflow:hidden}.faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;padding:1.2rem 1.5rem;background:#fff;border:none;cursor:pointer;font-size:0.95rem;font-weight:600;color:#0f172a;font-family:inherit;text-align:left;transition:background 0.2s}.faq-q:hover{background:#f8fafc}.faq-a{max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.3s;padding:0 1.5rem;color:#64748b;font-size:0.9rem;line-height:1.8;background:#fff}.faq-a.open{max-height:200px;padding:0 1.5rem 1.2rem}.arrow{color:var(--primary);transition:transform 0.3s}.arrow.open{transform:rotate(180deg)}</style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero"><span class="page-hero-tag">FAQ</span><h1>よくある質問</h1><p>お客様からよく寄せられるご質問をまとめました。</p></div>
  <section class="content"><div class="faq-wrap">${faqHtml}</div></section>
  ${buildFooter(config)}
  <script>
    function toggleFaq(btn) {
      var ans = btn.nextElementSibling;
      var arrow = btn.querySelector('.arrow');
      ans.classList.toggle('open');
      arrow.classList.toggle('open');
    }
  </script>
</body>
</html>`;
}

// ── Recruit page ──────────────────────────────────────────────────────────────
export function generateRecruitPage(config: ProjectConfig, _texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const sharedNav = generateSharedNav(config, navigation, 'recruit');
  const headMeta = generateHeadMeta(config, `採用情報 | ${config.businessName}`, 'recruit');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>採用情報 | ${config.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>:root{--primary:${primary}}.job-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:2rem;margin-bottom:1rem;transition:box-shadow 0.2s}.job-card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.06)}.job-tag{display:inline-block;padding:0.25rem 0.7rem;background:rgba(99,102,241,0.08);color:var(--primary);font-size:0.7rem;border-radius:4px;font-weight:600;margin-bottom:0.75rem}.job-detail-row{display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem;color:#64748b;font-size:0.82rem}</style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero"><span class="page-hero-tag">Recruit</span><h1>採用情報</h1><p>一緒に働く仲間を募集しています。</p></div>
  <section class="content">
    <div class="fade-in">
      <div class="job-card">
        <span class="job-tag">正社員</span>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem">スタッフ（正社員）</h3>
        <p style="color:#64748b;font-size:0.9rem;line-height:1.8">お客様に最高のサービスを提供するメンバーを募集中。経験・未経験問いません。成長できる環境をご用意しています。</p>
        <div class="job-detail-row">📅 応募締切：随時</div>
        <div class="job-detail-row">💰 給与：月給22万円〜（経験考慮）</div>
        <div class="job-detail-row">📍 勤務地：${config.businessName}本店</div>
      </div>
      <div class="job-card">
        <span class="job-tag">アルバイト</span>
        <h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem">スタッフ（アルバイト）</h3>
        <p style="color:#64748b;font-size:0.9rem;line-height:1.8">週3日〜OK。学生・主婦・副業OK。まずはお気軽にご応募ください。未経験でも丁寧に指導します。</p>
        <div class="job-detail-row">📅 応募締切：随時</div>
        <div class="job-detail-row">💰 時給：1,100円〜</div>
        <div class="job-detail-row">⏰ シフト制（週3日〜相談可）</div>
      </div>
      <div style="margin-top:2rem;padding:1.5rem;background:rgba(99,102,241,0.05);border-radius:12px;border:1px solid rgba(99,102,241,0.15)">
        <h3 style="font-size:1rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem">応募方法</h3>
        <p style="color:#64748b;font-size:0.9rem;line-height:1.8">お問い合わせフォームまたはメールにて「採用応募」と記載の上、ご応募ください。履歴書（写真付き）をお持ちください。</p>
        <div style="margin-top:1rem"><a href="contact.html" style="display:inline-block;padding:0.9rem 2.5rem;background:var(--primary);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">応募する</a></div>
      </div>
    </div>
  </section>
  ${buildFooter(config)}
</body>
</html>`;
}

// ── Privacy Policy page ───────────────────────────────────────────────────────
export function generatePrivacyPage(config: ProjectConfig, _texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const sharedNav = generateSharedNav(config, navigation, 'privacy');
  const headMeta = generateHeadMeta(config, `プライバシーポリシー | ${config.businessName}`, 'privacy');
  const year = new Date().getFullYear();
  const contactEmail = config.contactEmail ?? config.formspreeId ?? 'contact@example.com';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>プライバシーポリシー | ${config.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>:root{--primary:${primary}}.policy-wrap{max-width:720px;margin:2.5rem auto 0}.policy-section{margin-bottom:2rem}.policy-section h2{font-size:1.05rem;font-weight:700;color:#0f172a;margin-bottom:0.75rem;padding-left:0.75rem;border-left:3px solid var(--primary)}.policy-section p{color:#64748b;font-size:0.9rem;line-height:1.9}.policy-section ol,.policy-section ul{color:#64748b;font-size:0.9rem;line-height:1.9;padding-left:1.5rem}</style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero"><span class="page-hero-tag">Privacy</span><h1>プライバシーポリシー</h1><p>個人情報の取り扱いについて定めています。</p></div>
  <section class="content">
    <div class="policy-wrap fade-in">
      <div class="policy-section">
        <p style="margin-bottom:1rem">${config.businessName}（以下「当社」）は、お客様の個人情報の保護を重要な責務と認識し、以下のとおりプライバシーポリシーを定めます。</p>
      </div>
      <div class="policy-section">
        <h2>1. 個人情報の収集</h2>
        <p>当社は、お問い合わせフォーム、ご予約フォーム等を通じて、お名前・メールアドレス・電話番号等の個人情報を収集することがあります。</p>
      </div>
      <div class="policy-section">
        <h2>2. 個人情報の利用目的</h2>
        <ol>
          <li>お問い合わせ・ご予約への対応</li>
          <li>サービスのご案内・情報提供</li>
          <li>サービス改善のための統計分析</li>
          <li>法令に基づく対応</li>
        </ol>
      </div>
      <div class="policy-section">
        <h2>3. 個人情報の第三者提供</h2>
        <p>当社は、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。</p>
      </div>
      <div class="policy-section">
        <h2>4. 個人情報の安全管理</h2>
        <p>当社は、個人情報の漏洩・滅失・毀損を防止するため、適切なセキュリティ措置を講じます。</p>
      </div>
      <div class="policy-section">
        <h2>5. Cookieの使用</h2>
        <p>当サイトではGoogle Analytics等のサービス向上のためCookieを使用することがあります。ブラウザ設定にてCookieを無効にすることもできます。</p>
      </div>
      <div class="policy-section">
        <h2>6. 個人情報の開示・訂正・削除</h2>
        <p>ご自身の個人情報の開示・訂正・削除をご希望の場合は、下記のお問い合わせ先までご連絡ください。合理的な範囲で対応いたします。</p>
      </div>
      <div class="policy-section">
        <h2>7. プライバシーポリシーの変更</h2>
        <p>本ポリシーは予告なく変更する場合があります。変更後のポリシーは本ページに掲載した時点で効力を生じます。</p>
      </div>
      <div class="policy-section">
        <h2>8. お問い合わせ窓口</h2>
        <p>個人情報の取り扱いに関するご質問・ご要望は下記までご連絡ください。<br/>
        事業者名：${config.businessName}<br/>
        メール：<a href="mailto:${contactEmail}" style="color:var(--primary)">${contactEmail}</a><br/>
        お問い合わせ：<a href="contact.html" style="color:var(--primary)">お問い合わせページ</a></p>
      </div>
      <p style="color:#94a3b8;font-size:0.8rem;text-align:right;margin-top:2rem">${year}年制定 ${config.businessName}</p>
    </div>
  </section>
  ${buildFooter(config)}
</body>
</html>`;
}

// ── Tokushoho (特定商取引法) page ────────────────────────────────────────────
export function generateTokushohoPage(config: ProjectConfig, _texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const sharedNav = generateSharedNav(config, navigation, 'tokushoho');
  const headMeta = generateHeadMeta(config, `特定商取引法に基づく表示 | ${config.businessName}`, 'tokushoho');
  const contactEmail = config.contactEmail ?? config.formspreeId ?? 'contact@example.com';

  const rows = [
    ['販売事業者名', config.businessName],
    ['所在地', '〒000-0000 お問い合わせにてご案内します'],
    ['電話番号', 'お問い合わせフォームよりご連絡ください（公開請求には速やかに開示します）'],
    ['メールアドレス', contactEmail],
    ['販売価格', '各サービス・商品ページに記載の価格（税込）'],
    ['支払方法', '銀行振込・クレジットカード・その他（サービスによる）'],
    ['支払時期', 'お申込み確認後、請求書記載の期日までにお支払いください'],
    ['サービス提供時期', 'お申込み確認・入金確認後、速やかにご提供します'],
    ['返品・キャンセル', 'サービス提供前であれば、ご連絡いただいた日から3日以内にキャンセル可能です。提供開始後のキャンセルはお受けできません。'],
    ['特別条件', '詳細はお問い合わせください'],
  ];

  const tableHtml = rows.map(([key, value]) => `
    <tr>
      <th>${key}</th>
      <td>${value}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>特定商取引法 | ${config.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>:root{--primary:${primary}}.table-wrap{max-width:720px;margin:2.5rem auto 0;overflow-x:auto}.tokushoho-table{width:100%;border-collapse:collapse;font-size:0.9rem}.tokushoho-table th{width:35%;padding:0.9rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#374151;vertical-align:top;text-align:left}.tokushoho-table td{padding:0.9rem 1rem;border:1px solid #e2e8f0;color:#64748b;line-height:1.8;vertical-align:top}@media(max-width:600px){.tokushoho-table th{width:40%}}</style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero"><span class="page-hero-tag">Legal</span><h1>特定商取引法に基づく表示</h1><p>法律に基づき、販売事業者情報を表示します。</p></div>
  <section class="content">
    <div class="table-wrap fade-in">
      <table class="tokushoho-table">
        <tbody>${tableHtml}</tbody>
      </table>
    </div>
  </section>
  ${buildFooter(config)}
</body>
</html>`;
}

// ── Reservation page ──────────────────────────────────────────────────────────
export function generateReservationPage(config: ProjectConfig, _texts: Record<string, unknown>, navigation: { label: string; href: string }[]): string {
  const primary = config.colorPalette?.primary ?? '#6366f1';
  const sharedNav = generateSharedNav(config, navigation, 'reservation');
  const headMeta = generateHeadMeta(config, `ご予約 | ${config.businessName}`, 'reservation');
  const reservationUrl = config.reservationUrl?.trim() ?? '';
  const formspreeId = config.formspreeId?.trim() ?? '';

  let formAction = '#';
  if (formspreeId) {
    formAction = formspreeId.includes('@')
      ? `https://formspree.io/${formspreeId}`
      : `https://formspree.io/f/${formspreeId}`;
  }

  // If external URL provided, embed Calendly-style iframe or redirect button
  const externalWidget = reservationUrl
    ? `<div class="reservation-external fade-in">
        <h2 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin-bottom:1rem">オンライン予約</h2>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:1.5rem">下記のボタンから外部予約サービスにてご予約いただけます。</p>
        <a href="${reservationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 2.5rem;background:var(--primary);color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem;margin-bottom:1.5rem">
          📅 予約カレンダーを開く
        </a>
        ${reservationUrl.includes('calendly') ? `<div style="margin-top:1.5rem"><iframe src="${reservationUrl}" width="100%" height="600" frameborder="0" style="border-radius:12px;border:1px solid #e2e8f0"></iframe></div>` : ''}
      </div>`
    : '';

  const simpleForm = `
    <div class="reservation-form fade-in" style="${reservationUrl ? 'margin-top:3rem;padding-top:3rem;border-top:1px solid #e2e8f0' : ''}">
      <h2 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem">${reservationUrl ? '電話・フォームでのご予約' : 'ご予約フォーム'}</h2>
      <p style="color:#64748b;font-size:0.9rem;margin-bottom:1.5rem">ご希望の日時・内容をご記入ください。折り返しご連絡いたします。</p>
      <div class="form-success" id="reserveSuccess" style="display:none;text-align:center;padding:2rem">
        <div style="font-size:3rem;margin-bottom:1rem">✅</div>
        <h3 style="font-size:1.2rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem">予約リクエストを受け付けました</h3>
        <p style="color:#64748b;font-size:0.9rem">内容を確認の上、担当者よりご連絡いたします。</p>
      </div>
      <form id="reserveForm" action="${formAction}" method="post" novalidate>
        <input type="hidden" name="_subject" value="${config.businessName}へのご予約リクエスト" />
        <div class="form-group">
          <label class="form-label">お名前<span class="required">*必須</span></label>
          <input type="text" name="name" id="rName" class="form-input" placeholder="例：山田 太郎" autocomplete="name" required />
          <span class="form-error-msg" id="rErrName">お名前を入力してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">電話番号<span class="required">*必須</span></label>
          <input type="tel" name="phone" id="rPhone" class="form-input" placeholder="例：090-0000-0000" autocomplete="tel" required />
          <span class="form-error-msg" id="rErrPhone">電話番号を入力してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">メールアドレス<span class="required">*必須</span></label>
          <input type="email" name="email" id="rEmail" class="form-input" placeholder="例：example@mail.com" autocomplete="email" required />
          <span class="form-error-msg" id="rErrEmail">有効なメールアドレスを入力してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">ご希望日<span class="required">*必須</span></label>
          <input type="date" name="date" id="rDate" class="form-input" required />
          <span class="form-error-msg" id="rErrDate">ご希望日を選択してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">ご希望時間帯<span class="required">*必須</span></label>
          <select name="time" id="rTime" class="form-input" required>
            <option value="">選択してください</option>
            <option value="午前（10:00〜12:00）">午前（10:00〜12:00）</option>
            <option value="午後前半（13:00〜15:00）">午後前半（13:00〜15:00）</option>
            <option value="午後後半（15:00〜17:00）">午後後半（15:00〜17:00）</option>
            <option value="夕方（17:00〜19:00）">夕方（17:00〜19:00）</option>
          </select>
          <span class="form-error-msg" id="rErrTime">時間帯を選択してください</span>
        </div>
        <div class="form-group">
          <label class="form-label">ご要望・メモ<span class="optional">任意</span></label>
          <textarea name="notes" class="form-input form-textarea" placeholder="メニュー・ご希望など自由にご記入ください"></textarea>
        </div>
        <button type="submit" class="form-submit" id="reserveBtn">予約リクエストを送る</button>
        <p class="privacy-note">送信いただいた情報は<a href="privacy.html">プライバシーポリシー</a>に基づき管理します。</p>
      </form>
    </div>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ご予約 | ${config.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet" />${headMeta}
  <style>
    :root { --primary: ${primary}; }
    .reservation-wrap { max-width: 640px; margin: 2.5rem auto 0; }
    .form-group { margin-bottom: 1.5rem; }
    .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .required { color: #ef4444; font-size: 0.75rem; margin-left: 0.3rem; }
    .optional { color: #94a3b8; font-size: 0.75rem; margin-left: 0.3rem; }
    .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; font-family: inherit; outline: none; transition: border 0.2s, box-shadow 0.2s; }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .form-input.error { border-color: #ef4444; }
    .form-error-msg { display: none; color: #ef4444; font-size: 0.75rem; margin-top: 0.3rem; }
    .form-error-msg.show { display: block; }
    .form-textarea { resize: vertical; min-height: 100px; }
    .form-submit { width: 100%; padding: 0.9rem; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
    .form-submit:hover { opacity: 0.85; }
    .form-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .privacy-note { font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 1rem; }
    .privacy-note a { color: var(--primary); }
    .reservation-external { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; }
    .reservation-form { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; }
  </style>
</head>
<body>
  ${sharedNav}
  <div class="page-hero"><span class="page-hero-tag">Reservation</span><h1>ご予約</h1><p>お気軽にご予約ください。</p></div>
  <section class="content">
    <div class="reservation-wrap">
      ${externalWidget}
      ${simpleForm}
    </div>
  </section>
  ${buildFooter(config)}
  <script>
    (function() {
      var form = document.getElementById('reserveForm');
      var successBox = document.getElementById('reserveSuccess');
      if (!form) return;

      function validate() {
        var ok = true;
        var fields = [
          { id: 'rName', errId: 'rErrName', check: function(v){ return v.trim().length > 0; } },
          { id: 'rPhone', errId: 'rErrPhone', check: function(v){ return v.trim().length > 0; } },
          { id: 'rEmail', errId: 'rErrEmail', check: function(v){ return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v); } },
          { id: 'rDate', errId: 'rErrDate', check: function(v){ return v.trim().length > 0; } },
          { id: 'rTime', errId: 'rErrTime', check: function(v){ return v.trim().length > 0; } },
        ];
        fields.forEach(function(f) {
          var el = document.getElementById(f.id);
          var err = document.getElementById(f.errId);
          if (!f.check(el.value)) { el.classList.add('error'); err.classList.add('show'); ok = false; }
          else { el.classList.remove('error'); err.classList.remove('show'); }
        });
        return ok;
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validate()) return;
        ${formAction !== '#' ? `
        var btn = document.getElementById('reserveBtn');
        btn.disabled = true;
        btn.textContent = '送信中...';
        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function(res) {
          if (res.ok) {
            form.style.display = 'none';
            successBox.style.display = 'block';
          } else {
            btn.disabled = false;
            btn.textContent = '予約リクエストを送る';
            alert('送信に失敗しました。しばらく経ってから再度お試しください。');
          }
        }).catch(function() {
          btn.disabled = false;
          btn.textContent = '予約リクエストを送る';
          alert('通信エラーが発生しました。');
        });` : `
        alert('送信先が設定されていません。Formspree IDを設定してください。');`}
      });
    })();
  </script>
</body>
</html>`;
}
