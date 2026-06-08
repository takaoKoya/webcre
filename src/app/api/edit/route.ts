import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      siteId?: string;
      sectionId?: string;
      instruction?: string;
      currentContent?: string;
      currentTitle?: string;
      sections?: Array<{ id: string; type: string; title: string; content: string; order: number }>;
    };

    const { sectionId, instruction, currentContent, currentTitle, sections } = body;

    const apiKey = process.env.OPENAI_API_KEY ?? '';
    const isDummy = !apiKey || apiKey === 'dummy-openai-key' || apiKey.startsWith('sk-dummy');

    if (!isDummy) {
      try {
        const openai = (await import('@/lib/openai')).default;

        if (sectionId && sectionId !== 'all' && currentContent !== undefined) {
          // Single section rewrite
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: '日本語のウェブサイトコンテンツを編集するアシスタントです。JSONフォーマットで返してください。',
              },
              {
                role: 'user',
                content: `以下のセクションを指示に従って書き直してください。
タイトル: ${currentTitle ?? ''}
現在のコンテンツ (JSON): ${currentContent ?? '{}'}
指示: ${instruction ?? 'より魅力的に書き直してください'}

JSON形式で {"title": "新しいタイトル", "content": "新しいコンテンツJSON文字列"} を返してください。`,
              },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1000,
          });

          const raw = completion.choices[0]?.message?.content ?? '{}';
          const result = JSON.parse(raw) as { title?: string; content?: string };
          return NextResponse.json({
            title: result.title ?? currentTitle,
            content: result.content ?? currentContent,
            message: `「${currentTitle}」セクションを修正しました。`,
          });
        }

        // Full site instruction
        if (sections && instruction) {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: '日本語のウェブサイトコンテンツを編集するアシスタントです。JSONフォーマットで返してください。',
              },
              {
                role: 'user',
                content: `以下のセクション一覧に対して指示を実行してください。
指示: ${instruction}
セクション: ${JSON.stringify(sections)}

変更後のセクション配列を {"sections": [...]} のJSON形式で返してください。変更が不要なセクションはそのまま含めてください。`,
              },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 2000,
          });

          const raw = completion.choices[0]?.message?.content ?? '{"sections":[]}';
          const result = JSON.parse(raw) as { sections?: typeof sections };
          return NextResponse.json({
            sections: result.sections ?? sections,
            message: `指示を実行しました: 「${instruction}」`,
          });
        }
      } catch (err) {
        console.warn('OpenAI edit failed, falling back to mock:', err);
      }
    }

    // ── Mock fallback ──
    if (sectionId && sectionId !== 'all') {
      // Single section mock: append "(修正済み)" to indicate change
      let newContent = currentContent ?? '{}';
      try {
        const parsed = JSON.parse(currentContent ?? '{}') as Record<string, unknown>;
        if (typeof parsed.headline === 'string') {
          parsed.headline = parsed.headline + '（修正済み）';
        } else if (typeof parsed.body === 'string') {
          parsed.body = parsed.body + '（AIが修正しました）';
        }
        newContent = JSON.stringify(parsed);
      } catch {
        newContent = currentContent ?? '{}';
      }

      return NextResponse.json({
        title: currentTitle ?? sectionId,
        content: newContent,
        message: `「${currentTitle ?? sectionId}」セクションを修正しました。（モック）`,
      });
    }

    // Full site mock: mark first matching section with instruction hint
    if (sections && instruction) {
      const updated = sections.map((s, i) => {
        if (i === 0) {
          try {
            const parsed = JSON.parse(s.content) as Record<string, unknown>;
            if (typeof parsed.headline === 'string') {
              parsed.headline = parsed.headline + '（修正済み）';
            }
            return { ...s, content: JSON.stringify(parsed) };
          } catch {
            return s;
          }
        }
        return s;
      });

      return NextResponse.json({
        sections: updated,
        message: `指示を実行しました: 「${instruction}」（モック）`,
      });
    }

    return NextResponse.json({ message: 'No changes made.' });
  } catch (error) {
    console.error('Edit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
