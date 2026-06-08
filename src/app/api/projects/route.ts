import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects } from '@/lib/projects';
import type { ProjectConfig } from '@/types';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') ?? 'dev-user';
  try {
    const projects = await listProjects(userId);
    return NextResponse.json({ projects });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') ?? 'dev-user';
  try {
    const body = await request.json();
    const { name, config, generatedSite } = body as {
      name: string;
      config: ProjectConfig;
      generatedSite?: never;
    };
    const project = await createProject(userId, name, config, generatedSite);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
