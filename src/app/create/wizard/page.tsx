'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { PlanSelector } from '@/components/wizard/PlanSelector';
import { IndustrySelector } from '@/components/wizard/IndustrySelector';
import { ToneSelector } from '@/components/wizard/ToneSelector';
import { ColorPicker } from '@/components/wizard/ColorPicker';
import { GoalSelector } from '@/components/wizard/GoalSelector';
import { toneColorMap, toneDefaultFont } from '@/lib/templates';
import type { SiteType, Industry, Tone, Goal, OptionalFeature, GeneratedSite, FontFamily, PageSlug } from '@/types';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'プランを選択', subtitle: '作りたいサイトの種類を選んでください' },
  2: { title: '業種を選択', subtitle: 'あなたのビジネスの業種を選んでください' },
  3: { title: 'デザインを選択', subtitle: 'サイトの雰囲気とカラーを選んでください' },
  4: { title: 'ターゲット・目標を設定', subtitle: '誰に届けて、何を達成したいかを選んでください' },
  5: { title: '基本情報を入力', subtitle: 'ビジネスの基本情報を入力してください' },
};

function validateStep(step: number, config: ReturnType<typeof useWizardStore.getState>['config']): string | null {
  switch (step) {
    case 1:
      if (!config.siteType) return 'プランを選択してください';
      break;
    case 2:
      if (!config.industry) return '業種を選択してください';
      break;
    case 3:
      if (!config.tone) return '雰囲気を選択してください';
      break;
    case 4:
      if (!config.goals || config.goals.length === 0) return '目標を1つ以上選択してください';
      break;
    case 5:
      if (!config.businessName?.trim()) return '事業名を入力してください';
      if (!config.businessDescription?.trim()) return 'ビジネスの説明を入力してください';
      break;
  }
  return null;
}

