import { NextRequest, NextResponse } from 'next/server';

interface CatchphraseInput {
  businessName: string;
  industry: string;
  lpPurpose: string;
  targetAudience: string;
  sellingPoints: string[];
  toneLabel?: string;
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as CatchphraseInput;
    const { businessName, industry, lpPurpose, targetAudience, sellingPoints, toneLabel } = input;

    const apiKey = process.env.OPENAI_API_KEY ?? '';
    const hasAI = apiKey && !apiKey.startsWith('sk-dummy') && !apiKey.startsWith('sk-ant');

    if (!hasAI) {
      // Fallback catchphrases
      return NextResponse.json({ catchphrases: [
        `${businessName}で、あなたの暮らしが変わる`,
        `選ばれ続ける理由が、ここにある`,
        `${targetAudience}に選ばれる、${businessName}`,
        `${lpPurpose}なら、${businessName}にお任せ`,
        `あなたの課題に、最高の答えを`,
      ]});
    }

    const openai = (await import('@/lib/openai')).default;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `以下の情報から、LP用キャッチコピーを5案生成してください。

ビジネス名: ${businessName}
業種: ${industry}
LP目的: ${lpPurpose}
ターゲット: ${targetAudience}
強み: ${sellingPoints.filter(Boolean).join('、')}
トーン: ${toneLabel || 'プロフェッショナル'}

## 要件
- 各コピー20〜40字程度
- ターゲットの感情に訴える
- 具体的なベネフィットを含む
- 業界の陳腐な表現を避ける
- 読んだ瞬間に行動したくなる言葉を選ぶ

## 出力形式
JSONオブジェクトのみ: {"catchphrases": ["コピー1", "コピー2", "コピー3", "コピー4", "コピー5"]}`
      }],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    let parsed: { catchphrases?: string[]; items?: string[] };
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const catchphrases = parsed.catchphrases ?? parsed.items ?? [];

    return NextResponse.json({ catchphrases });
  } catch (err) {
    console.error(err);
    // 429やその他エラー時もフォールバックを返す
    const { businessName, lpPurpose, targetAudience } = (await request.json().catch(() => ({}))) as Partial<CatchphraseInput>;
    return NextResponse.json({ catchphrases: [
      `${businessName || 'あなたのビジネス'}で、${targetAudience || 'お客様'}の毎日が変わる`,
      `選ばれ続ける理由が、ここにある`,
      `${lpPurpose || 'サービス'}なら、${businessName || 'わたしたち'}にお任せ`,
      `あなたの課題に、最高の答えを`,
      `一度体験すれば、もう手放せない`,
    ]}, { status: 200 });
  }
}
