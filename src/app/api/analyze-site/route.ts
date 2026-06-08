import { NextRequest, NextResponse } from 'next/server';

export interface ToneAnalysis {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    headline: string;
    body: string;
  };
  styleKeywords: string[];   // e.g. ['luxury', 'dark', 'minimal']
  toneLabel: string;         // human-readable
  industryHint: string;      // detected industry hint
  businessNameHint: string;  // detected from title / meta
  catchphraseHint: string;   // detected tagline / hero headline
  rawDescription: string;    // AI summary of the site aesthetics
}

// ─── Color extraction helpers ───────────────────────────────────────────────

function extractHexColors(html: string): string[] {
  const hexRe = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  const rgbRe = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  const hexColors: string[] = html.match(hexRe) ?? [];

  const rgbColors: string[] = [];
  let m;
  while ((m = rgbRe.exec(html)) !== null) {
    const r = parseInt(m[1]).toString(16).padStart(2, '0');
    const g = parseInt(m[2]).toString(16).padStart(2, '0');
    const b = parseInt(m[3]).toString(16).padStart(2, '0');
    rgbColors.push(`#${r}${g}${b}`);
  }

  // Deduplicate and normalise to uppercase
  const all = [...hexColors, ...rgbColors]
    .map(c => c.toLowerCase())
    .filter(c => c !== '#fff' && c !== '#ffffff' && c !== '#000' && c !== '#000000');

  return [...new Set(all)].slice(0, 30);
}