export default function WizardPage() {
  const router = useRouter();
  const { currentStep, config, nextStep, prevStep, updateConfig, setGeneratedSite } = useWizardStore();
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = async () => {
    const validationError = validateStep(currentStep, config);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (currentStep === 5) {
      // For website / full-package plans, go through sitemap → wireframe first
      if (config.siteType === 'website' || config.siteType === 'full-package') {
        router.push('/create/sitemap');
        return;
      }
      setIsGenerating(true);
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config }),
        });
        if (!response.ok) throw new Error('生成に失敗しました');
        const data = await response.json();
        setGeneratedSite({
          id: Date.now().toString(),
          config: config as GeneratedSite['config'],
          sections: data.sections,
          html: data.html,
          css: data.css,
          status: 'preview',
          createdAt: new Date().toISOString(),
          pages: data.pages,
          navigation: data.navigation,
        });
        router.push('/create/preview');
      } catch (err) {
        setError(err instanceof Error ? err.message : '生成中にエラーが発生しました');
        setIsGenerating(false);
      }
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep === 1) {
      router.push('/create');
    } else {
      prevStep();
    }
  };

  const handleToneChange = (tone: Tone) => {
    const colors = toneColorMap[tone];
    const defaultFont = toneDefaultFont[tone];
    updateConfig({ tone, colorPalette: colors, fontFamily: defaultFont });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Step header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {STEP_TITLES[currentStep].title}
          </h2>
          <p className="text-white/50">{STEP_TITLES[currentStep].subtitle}</p>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && (
              <PlanSelector
                selectedPlan={config.siteType as SiteType | undefined}
                selectedFeatures={(config.features ?? []) as OptionalFeature[]}
                selectedPages={(config.selectedPages ?? []) as PageSlug[]}
                onPlanChange={(plan) => updateConfig({ siteType: plan })}
                onFeaturesChange={(features) => updateConfig({ features })}
                onPagesChange={(pages) => updateConfig({ selectedPages: pages })}
              />
            )}

            {currentStep === 2 && (
              <IndustrySelector
                selected={config.industry as Industry | undefined}
                onChange={(industry) => updateConfig({ industry })}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <ToneSelector
                  selectedTone={config.tone as Tone | undefined}
                  onToneChange={handleToneChange}
                />
                <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                    フォントを選択
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        {
                          id: 'gothic' as FontFamily,
                          label: 'ゴシック体',
                          sub: 'Noto Sans JP',
                          desc: 'モダン・ポップ・コーポレート向け',
                          sample: 'あいうえお / Abc',
                          sampleClass: 'font-sans',
                        },
                        {
                          id: 'serif' as FontFamily,
                          label: '明朝体',
                          sub: 'Noto Serif JP',
                          desc: 'ナチュラル・ラグジュアリー・ミニマル向け',
                          sample: 'あいうえお / Abc',
                          sampleClass: 'font-serif',
                        },
                      ] as const
                    ).map((font) => {
                      const isSelected = (config.fontFamily ?? 'gothic') === font.id;
                      return (
                        <button
                          key={font.id}
                          onClick={() => updateConfig({ fontFamily: font.id })}
                          className={[
                            'relative p-4 rounded-xl border text-left transition-all duration-200',
                            isSelected
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                          ].join(' ')}
                        >
                          <div className={['text-2xl font-bold mb-2 text-white', font.sampleClass].join(' ')}>
                            {font.sample}
                          </div>
                          <div className="text-white font-semibold text-sm mb-0.5">{font.label}</div>
                          <div className="text-white/40 text-xs mb-1">{font.sub}</div>
                          <div className="text-white/50 text-xs">{font.desc}</div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current"><path d="M10 3L5 9 2 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {config.colorPalette && (
                  <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-white/3">
                    <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">
                      カラーをカスタマイズ（任意）
                    </h3>
                    <ColorPicker
                      label="メインカラー"
                      value={config.colorPalette.primary}
                      onChange={(color) =>
                        updateConfig({
                          colorPalette: { ...config.colorPalette!, primary: color },
                        })
                      }
                    />
                    <ColorPicker
                      label="サブカラー"
                      value={config.colorPalette.secondary}
                      onChange={(color) =>
                        updateConfig({
                          colorPalette: { ...config.colorPalette!, secondary: color },
                        })
                      }
                    />
                    <ColorPicker
                      label="アクセントカラー"
                      value={config.colorPalette.accent}
                      onChange={(color) =>
                        updateConfig({
                          colorPalette: { ...config.colorPalette!, accent: color },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <GoalSelector
                  selected={(config.goals ?? []) as Goal[]}
                  onChange={(goals) => updateConfig({ goals })}
                />
                <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">
                    ターゲット設定（任意）
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'ageRange', label: '年齢層', placeholder: '例：30〜50代' },
                      { key: 'gender', label: '性別', placeholder: '例：男女問わず' },
                      { key: 'region', label: '地域', placeholder: '例：東京都内' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="text-white/60 text-xs mb-1 block">{field.label}</label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={(config.targetAudience as Record<string, string> | undefined)?.[field.key] ?? ''}
                          onChange={(e) =>
                            updateConfig({
                              targetAudience: {
                                ageRange: '',
                                gender: '',
                                region: '',
                                ...(config.targetAudience ?? {}),
                                [field.key]: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50 focus:bg-white/8 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    事業名・店舗名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="例：スタイルサロン渋谷"
                    value={config.businessName ?? ''}
                    onChange={(e) => updateConfig({ businessName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    ビジネスの説明 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="例：渋谷駅徒歩3分のヘアサロンです。カット・カラー・パーマを中心に、お客様一人ひとりに合わせたスタイルをご提案します。"
                    value={config.businessDescription ?? ''}
                    onChange={(e) => updateConfig({ businessDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">
                    参考サイトURL（任意）
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={config.referenceUrl ?? ''}
                    onChange={(e) => updateConfig({ referenceUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <p className="text-white/30 text-xs mt-1">
                    デザインの参考にしたいサイトがあれば入力してください
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/8 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'トップに戻る' : '前のステップ'}
          </button>

          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {currentStep === 5 ? (
              isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AIで生成する
                </>
              )
            ) : (
              <>
                次のステップ
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
