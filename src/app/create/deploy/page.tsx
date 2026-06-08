'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store';
import {
  Globe, Check, ArrowLeft, Loader2, ExternalLink, Download,
  ChevronRight, X, AlertCircle, Sparkles, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectConfig } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
  editable?: boolean;
  value?: string;
  placeholder?: string;
  section?: string;
  hint?: string;
}

type DeployOption = 'webcre' | 'vercel' | 'html';
type DeployStep = 'checklist' | 'method' | 'done';

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildChecklist(config: Partial<ProjectConfig>): ChecklistItem[] {
  return [
    // ── 基本設定 ──
    {
      id: 'title',
      label: 'サイトタイトル設定済み',
      checked: Boolean(config.businessName),
      required: true,
      section: '基本設定',
    },
    {
      id: 'description',
      label: 'メタディスクリプション設定済み',
      checked: Boolean(config.businessDescription),
      required: true,
      section: '基本設定',
    },
    // ── SEO ──
    {
      id: 'seo_description',
      label: 'SEOメタディスクリプション（カスタム）',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: '120文字以内でサイトの説明を入力（例: 東京渋谷のヘアサロン...）',
      section: 'SEO設定',
      hint: '未入力の場合はビジネス概要を使用します',
    },
    {
      id: 'ogp',
      label: 'OGP画像URL',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://example.com/ogp.png (推奨: 1200×630px)',
      section: 'SEO設定',
    },
    {
      id: 'canonical',
      label: 'canonical URL（本番ドメイン）',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://yourdomain.com',
      section: 'SEO設定',
    },
    // ── アナリティクス ──
    {
      id: 'analytics',
      label: 'Google Analytics 4（GA4）',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'G-XXXXXXXXXX',
      section: 'アナリティクス',
      hint: '入力するとすべてのページにGA4タグが自動挿入されます',
    },
    // ── お問い合わせフォーム ──
    {
      id: 'contact_email',
      label: 'お問い合わせ先メール',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'contact@example.com',
      section: 'フォーム設定',
    },
    {
      id: 'formspree',
      label: 'Formspree ID（フォーム送信先）',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'xpzgjnrk または contact@example.com',
      section: 'フォーム設定',
      hint: 'formspree.io で無料取得。未入力の場合フォームUIのみ表示されます',
    },
    // ── 予約 ──
    {
      id: 'reservation_url',
      label: '予約サービスURL（Calendly等）',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://calendly.com/yourname',
      section: '予約機能',
      hint: 'Calendly / STORES予約 / Airリザーブ のURLを入力',
    },
    // ── SNS ──
    {
      id: 'sns_instagram',
      label: 'Instagram URL',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://instagram.com/yourprofile',
      section: 'SNS連携',
    },
    {
      id: 'sns_twitter',
      label: 'X (Twitter) URL',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://x.com/yourhandle',
      section: 'SNS連携',
    },
    {
      id: 'sns_facebook',
      label: 'Facebook URL',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://facebook.com/yourpage',
      section: 'SNS連携',
    },
    {
      id: 'sns_line',
      label: 'LINE URL',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://lin.ee/xxxxxxx',
      section: 'SNS連携',
    },
    {
      id: 'sns_youtube',
      label: 'YouTube URL',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'https://youtube.com/@yourchannel',
      section: 'SNS連携',
    },
    // ── その他 ──
    {
      id: 'ssl',
      label: 'SSL対応（自動）',
      checked: true,
      required: true,
      section: 'その他',
    },
    {
      id: 'domain',
      label: '独自ドメイン設定（任意）',
      checked: false,
      required: false,
      editable: true,
      value: '',
      placeholder: 'yourdomain.com',
      section: 'その他',
    },
  ];
}

