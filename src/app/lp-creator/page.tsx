'use client';

import { useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import {
  Zap, Globe, Image as ImageIcon, Upload, ArrowRight, ArrowLeft,
  CheckCircle, AlertCircle, RefreshCw, Download, Palette,
  Sparkles, Target, MousePointerClick, Eye,
} from 'lucide-react';
import { useLPCreatorStore, type LPCreatorStep } from '@/lib/lp-creator-store';
import type { ToneAnalysis } from '@/app/api/analyze-site/route';
import type { LPInput } from '@/app/api/generate-lp-from-site/route';

// ─── Step indicator ─────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'サイト入力', icon: Globe },
  { num: 2, label: 'トンマナ確認', icon: Palette },
  { num: 3, label: 'LP詳細', icon: Sparkles },
  { num: 4, label: 'CVゴール', icon: Target },
  { num: 5, label: '生成・確認', icon: Eye },
];

function StepIndicator({ current }: { current: LPCreatorStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = s.num < current;
        const active = s.num === current;
        return (
          <div key={s.num} className="flex items-center">
            <div className={`flex flex-col items-center gap-1.5 min-w-[64px] ${active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-30'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'border-green-400 bg-green-400/20' : active ? 'border-purple-400 bg-purple-400/20' : 'border-white/20 bg-transparent'
              }`}>
                {done ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-white/40'}`} />}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-purple-300' : done ? 'text-green-300' : 'text-white/30'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 mb-5 ${done ? 'bg-green-400/50' : 'bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Input ──────────────────────────────────────────────────────────

function Step1() {
  const { inputMode, url, imageName, setInputMode, setUrl, setImage, setToneAnalysis, setAnalyzeLoading, setAnalyzeError, setStep, analyzeLoading, analyzeError, setBusinessName, setCatchphraseHint } = useLPCreatorStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string, file.name);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = useCallback(async () => {
    setAnalyzeError(null);
    setAnalyzeLoading(true);
    try {
      const body = inputMode === 'url'
        ? { url }
        : { imageBase64: useLPCreatorStore.getState().imageBase64 };

      const res = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error);
      }
      const tone = await res.json() as ToneAnalysis;
      setToneAnalysis(tone);
      if (tone.businessNameHint) setBusinessName(tone.businessNameHint);
      if (tone.catchphraseHint) setCatchphraseHint(tone.catchphraseHint);
      setStep(2);
    } catch (e) {
      setAnalyzeError(String(e));
    } finally {
      setAnalyzeLoading(false);
    }
  }, [inputMode, url, setAnalyzeError, setAnalyzeLoading, setToneAnalysis, setBusinessName, setCatchphraseHint, setStep]);

  const canProceed = inputMode === 'url' ? url.trim().length > 5 : useLPCreatorStore.getState().imageBase64.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">既存サイトのトンマナを読み込む</h2>
        <p className="text-white/50 text-sm">URLまたはスクリーンショット画像を入力してください</p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl border border-white/10 p-1 gap-1">
        {[
          { mode: 'url' as const, label: 'URLを入力', icon: Globe },
          { mode: 'image' as const, label: '画像をアップロード', icon: ImageIcon },
        ].map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              inputMode === mode ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {inputMode === 'url' ? (
        <div>
          <label className="block text-white/60 text-xs mb-2">既存サイトのURL</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://your-client-site.com"
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
            />
          </div>
          <p className="text-white/30 text-xs mt-2">※ 公開されているURLを入力してください。認証が必要なサイトは読み込めません。</p>
        </div>
      ) : (
        <div>
          <label className="block text-white/60 text-xs mb-2">スクリーンショット / ロゴ画像</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-8 rounded-xl border-2 border-dashed border-white/15 hover:border-purple-500/40 bg-white/[0.02] hover:bg-purple-500/5 text-white/50 hover:text-white/80 text-sm transition-all flex flex-col items-center gap-3"
          >
            <Upload className="w-6 h-6" />
            {imageName ? <span className="text-purple-300 font-medium">{imageName}</span> : <span>クリックして画像を選択</span>}
            <span className="text-white/30 text-xs">PNG / JPG / WEBP（最大5MB）</span>
          </button>
        </div>
      )}

      {analyzeError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-xs">{analyzeError}</p>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={analyzeLoading || !canProceed}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {analyzeLoading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />解析中...</>
        ) : (
          <>トンマナを解析する <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}

// ─── Step 2: Tone review ────────────────────────────────────────────────────

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-10 h-10 rounded-xl border border-white/20 shadow-sm" style={{ background: color }} />
      <span className="text-white/40 text-xs">{label}</span>
      <span className="text-white/60 text-xs font-mono">{color}</span>
    </div>
  );
}

function Step2() {
  const { toneAnalysis, setStep, setToneAnalysis } = useLPCreatorStore();

  if (!toneAnalysis) return null;
  const t = toneAnalysis;

  const editColor = (key: keyof ToneAnalysis['colors'], val: string) => {
    setToneAnalysis({ ...t, colors: { ...t.colors, [key]: val } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">解析されたトンマナ</h2>
        <p className="text-white/50 text-sm">AIが読み取ったデザインスタイルです。修正も可能です。</p>
      </div>

      {/* Tone label */}
      <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
        <p className="text-purple-300 text-sm font-semibold mb-1">{t.toneLabel}</p>
        <p className="text-white/50 text-xs leading-relaxed">{t.rawDescription}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {t.styleKeywords.map(kw => (
            <span key={kw} className="px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs">{kw}</span>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <p className="text-white/60 text-xs mb-3">カラーパレット（クリックして変更）</p>
        <div className="flex gap-4 flex-wrap">
          {(Object.entries(t.colors) as [keyof ToneAnalysis['colors'], string][]).map(([key, val]) => {
            const LABELS: Record<keyof ToneAnalysis['colors'], string> = {
              primary: 'プライマリ', secondary: 'セカンダリ', accent: 'アクセント',
              background: '背景', text: 'テキスト',
            };
            return (
              <div key={key} className="relative group">
                <ColorSwatch color={val} label={LABELS[key]} />
                <input
                  type="color"
                  value={val}
                  onChange={e => editColor(key, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title={`${LABELS[key]}を変更`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Fonts */}
      <div>
        <p className="text-white/60 text-xs mb-2">フォント</p>
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <p className="text-white/40 text-xs mb-1">見出し</p>
            <p className="text-white text-sm font-medium" style={{ fontFamily: t.fonts.headline }}>{t.fonts.headline}</p>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <p className="text-white/40 text-xs mb-1">本文</p>
            <p className="text-white text-sm" style={{ fontFamily: t.fonts.body }}>{t.fonts.body}</p>
          </div>
        </div>
      </div>

      {/* Industry hint */}
      {t.industryHint && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <div>
            <p className="text-white/40 text-xs">推定業種</p>
            <p className="text-white text-sm font-medium">{t.industryHint}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          <ArrowLeft className="w-4 h-4" />戻る
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          このトンマナで進める <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: LP details ─────────────────────────────────────────────────────

const LP_PURPOSE_OPTIONS = [
  'キャンペーン告知', '新商品・サービス発売', 'セミナー・イベント申込',
  '無料相談・資料請求', 'リクルート・採用', 'ECサイト商品LP', 'その他',
];

const INDUSTRY_OPTIONS = [
  { value: 'beauty', label: '美容・サロン' },
  { value: 'medical', label: '医療・クリニック' },
  { value: 'restaurant', label: '飲食・レストラン' },
  { value: 'fitness', label: 'フィットネス' },
  { value: 'legal', label: '法律・士業' },
  { value: 'realestate', label: '不動産' },
  { value: 'education', label: '教育・スクール' },
  { value: 'it', label: 'IT・テクノロジー' },
  { value: 'construction', label: '建設・工務店' },
  { value: 'retail', label: '小売・ショップ' },
  { value: 'other', label: 'その他' },
];

function Step3() {
  const {
    businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, industry,
    setBusinessName, setLpPurpose, setTargetAudience, setSellingPoint, setCatchphraseHint, setIndustry,
    toneAnalysis, setStep,
  } = useLPCreatorStore();

  const canNext = businessName.trim() && lpPurpose.trim() && targetAudience.trim()
    && sellingPoints.filter(s => s.trim()).length >= 1;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">LP詳細を入力</h2>
        <p className="text-white/50 text-sm">どんなLPを作りたいかを教えてください</p>
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">業種 <span className="text-red-400">*</span></label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setIndustry(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                industry === opt.value
                  ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">ビジネス名・ブランド名 <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          placeholder={toneAnalysis?.businessNameHint || '例: 山田クリニック'}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
        />
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">LPの目的 <span className="text-red-400">*</span></label>
        <div className="flex flex-wrap gap-2">
          {LP_PURPOSE_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setLpPurpose(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                lpPurpose === opt
                  ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {lpPurpose === 'その他' && (
          <input
            type="text"
            placeholder="目的を入力..."
            className="w-full mt-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
            onChange={e => setLpPurpose(e.target.value)}
          />
        )}
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">ターゲット層 <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={targetAudience}
          onChange={e => setTargetAudience(e.target.value)}
          placeholder="例: 30〜50代の女性、健康に関心の高い方"
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
        />
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">訴求ポイント（最大3つ） <span className="text-red-400">*</span></label>
        <div className="space-y-2">
          {([0, 1, 2] as const).map(i => (
            <div key={i} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs font-bold">0{i + 1}</span>
              <input
                type="text"
                value={sellingPoints[i]}
                onChange={e => setSellingPoint(i, e.target.value)}
                placeholder={['例: 創業20年の信頼と実績', '例: 完全個室でプライバシー配慮', '例: 業界最安値保証'][i]}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">キャッチコピーのヒント（任意）</label>
        <input
          type="text"
          value={catchphraseHint}
          onChange={e => setCatchphraseHint(e.target.value)}
          placeholder={toneAnalysis?.catchphraseHint || '例: 変わりたいあなたへ、最初の一歩を一緒に'}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
        />
        <p className="text-white/30 text-xs mt-1">AIが参考にしてキャッチコピーを生成します</p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          <ArrowLeft className="w-4 h-4" />戻る
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!canNext}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          次へ: CVゴールを設定 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: CV goal ────────────────────────────────────────────────────────

const CV_OPTIONS: { goal: LPInput['cvGoal']; label: string; icon: string; defaultCta: string }[] = [
  { goal: 'inquiry', label: 'お問い合わせ', icon: '✉️', defaultCta: 'お問い合わせはこちら' },
  { goal: 'reservation', label: '予約する', icon: '📅', defaultCta: '今すぐ予約する' },
  { goal: 'signup', label: '無料登録', icon: '🆓', defaultCta: '無料で始める' },
  { goal: 'download', label: '資料請求', icon: '📄', defaultCta: '資料を無料でもらう' },
  { goal: 'purchase', label: '購入・申込', icon: '🛒', defaultCta: '今すぐ購入する' },
  { goal: 'line', label: 'LINE登録', icon: '💬', defaultCta: 'LINEで相談する' },
  { goal: 'tel', label: '電話する', icon: '📞', defaultCta: '今すぐ電話する' },
];

function Step4() {
  const {
    cvGoal, cvButtonText, cvUrl, contactEmail,
    setCvGoal, setCvButtonText, setCvUrl, setContactEmail,
    setStep,
    businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, industry, toneAnalysis,
    setGeneratedHtml, setGenerateLoading, setGenerateError,
  } = useLPCreatorStore();

  const handleGenerate = useCallback(async () => {
    if (!toneAnalysis) return;
    setGenerateError(null);
    setGenerateLoading(true);

    const payload: LPInput = {
      tone: toneAnalysis,
      businessName,
      lpPurpose,
      targetAudience,
      sellingPoints: sellingPoints.filter(s => s.trim()) as [string, string, string],
      catchphraseHint,
      cvGoal,
      cvButtonText,
      cvUrl: cvUrl || undefined,
      contactEmail: contactEmail || undefined,
      industry,
    };

    try {
      const res = await fetch('/api/generate-lp-from-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error);
      }
      const { html } = await res.json() as { html: string };
      setGeneratedHtml(html);
      setStep(5);
    } catch (e) {
      setGenerateError(String(e));
    } finally {
      setGenerateLoading(false);
    }
  }, [toneAnalysis, businessName, lpPurpose, targetAudience, sellingPoints, catchphraseHint, cvGoal, cvButtonText, cvUrl, contactEmail, setGenerateError, setGenerateLoading, setGeneratedHtml, setStep]);

  const { generateLoading, generateError } = useLPCreatorStore();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">CVゴールを設定</h2>
        <p className="text-white/50 text-sm">LPで達成したいコンバージョンアクションを選んでください</p>
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-2">CV目標</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CV_OPTIONS.map(opt => (
            <button
              key={opt.goal}
              onClick={() => { setCvGoal(opt.goal); setCvButtonText(opt.defaultCta); }}
              className={`p-3 rounded-xl border text-left transition-all ${
                cvGoal === opt.goal
                  ? 'border-purple-500/60 bg-purple-500/15'
                  : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
              }`}
            >
              <div className="text-lg mb-1">{opt.icon}</div>
              <div className={`text-sm font-medium ${cvGoal === opt.goal ? 'text-purple-300' : 'text-white/70'}`}>{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/60 text-xs mb-1.5">CTAボタン文言</label>
        <div className="relative">
          <MousePointerClick className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={cvButtonText}
            onChange={e => setCvButtonText(e.target.value)}
            placeholder="例: 無料でお問い合わせ"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
          />
        </div>
      </div>

      {(cvGoal === 'purchase' || cvGoal === 'signup' || cvGoal === 'line' || cvGoal === 'reservation') && (
        <div>
          <label className="block text-white/60 text-xs mb-1.5">リンク先URL（任意）</label>
          <input
            type="url"
            value={cvUrl}
            onChange={e => setCvUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
          />
        </div>
      )}

      {(cvGoal === 'inquiry' || cvGoal === 'download') && (
        <div>
          <label className="block text-white/60 text-xs mb-1.5">問い合わせ受信メール（任意）</label>
          <input
            type="email"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            placeholder="contact@example.com"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
          />
        </div>
      )}

      {generateError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-xs">{generateError}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          <ArrowLeft className="w-4 h-4" />戻る
        </button>
        <button
          onClick={handleGenerate}
          disabled={generateLoading || !cvButtonText.trim()}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {generateLoading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AIがLP生成中...</>
          ) : (
            <><Sparkles className="w-4 h-4" />LPを生成する</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Preview ────────────────────────────────────────────────────────

function Step5() {
  const { generatedHtml, businessName, setStep, setGenerateLoading, setGenerateError, setGeneratedHtml,
    toneAnalysis, lpPurpose, targetAudience, sellingPoints, catchphraseHint, industry, cvGoal, cvButtonText, cvUrl, contactEmail } = useLPCreatorStore();
  const [previewFull, setPreviewFull] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${businessName || 'lp'}.html`;
    a.click();
  };

  const handleRegen = async () => {
    if (!toneAnalysis) return;
    setRegenLoading(true);
    const payload: LPInput = {
      tone: toneAnalysis,
      businessName,
      lpPurpose,
      targetAudience,
      sellingPoints: sellingPoints.filter(s => s.trim()) as [string, string, string],
      catchphraseHint,
      cvGoal,
      cvButtonText,
      cvUrl: cvUrl || undefined,
      contactEmail: contactEmail || undefined,
      industry,
    };
    try {
      const res = await fetch('/api/generate-lp-from-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const { html } = await res.json() as { html: string };
      setGeneratedHtml(html);
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">LP生成完了</h2>
          <p className="text-white/50 text-sm">プレビューを確認してダウンロードしてください</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegen}
            disabled={regenLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenLoading ? 'animate-spin' : ''}`} />
            再生成
          </button>
          <button
            onClick={() => setPreviewFull(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-xs transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            {previewFull ? '縮小' : 'フル表示'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            HTMLをDL
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className={`rounded-2xl overflow-hidden border border-white/10 ${previewFull ? 'fixed inset-4 z-50 bg-white' : 'w-full'}`}>
        {previewFull && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-white/10">
            <div className="flex gap-1.5">{['bg-red-500/70','bg-yellow-500/70','bg-green-500/70'].map(c=><div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`}/>)}</div>
            <span className="flex-1 text-center text-white/30 text-xs">{businessName}</span>
            <button onClick={() => setPreviewFull(false)} className="text-white/40 hover:text-white text-xs">閉じる</button>
          </div>
        )}
        <iframe
          srcDoc={generatedHtml}
          className={`w-full bg-white ${previewFull ? 'h-[calc(100vh-44px)]' : 'h-[500px]'}`}
          title="LP Preview"
          sandbox="allow-same-origin allow-forms"
        />
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-all">
          <ArrowLeft className="w-4 h-4" />設定に戻る
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />HTMLファイルをダウンロード
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function LPCreatorPage() {
  const { step } = useLPCreatorStore();

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-purple-600/6 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">ウェブクリ</span>
            <span className="text-white/20 text-sm">/</span>
            <span className="text-purple-300 text-sm font-medium">LP特化クリエイター</span>
          </Link>
          <Link href="/dashboard" className="text-white/40 hover:text-white text-xs transition-colors">
            ダッシュボードへ
          </Link>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 py-10">
        {/* Hero badge */}
        {step === 1 && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              既存サイトのトンマナを引き継いだLP生成
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">LP特化クリエイター</h1>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              クライアントのウェブサイトURLまたは画像を入力するだけで、
              そのブランドのトンマナにぴったり合ったLPをAIが自動生成します。
            </p>
          </div>
        )}

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Step content */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
        </div>
      </main>
    </div>
  );
}
