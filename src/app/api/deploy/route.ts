import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId, html, css } = body;

    if (!siteId || !html) {
      return NextResponse.json({ error: 'siteId and html are required' }, { status: 400 });
    }

    // TODO: Deploy to Vercel / Supabase Storage
    // Simulate deployment
    const subdomain = `site-${siteId}-${Date.now().toString(36)}`;
    const deployUrl = `https://${subdomain}.webcre.app`;

    return NextResponse.json({
      success: true,
      deployUrl,
      message: '公開が完了しました！',
    });
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