function extractFontFamilies(html: string): string[] {
  const re = /font-family\s*:\s*([^;}"']+)/gi;
  const fonts: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim().split(',')[0].replace(/['"]/g, '').trim();
    if (raw && raw.length < 60) fonts.push(raw);
  }
  return [...new Set(fonts)].slice(0, 5);
}

function extractMetaText(html: string): { title: string; description: string } {
  const titleM = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descM = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return {
    title: titleM?.[1]?.trim() ?? '',
    description: descM?.[1]?.trim() ?? '',
  };
}

// ─── AI tone analysis ────────────────────────────────────────────────────────

async function analyzeWithAI(params: {
  htmlSnippet: string;
  title: string;
  description: string;
  colors: string[];
  fonts: string[];
  isImage: boolean;
  imageBase64?: string;
}): Promise<ToneAnalysis> {
  const openai = (await import('@/lib/openai')).default;

  const systemPrompt = `You are an expert web designer and brand analyst. Analyze the provided website information and return a JSON object with the site's visual tone and design characteristics.`;

  const userContent = params.isImage && params.imageBase64
    ? [
        {
          type: 'image_url' as const,
          image_url: { url: params.imageBase64, detail: 'low' as const },
        },
        {
          type: 'text' as const,
          text: buildAnalysisPrompt({ ...params, fromImage: true }),
        },
      ]
    : [{ type: 'text' as const, text: buildAnalysisPrompt({ ...params, fromImage: false }) }];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as ToneAnalysis;
}

function buildAnalysisPrompt(params: {
  htmlSnippet: string;
  title: string;
  description: string;
  colors: string[];
  fonts: string[];
  fromImage: boolean;
}): string {
  const colorList = params.colors.join(', ') || '不明';
  const fontList = params.fonts.join(', ') || '不明';

  const siteInfo = params.fromImage
    ? '（画像からの解析）'
    : `
サイトタイトル: ${params.title || '不明'}
メタ説明: ${params.description || '不明'}
抽出カラー: ${colorList}
抽出フォント: ${fontList}
HTMLスニペット（先頭3000字）:
${params.htmlSnippet}
`;

  return `以下のウェブサイト情報を解析して、トンマナ情報を日本語でJSONで返してください。

${siteInfo}

以下のJSON形式で返してください（コードブロック不要）：
{
  "colors": {
    "primary": "#xxxxxx（メインカラー）",
    "secondary": "#xxxxxx（サブカラー）",
    "accent": "#xxxxxx（アクセントカラー）",
    "background": "#xxxxxx（背景色）",
    "text": "#xxxxxx（テキスト色）"
  },
  "fonts": {
    "headline": "フォント名またはスタイル（serif/sans-serif等）",
    "body": "フォント名またはスタイル"
  },
  "styleKeywords": ["キーワード1", "キーワード2", "キーワード3"],
  "toneLabel": "人間が読めるトーン説明（例：高級感のあるモノトーン）",
  "industryHint": "推定業種（例：美容サロン）",
  "businessNameHint": "推定ビジネス名",
  "catchphraseHint": "サイトのキャッチコピーや印象的な文言",
  "rawDescription": "このサイトのデザインスタイルの詳細説明（100字程度）"
}`;
}

// ─── Fallback (no AI) ────────────────────────────────────────────────────────

function buildFallbackAnalysis(
  colors: string[],
  fonts: string[],
  title: string,
  description: string,
): ToneAnalysis {
  return {
    colors: {
      primary: colors[0] ?? '#333333',
      secondary: colors[1] ?? '#666666',
      accent: colors[2] ?? '#0066ff',
      background: '#ffffff',
      text: '#333333',
    },
    fonts: {
      headline: fonts[0] ?? 'sans-serif',
      body: fonts[1] ?? fonts[0] ?? 'sans-serif',
    },
    styleKeywords: ['モダン', 'クリーン'],
    toneLabel: 'モダン・シンプル',
    industryHint: '不明',
    businessNameHint: title.split(' ')[0] ?? '',
    catchphraseHint: description.slice(0, 60),
    rawDescription: 'サイトから抽出したカラー・フォントを基にトンマナを推定しました。',
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      url?: string;
      imageBase64?: string;  // data:image/...;base64,...
    };

    const apiKey = process.env.OPENAI_API_KEY ?? '';
    const hasAI = apiKey && !apiKey.startsWith('sk-dummy');

    // ── Image path ────────────────────────────────────────────────────────
    if (body.imageBase64) {
      if (!hasAI) {
        return NextResponse.json<ToneAnalysis>({
          colors: { primary: '#2d2d2d', secondary: '#555555', accent: '#e84393', background: '#ffffff', text: '#222222' },
          fonts: { headline: 'serif', body: 'sans-serif' },
          styleKeywords: ['ラグジュアリー', 'エレガント'],
          toneLabel: 'ラグジュアリー・エレガント',
          industryHint: '美容・サロン',
          businessNameHint: '',
          catchphraseHint: '',
          rawDescription: '画像から高級感のあるデザインが読み取れます。',
        });
      }
      const analysis = await analyzeWithAI({
        htmlSnippet: '',
        title: '',
        description: '',
        colors: [],
        fonts: [],
        isImage: true,
        imageBase64: body.imageBase64,
      });
      return NextResponse.json(analysis);
    }

    // ── URL path ──────────────────────────────────────────────────────────
    if (!body.url) {
      return NextResponse.json({ error: 'url or imageBase64 required' }, { status: 400 });
    }

    let html = '';
    try {
      const res = await fetch(body.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebcreBot/1.0)' },
        signal: AbortSignal.timeout(10000),
      });
      html = await res.text();
    } catch (err) {
      return NextResponse.json({ error: `URLの取得に失敗しました: ${String(err)}` }, { status: 422 });
    }

    const colors = extractHexColors(html);
    const fonts = extractFontFamilies(html);
    const { title, description } = extractMetaText(html);
    const htmlSnippet = html.slice(0, 3000);

    if (!hasAI) {
      return NextResponse.json(buildFallbackAnalysis(colors, fonts, title, description));
    }

    const analysis = await analyzeWithAI({
      htmlSnippet,
      title,
      description,
      colors,
      fonts,
      isImage: false,
    });

    return NextResponse.json(analysis);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