// Build enhanced config from checklist values
function buildEnhancedConfig(
  baseConfig: Partial<ProjectConfig>,
  checklist: ChecklistItem[]
): Partial<ProjectConfig> {
  const get = (id: string) => checklist.find((i) => i.id === id)?.value?.trim() ?? '';

  return {
    ...baseConfig,
    contactEmail: get('contact_email') || undefined,
    formspreeId: get('formspree') || undefined,
    ga4Id: get('analytics') || undefined,
    reservationUrl: get('reservation_url') || undefined,
    seoMeta: {
      description: get('seo_description') || undefined,
      ogpImage: get('ogp') || undefined,
      canonicalUrl: get('canonical') || undefined,
    },
    snsLinks: {
      instagram: get('sns_instagram') || undefined,
      twitter: get('sns_twitter') || undefined,
      facebook: get('sns_facebook') || undefined,
      line: get('sns_line') || undefined,
      youtube: get('sns_youtube') || undefined,
    },
  };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DeployPage() {
  const router = useRouter();
  const { config, generatedSite, reset } = useWizardStore();

  const [step, setStep] = useState<DeployStep>('checklist');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [deployOption, setDeployOption] = useState<DeployOption>('html');
  const [vercelToken, setVercelToken] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setChecklist(buildChecklist(config));
  }, [config]);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id && !item.required ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateItemValue = (id: string, value: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, value, checked: value.trim().length > 0 }
          : item
      )
    );
  };

  const completedCount = checklist.filter((i) => i.checked).length;
  const requiredComplete = checklist.filter((i) => i.required).every((i) => i.checked);

  // Group checklist by section
  const sections = Array.from(new Set(checklist.map((i) => i.section ?? 'その他')));

  // ── HTML Download ──────────────────────────────────────────────────────────

  const handleHtmlDownload = async () => {
    setIsDownloading(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const businessName = config.businessName ?? 'site';
      const css = generatedSite?.css ?? '';
      const isMultiPage = !!(generatedSite?.pages && generatedSite.pages.length > 0);

      // Build enhanced config with Phase 3 values from checklist
      const enhancedConfig = buildEnhancedConfig(config, checklist) as ProjectConfig;

      if (isMultiPage && generatedSite?.pages) {
        // Re-generate pages with enhanced config if any Phase 3 fields are set
        const hasPhase3 = !!(
          enhancedConfig.formspreeId ||
          enhancedConfig.ga4Id ||
          enhancedConfig.reservationUrl ||
          (enhancedConfig.snsLinks && Object.values(enhancedConfig.snsLinks).some(Boolean)) ||
          (enhancedConfig.seoMeta && Object.values(enhancedConfig.seoMeta).some(Boolean))
        );

        let pages = generatedSite.pages;

        if (hasPhase3) {
          // Re-generate with enhanced config
          const { generateSiteContent } = await import('@/lib/ai/generator');
          const regenerated = await generateSiteContent(enhancedConfig);
          pages = regenerated.pages ?? generatedSite.pages;
        }

        for (const page of pages) {
          const fileName = page.slug === 'index' ? 'index.html' : `${page.slug}.html`;
          zip.file(fileName, page.html);
        }

        if (css) {
          zip.file('css/style.css', css);
        } else {
          zip.file('css/style.css', '/* styles are inlined in each HTML file */');
        }

        zip.folder('images');
        zip.file('images/README.txt', '画像ファイルをここに配置してください。\nPlace your image files here.');

        const pageList = pages
          .map((p) => `- ${p.slug === 'index' ? 'index.html' : `${p.slug}.html`} : ${p.title}`)
          .join('\n');

        zip.file('README.txt', `${businessName} - Generated by webcre
==============================================

このZIPファイルには以下が含まれています:
${pageList}
- css/style.css  : 共通スタイルシート
- images/        : 画像フォルダ

公開方法:
1. レンタルサーバーのFTPにアップロード
2. Netlify Drop (netlify.com/drop) にドラッグ&ドロップ
3. GitHub Pages にpush

${enhancedConfig.ga4Id ? `Google Analytics: ${enhancedConfig.ga4Id} が設定されています。` : ''}
${enhancedConfig.formspreeId ? `Formspree: ${enhancedConfig.formspreeId} が設定されています。` : ''}

Generated: ${new Date().toLocaleString('ja-JP')}
`);
      } else {
        // Single page LP
        const html = generatedSite?.html ?? '<h1>No content generated yet.</h1>';

        zip.file('index.html', html);

        if (css) {
          zip.file('style.css', css);
        } else {
          zip.file('style.css', '/* styles are inlined in index.html */');
        }

        zip.folder('images');
        zip.file('images/README.txt', '画像ファイルをここに配置してください。\nPlace your image files here.');

        zip.file('README.txt', `${businessName} - Generated by webcre
==============================================

このZIPファイルには以下が含まれています:
- index.html  : メインHTMLファイル
- style.css   : スタイルシート
- images/     : 画像フォルダ

公開方法:
1. レンタルサーバーのFTPにアップロード
2. Netlify Drop (netlify.com/drop) にドラッグ&ドロップ
3. GitHub Pages にpush

Generated: ${new Date().toLocaleString('ja-JP')}
`);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${businessName.replace(/\s+/g, '-')}-site.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Deploy ─────────────────────────────────────────────────────────────────

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    try {
      if (deployOption === 'html') {
        await handleHtmlDownload();
        setDeployUrl('downloaded');
        setStep('done');
        return;
      }

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: generatedSite?.id ?? Date.now().toString(),
          html: generatedSite?.html ?? '',
          config,
          option: deployOption,
          vercelToken: deployOption === 'vercel' ? vercelToken : undefined,
        }),
      });
      if (!response.ok) throw new Error('公開に失敗しました');
      const data = await response.json() as { deployUrl?: string };
      setDeployUrl(data.deployUrl ?? `https://${(config.businessName ?? 'mysite').toLowerCase().replace(/\s+/g, '-')}.webcre.app`);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsDeploying(false);
    }
  };

  // ── Done screen ────────────────────────────────────────────────────────────

  if (step === 'done') {
    const isDownload = deployUrl === 'downloaded';
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-30 animate-bounce"
              style={{
                width: `${Math.random() * 12 + 4}px`,
                height: `${Math.random() * 12 + 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'][i % 5],
                animationDuration: `${Math.random() * 2 + 1}s`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
            {isDownload ? (
              <Download className="w-10 h-10 text-white" />
            ) : (
              <Check className="w-10 h-10 text-white" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {isDownload ? 'ダウンロード完了！' : '公開完了！'}
          </h1>
          <p className="text-white/50 mb-6">
            {isDownload
              ? 'ZIPファイルをダウンロードしました。お好きなサービスにアップロードしてください。'
              : `${config.businessName ?? 'サイト'}が公開されました。`}
          </p>

          {!isDownload && deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 mb-6 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {deployUrl}
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </a>
          )}

          {isDownload && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left text-sm text-white/60 space-y-1.5">
              <p className="text-white/80 font-medium mb-2">次のステップ:</p>
              <p>1. Netlify Drop (<span className="text-purple-400">netlify.com/drop</span>) にドラッグ</p>
              <p>2. または FTP でサーバーにアップロード</p>
              <p>3. または GitHub Pages に push</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { reset(); router.push('/dashboard'); }}
              className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
            >
              ダッシュボードへ
            </button>
            <button
              onClick={() => { reset(); router.push('/create/wizard'); }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium"
            >
              新しいサイトを作る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checklist step ─────────────────────────────────────────────────────────

  if (step === 'checklist') {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col">
        <div className="border-b border-white/5 bg-[#0d1117]/90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              プレビューに戻る
            </button>
            <div className="text-white/40 text-xs">
              {completedCount} / {checklist.length} 完了
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">公開前チェックリスト</h1>
                <p className="text-white/40 text-sm">SEO・フォーム・SNSなどを設定して公開クオリティを高めましょう</p>
              </div>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-white/5 rounded-full mb-8 mt-4">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / checklist.length) * 100}%` }}
              />
            </div>

            {/* Checklist grouped by section */}
            <div className="space-y-6 mb-8">
              {sections.map((section) => {
                const sectionItems = checklist.filter((i) => (i.section ?? 'その他') === section);
                const sectionCompleted = sectionItems.filter((i) => i.checked).length;
                const isOpen = activeSection === section || activeSection === null;

                return (
                  <div key={section}>
                    <button
                      onClick={() => setActiveSection(activeSection === section ? null : section)}
                      className="w-full flex items-center justify-between mb-2 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{section}</span>
                        <span className="text-white/30 text-xs">{sectionCompleted}/{sectionItems.length}</span>
                      </div>
                      <span className="text-white/30 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </button>

                    {isOpen && (
                      <div className="space-y-2">
                        {sectionItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              'p-4 rounded-xl border transition-all',
                              item.checked
                                ? 'border-green-500/20 bg-green-500/5'
                                : 'border-white/10 bg-white/3'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleItem(item.id)}
                                disabled={item.required && item.checked}
                                className={cn(
                                  'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border',
                                  item.checked
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-white/20 hover:border-white/40'
                                )}
                              >
                                {item.checked && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={cn(
                                      'text-sm',
                                      item.checked ? 'text-white/70 line-through' : 'text-white'
                                    )}
                                  >
                                    {item.label}
                                  </span>
                                  {item.required && (
                                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex-shrink-0">
                                      必須
                                    </span>
                                  )}
                                </div>
                                {item.hint && (
                                  <p className="text-white/30 text-xs mt-0.5">{item.hint}</p>
                                )}
                                {item.editable && !item.required && (
                                  <input
                                    type="text"
                                    value={item.value ?? ''}
                                    onChange={(e) => updateItemValue(item.id, e.target.value)}
                                    placeholder={item.placeholder}
                                    className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-purple-500/50 placeholder:text-white/20 transition-colors"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!requiredComplete && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                必須項目が未完了です。ウィザードに戻って設定してください。
              </div>
            )}

            <button
              onClick={() => setStep('method')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all shadow-xl shadow-purple-500/25"
            >
              公開方法を選択
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Deploy method step ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      <div className="border-b border-white/5 bg-[#0d1117]/90 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center px-4 sm:px-6 h-14">
          <button
            onClick={() => setStep('checklist')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            チェックリストに戻る
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">公開方法を選択</h1>
              <p className="text-white/40 text-sm">お好みの方法でサイトを公開できます</p>
            </div>
          </div>

          {/* Option A: webcre subdomain */}
          <DeployOptionCard
            id="webcre"
            selected={deployOption === 'webcre'}
            onSelect={() => setDeployOption('webcre')}
            icon="🌐"
            title="ウェブクリサブドメイン"
            badge="おすすめ"
            description={`${(config.businessName ?? 'yoursite').toLowerCase().replace(/\s+/g, '-')}.webcre.app で即公開`}
            detail="ワンクリックで公開。独自ドメインへの変更も後から可能。"
          />

          {/* Option B: Vercel */}
          <DeployOptionCard
            id="vercel"
            selected={deployOption === 'vercel'}
            onSelect={() => setDeployOption('vercel')}
            icon="▲"
            title="Vercel / Netlify"
            description="既存のVercelアカウントにデプロイ"
            detail="APIトークンを入力してワンクリックデプロイ。"
          >
            {deployOption === 'vercel' && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <label className="block text-white/50 text-xs mb-1.5">Vercel APIトークン</label>
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="paste your Vercel token..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500/50 placeholder:text-white/20"
                />
                <p className="text-white/30 text-xs mt-1">
                  vercel.com/account/tokens からトークンを取得してください
                </p>
              </div>
            )}
          </DeployOptionCard>

          {/* Option C: HTML download */}
          <DeployOptionCard
            id="html"
            selected={deployOption === 'html'}
            onSelect={() => setDeployOption('html')}
            icon="📦"
            title="HTMLダウンロード"
            badge="最速"
            description="ZIPファイルとしてダウンロード"
            detail="index.html + style.css + imagesフォルダ。どこにでもアップロード可能。"
          />

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-4">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleDeploy}
            disabled={isDeploying || isDownloading || (deployOption === 'vercel' && !vercelToken)}
            className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all shadow-xl shadow-purple-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeploying || isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {deployOption === 'html' ? 'ダウンロード中...' : '公開中...'}
              </>
            ) : deployOption === 'html' ? (
              <>
                <Download className="w-5 h-5" />
                ZIPをダウンロード
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                今すぐ公開する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DeployOptionCard ──────────────────────────────────────────────────────────

interface DeployOptionCardProps {
  id: DeployOption;
  selected: boolean;
  onSelect: () => void;
  icon: string;
  title: string;
  badge?: string;
  description: string;
  detail: string;
  children?: React.ReactNode;
}

function DeployOptionCard({
  selected,
  onSelect,
  icon,
  title,
  badge,
  description,
  detail,
  children,
}: DeployOptionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-all mb-3',
        selected
          ? 'border-purple-500/50 bg-purple-500/10'
          : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
            selected ? 'border-purple-500 bg-purple-500' : 'border-white/30'
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-white font-medium text-sm">{title}</span>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                {badge}
              </span>
            )}
          </div>
          <p className="text-white/60 text-sm mt-0.5">{description}</p>
          <p className="text-white/30 text-xs mt-1">{detail}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
