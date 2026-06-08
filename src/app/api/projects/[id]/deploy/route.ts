import { NextRequest, NextResponse } from 'next/server';
import { updateProject } from '@/lib/projects';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const project = await updateProject(id, { status: 'published' });
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
