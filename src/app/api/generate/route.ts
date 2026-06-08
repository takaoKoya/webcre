import { NextRequest, NextResponse } from 'next/server';
import type { ProjectConfig } from '@/types';
import { generateSiteContent } from '@/lib/ai/generator';

export async function POST(request: NextRequest) {
  try {
    const body: { config: ProjectConfig } = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'config is required' }, { status: 400 });
    }

    const site = await generateSiteContent(config);

    return NextResponse.json({
      sections: site.sections,
      html: site.html,
      css: site.css,
      status: site.status,
      pages: site.pages,
      navigation: site.navigation,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
