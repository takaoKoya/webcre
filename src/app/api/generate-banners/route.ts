import { NextRequest, NextResponse } from 'next/server';

interface BannerInput {
  businessName: string;
  catchphrase: string;
  cvButtonText: string;
  primaryColor: string;
  accentColor: string;
  industry: string;
  heroImage?: string;
}

const BANNER_SIZES = [
  { id: 'instagram_square', name: 'Instagram 正方形', w: 1080, h: 1080, platform: 'Instagram' },
  { id: 'instagram_story', name: 'Instagram/TikTok ストーリー', w: 1080, h: 1920, platform: 'Instagram/TikTok' },
  { id: 'twitter', name: 'X (Twitter) タイムライン', w: 1200, h: 675, platform: 'X' },
  { id: 'line_banner', name: 'LINE 友だち追加', w: 1200, h: 628, platform: 'LINE' },
  { id: 'facebook', name: 'Facebook 投稿', w: 1200, h: 628, platform: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn 投稿', w: 1200, h: 627, platform: 'LinkedIn' },
  { id: 'google_leaderboard', name: 'Google 728×90', w: 728, h: 90, platform: 'Google広告' },
  { id: 'google_rectangle', name: 'Google 300×250', w: 300, h: 250, platform: 'Google広告' },
] as const;

type BannerSize = typeof BANNER_SIZES[number];

function generateBannerHTML(input: BannerInput, size: BannerSize): string {
  const { businessName, catchphrase, cvButtonText, primaryColor, accentColor, heroImage } = input;
  const isVertical = size.h > size.w;
  const isSmall = size.w <= 300;
  const isLeaderboard = size.id === 'google_leaderboard';

  const bgImage = heroImage ? `url('${heroImage}')` : 'none';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${size.w}px; height: ${size.h}px; overflow: hidden;
    font-family: "Noto Sans JP", -apple-system, sans-serif;
    background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
    position: relative;
  }
  .bg-image {
    position: absolute; inset: 0;
    background-image: ${bgImage};
    background-size: cover; background-position: center;
    opacity: 0.25;
  }
  .overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, ${primaryColor}cc, ${accentColor}99);
  }
  .content {
    position: relative; z-index: 2;
    display: flex; flex-direction: ${isLeaderboard ? 'row' : 'column'};
    align-items: center; justify-content: center;
    height: 100%; padding: ${isLeaderboard ? '8px 20px' : isSmall ? '16px' : '40px'};
    text-align: center; gap: ${isLeaderboard ? '8px' : '16px'};
  }
  .business-name {
    font-size: ${isLeaderboard ? '13px' : isSmall ? '18px' : isVertical ? '48px' : '36px'};
    font-weight: 900; color: white;
    letter-spacing: -0.02em;
    white-space: ${isLeaderboard ? 'nowrap' : 'normal'};
    word-break: keep-all;
  }
  .catchphrase {
    font-size: ${isLeaderboard ? '11px' : isSmall ? '13px' : isVertical ? '28px' : '20px'};
    font-weight: 700; color: rgba(255,255,255,0.9);
    line-height: 1.4;
    display: ${isSmall || isLeaderboard ? 'none' : 'block'};
    word-break: keep-all;
  }
  .cta-btn {
    background: white; color: ${accentColor};
    font-weight: 800; font-size: ${isLeaderboard ? '12px' : isSmall ? '13px' : isVertical ? '24px' : '18px'};
    padding: ${isLeaderboard ? '6px 14px' : isSmall ? '8px 16px' : '14px 32px'};
    border-radius: 50px;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
  .hashtag {
    font-size: ${isLeaderboard ? '0' : isSmall ? '10px' : '14px'};
    color: rgba(255,255,255,0.6);
    display: ${isSmall || isLeaderboard ? 'none' : 'block'};
  }
</style>
</head>
<body>
  <div class="bg-image"></div>
  <div class="overlay"></div>
  <div class="content">
    <div class="business-name">${businessName}</div>
    <div class="catchphrase">${catchphrase}</div>
    <div class="cta-btn">${cvButtonText}</div>
    <div class="hashtag">#${businessName.replace(/\s/g, '')} #${input.industry}</div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as BannerInput;
    const banners = BANNER_SIZES.map(size => ({
      id: size.id,
      name: size.name,
      w: size.w,
      h: size.h,
      platform: size.platform,
      html: generateBannerHTML(input, size),
    }));
    return NextResponse.json({ banners });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
