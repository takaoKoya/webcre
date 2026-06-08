'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store';
import { SitePreview } from '@/components/preview/SitePreview';
import { SortableSectionList } from '@/components/preview/SortableSectionList';
import type { GeneratedSite, GeneratedSection, SitePage } from '@/types';
import {
  Sparkles, ArrowLeft, ArrowRight, Loader2, Palette, Send,
  ChevronRight, X, Monitor, Tablet, Smartphone, Trash2, Layout, Plus,
  MoreHorizontal, Copy, CheckSquare, Square, Undo2, Redo2, Download,
} from 'lucide-react';
import { AddSectionModal } from '@/components/preview/AddSectionModal';
import { cn } from '@/lib/utils';

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type TabMode = 'sections' | 'edit' | 'chat';

const VIEW_SIZES: Record<ViewMode, { width: string; icon: React.ComponentType<{ className?: string }> }> = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

const SECTION_TYPE_OPTIONS: { type: GeneratedSection['type']; label: string; icon: string }[] = [
  { type: 'hero', label: 'ヒーロー', icon: '🦸' },
  { type: 'services', label: 'サービス', icon: '🛠️' },
  { type: 'about', label: '私たちについて', icon: '👥' },
  { type: 'gallery', label: 'ギャラリー', icon: '🖼️' },
  { type: 'pricing', label: '料金プラン', icon: '💰' },
  { type: 'testimonials', label: 'お客様の声', icon: '💬' },
  { type: 'cta', label: 'CTA/お問い合わせ', icon: '📣' },
  { type: 'access', label: 'アクセス', icon: '📍' },
  { type: 'faq', label: 'FAQ', icon: '❓' },
  { type: 'news', label: 'ニュース', icon: '📰' },
];

const DEFAULT_SECTION_CONTENT: Record<GeneratedSection['type'], object> = {
  hero: { headline: '新しいヒーローセクション', subheadline: 'サブタイトルをここに', body: '説明文をここに入力してください。', cta: '詳しく見る' },
  services: { headline: 'サービス', body: 'サービスの説明', items: [{ title: 'サービス1', description: '説明' }, { title: 'サービス2', description: '説明' }] },
  about: { headline: '私たちについて', body: '会社・店舗の説明をここに入力してください。' },
  gallery: { headline: 'ギャラリー', items: [] },
  pricing: { headline: '料金プラン', items: [{ title: 'スタンダード', price: '¥10,000', description: '説明' }] },
  testimonials: { headline: 'お客様の声', items: [{ name: 'お客様', comment: '素晴らしいサービスでした！' }] },
  cta: { headline: 'お問い合わせ', body: 'お気軽にご連絡ください。', cta: '今すぐ問い合わせ' },
  access: { headline: 'アクセス', address: '住所を入力', hours: '営業時間を入力', tel: '電話番号を入力' },
  faq: { headline: 'よくある質問', items: [{ question: '質問1', answer: '回答1' }] },
  news: { headline: 'ニュース', items: [{ title: '記事タイトル', date: '2025年1月1日', body: '記事の内容' }] },
};

// ── Device frame CSS classes ──────────────────────────────────────────────────

function DeviceFrame({ mode, children }: { mode: ViewMode; children: React.ReactNode }) {
  if (mode === 'desktop') return <>{children}</>;
  if (mode === 'tablet') {
    return (
      <div className="flex items-start justify-center pt-4 overflow-hidden h-full">
        <div className="relative flex-shrink-0" style={{ width: 800 }}>
          {/* Tablet bezel */}
          <div className="rounded-[28px] border-[10px] border-[#1e2330] shadow-2xl shadow-black/60 overflow-hidden bg-[#0d1117]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[#1e2330] rounded-b-full z-10" />
            {children}
          </div>
        </div>
      </div>
    );
  }
  // mobile
  return (
    <div className="flex items-start justify-center pt-4 overflow-hidden h-full">
      <div className="relative flex-shrink-0" style={{ width: 400 }}>
        {/* Phone bezel */}
        <div className="rounded-[40px] border-[12px] border-[#1e2330] shadow-2xl shadow-black/60 overflow-hidden bg-[#0d1117]">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1e2330] rounded-b-2xl z-10" />
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}

export default function PreviewPage() {
  const router = useRouter();
  const { config, generatedSite, setGeneratedSite, pushHistory, undo, redo, canUndo, canRedo } = useWizardStore();
  const [site, setSite] = useState<Partial<GeneratedSite> | null>(generatedSite);
  const [isGenerating, setIsGenerating] = useState(!generatedSite);
  const [error, setError] = useState<string | null>(null);

  const [selectedSection, setSelectedSection] = useState<GeneratedSection | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colors, setColors] = useState({
    primary: config.colorPalette?.primary ?? '#6366f1',
    secondary: config.colorPalette?.secondary ?? '#1e1b4b',
    accent: config.colorPalette?.accent ?? '#a5b4fc',
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [mobileTab, setMobileTab] = useState<TabMode>('sections');
  const [isAiRewriting, setIsAiRewriting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Multi-page state
  const [activePageId, setActivePageId] = useState<string>('index');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Page duplication state
  const [pageMenuOpen, setPageMenuOpen] = useState<string | null>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState<string | null>(null);
  const [dupName, setDupName] = useState('');
  const [dupSlug, setDupSlug] = useState('');
  const [showBulkDup, setShowBulkDup] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  // Iframe ref for scroll sync
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Sync store's generatedSite back to local state after undo/redo
  useEffect(() => {
    if (generatedSite && generatedSite !== site) {
      setSite(generatedSite);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedSite]);

  useEffect(() => {
    if (!config.businessName) {
      router.push('/create/wizard');
      return;
    }
    if (generatedSite) {
      setSite(generatedSite);
      setIsGenerating(false);
      if (generatedSite.config?.colorPalette) {
        setColors({
          primary: generatedSite.config.colorPalette.primary,
          secondary: generatedSite.config.colorPalette.secondary,
          accent: generatedSite.config.colorPalette.accent,
        });
      }
      return;
    }
    generateSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateSite = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!response.ok) throw new Error('生成に失敗しました');
      const data = await response.json();
      const newSite: Partial<GeneratedSite> = {
        id: Date.now().toString(),
        config: config as GeneratedSite['config'],
        sections: data.sections,
        html: data.html,
        css: data.css,
        status: 'preview',
        createdAt: new Date().toISOString(),
        pages: data.pages,
        navigation: data.navigation,
      };
      setSite(newSite);
      setGeneratedSite(newSite);
      pushHistory(newSite);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async () => {
    if (!site?.pages && !site?.html) return;
    setIsDownloading(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add HTML pages
      if (site.pages && site.pages.length > 0) {
        site.pages.forEach((page) => {
          const filename = page.slug === 'index' ? 'index.html' : `${page.slug}/index.html`;
          zip.file(filename, page.html);
        });
      } else if (site.html) {
        zip.file('index.html', site.html);
      }

      // robots.txt
      const canonicalUrl = config.seoMeta?.canonicalUrl ?? '';
      const robotsTxt = `User-agent: *\nAllow: /\n${canonicalUrl ? `\nSitemap: ${canonicalUrl}/sitemap.xml` : ''}\n`;
      zip.file('robots.txt', robotsTxt);

      // sitemap.xml
      const pages = site.pages ?? [{ slug: 'index' }];
      const now = new Date().toISOString().split('T')[0];
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => {
        const url = canonicalUrl ? `${canonicalUrl}${p.slug === 'index' ? '/' : `/${p.slug}/`}` : `/${p.slug === 'index' ? '' : p.slug + '/'}`;
        return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${p.slug === 'index' ? '1.0' : '0.8'}</priority>\n  </url>`;
      }).join('\n')}\n</urlset>\n`;
      zip.file('sitemap.xml', sitemapXml);

      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${config.businessName ?? 'site'}-website.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedSite(null);
    setSelectedSection(null);
    generateSite();
  };

  const updateSite = useCallback(
    (updates: Partial<GeneratedSite>, addToHistory = true) => {
      setSite((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...updates };
        setGeneratedSite(next);
        if (addToHistory) pushHistory(next);
        return next;
      });
    },
    [setGeneratedSite, pushHistory]
  );

  const isMultiPage = !!(site?.pages && site.pages.length > 0);
  const currentPage: SitePage | null = isMultiPage
    ? (site?.pages?.find((p) => p.id === activePageId) ?? site?.pages?.[0] ?? null)
    : null;

  const activeSections: GeneratedSection[] = isMultiPage
    ? (currentPage?.sections ?? [])
    : (site?.sections ?? []);

  const activeHtml: string = isMultiPage
    ? (currentPage?.html ?? '')
    : (site?.html ?? '');

  const handleSectionsUpdate = useCallback(
    (sections: GeneratedSection[]) => {
      if (isMultiPage && currentPage) {
        const newPages = site?.pages?.map((p) =>
          p.id === currentPage.id ? { ...p, sections } : p
        );
        updateSite({ sections: site?.sections ?? [], pages: newPages });
      } else {
        updateSite({ sections });
      }
    },
    [updateSite, isMultiPage, currentPage, site]
  );

  const handleSectionSelect = (section: GeneratedSection) => {
    setSelectedSection(section);
    setMobileTab('edit');
    // Scroll sync via postMessage
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'scrollToSection', sectionId: section.id },
      '*'
    );
  };

  const handleSectionEdit = (field: 'title' | 'content', value: string) => {
    if (!selectedSection) return;
    const updatedSection = { ...selectedSection, [field]: value };
    setSelectedSection(updatedSection);
    const newSections = activeSections.map((s) =>
      s.id === selectedSection.id ? updatedSection : s
    );
    handleSectionsUpdate(newSections);
  };

  const handleAddSection = (type: GeneratedSection['type'], content?: object) => {
    const newSection: GeneratedSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: SECTION_TYPE_OPTIONS.find((o) => o.type === type)?.label ?? type,
      content: JSON.stringify(content ?? DEFAULT_SECTION_CONTENT[type] ?? {}),
      order: activeSections.length + 1,
    };
    handleSectionsUpdate([...activeSections, newSection]);
    setShowAddSection(false);
  };

  const handleDeleteSection = (id: string) => {
    const newSections = activeSections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    handleSectionsUpdate(newSections);
    if (selectedSection?.id === id) setSelectedSection(null);
    setShowDeleteConfirm(null);
  };

  // ── Page duplication ────────────────────────────────────────────────────────

  const openDuplicateDialog = (pageId: string) => {
    const page = site?.pages?.find((p) => p.id === pageId);
    if (!page) return;
    setDupName(`${page.title}（コピー）`);
    setDupSlug(`${page.slug}-copy`);
    setShowDuplicateDialog(pageId);
    setPageMenuOpen(null);
  };

  const handleDuplicatePage = () => {
    if (!showDuplicateDialog || !site?.pages) return;
    const srcPage = site.pages.find((p) => p.id === showDuplicateDialog);
    if (!srcPage) return;
    const newPage: SitePage = {
      ...srcPage,
      id: `${srcPage.id}-dup-${Date.now()}`,
      slug: (dupSlug.trim() || `${srcPage.slug}-copy`) as SitePage['slug'],
      title: dupName.trim() || `${srcPage.title}（コピー）`,
      isHome: false,
    };
    const newNav = site.navigation
      ? [...site.navigation, { label: newPage.title, href: `${newPage.slug}.html` }]
      : undefined;
    updateSite({ pages: [...site.pages, newPage], navigation: newNav });
    setShowDuplicateDialog(null);
    setActivePageId(newPage.id);
  };

  const handleBulkDuplicate = () => {
    if (!site?.pages || bulkSelected.size === 0) return;
    const toDup = site.pages.filter((p) => bulkSelected.has(p.id));
    const newPages = toDup.map((p) => ({
      ...p,
      id: `${p.id}-dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slug: `${p.slug}-copy` as SitePage['slug'],
      title: `${p.title}（コピー）`,
      isHome: false,
    }));
    const newNav = site.navigation
      ? [
          ...site.navigation,
          ...newPages.map((p) => ({ label: p.title, href: `${p.slug}.html` })),
        ]
      : undefined;
    updateSite({ pages: [...site.pages, ...newPages], navigation: newNav });
    setBulkSelected(new Set());
    setShowBulkDup(false);
  };

  const handleAiRewrite = async () => {
    if (!selectedSection) return;
    setIsAiRewriting(true);
    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site?.id,
          sectionId: selectedSection.id,
          instruction: `${selectedSection.title}セクションのテキストをより魅力的に書き直してください`,
          currentContent: selectedSection.content,
          currentTitle: selectedSection.title,
        }),
      });
      const data = await response.json();
      if (data.title || data.content) {
        const updated: GeneratedSection = {
          ...selectedSection,
          ...(data.title ? { title: data.title as string } : {}),
          ...(data.content ? { content: data.content as string } : {}),
        };
        setSelectedSection(updated);
        const newSections = activeSections.map((s) =>
          s.id === selectedSection.id ? updated : s
        );
        handleSectionsUpdate(newSections);
      }
    } catch {
      // silently fail
    } finally {
      setIsAiRewriting(false);
    }
  };

  const handleColorChange = (key: 'primary' | 'secondary' | 'accent', value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    if (site?.config) {
      updateSite({ config: { ...site.config, colorPalette: next } }, false);
      triggerColorRegeneration({ ...site.config, colorPalette: next });
    }
  };

  const triggerColorRegeneration = async (newConfig: GeneratedSite['config']) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (!response.ok) return;
      const data = await response.json();
      updateSite({ html: data.html, css: data.css, pages: data.pages, navigation: data.navigation });
    } catch {
      // silently fail
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site?.id,
          sectionId: selectedSection?.id ?? 'all',
          instruction: userMsg,
          sections: activeSections,
        }),
      });
      const data = await response.json();
      if (data.sections) {
        handleSectionsUpdate(data.sections as GeneratedSection[]);
        if (data.html) updateSite({ html: data.html as string });
      }
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: (data.message as string | undefined) ?? '修正しました。プレビューをご確認ください。' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'エラーが発生しました。もう一度お試しください。' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">AIがサイトを生成中...</h3>
          <p className="text-white/50 text-sm">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-white font-semibold text-lg mb-2">エラーが発生しました</h3>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button
            onClick={generateSite}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="border-b border-white/5 bg-[#0d1117]/90 backdrop-blur-xl sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-3">
          <button
            onClick={() => router.push('/create/wizard')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ウィザードに戻る</span>
          </button>

          {/* View mode switcher */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as ViewMode[]).map((mode) => {
              const Icon = VIEW_SIZES[mode].icon;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === mode ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => { undo(); }}
                disabled={!canUndo()}
                title="元に戻す (Ctrl+Z)"
                className={cn(
                  'p-1.5 rounded transition-colors',
                  canUndo() ? 'text-white/60 hover:text-white' : 'text-white/20 cursor-not-allowed'
                )}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { redo(); }}
                disabled={!canRedo()}
                title="やり直す (Ctrl+Shift+Z)"
                className={cn(
                  'p-1.5 rounded transition-colors',
                  canRedo() ? 'text-white/60 hover:text-white' : 'text-white/20 cursor-not-allowed'
                )}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowColorPicker(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 text-sm transition-colors"
            >
              <Palette className="w-4 h-4" />
              カラー変更
            </button>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 text-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">再生成</span>
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading || !site}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 text-sm transition-colors disabled:opacity-50"
              title="HTMLファイルをZIPでダウンロード"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">DL</span>
            </button>
            <button
              onClick={() => router.push('/create/deploy')}
              disabled={!site}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              公開設定へ
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden border-t border-white/5">
          {(['sections', 'edit', 'chat'] as TabMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                'flex-1 py-2 text-xs font-medium transition-colors',
                mobileTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-white/40'
              )}
            >
              {tab === 'sections' ? 'セクション' : tab === 'edit' ? '編集' : 'AI修正'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3-column body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section list */}
        <div
          className={cn(
            'border-r border-white/5 flex flex-col overflow-hidden',
            'md:flex md:w-64 md:flex-shrink-0',
            mobileTab === 'sections' ? 'flex flex-1' : 'hidden'
          )}
        >
          {/* Page tabs (multi-page) */}
          {isMultiPage && site?.pages && (
            <div className="border-b border-white/5 p-2 flex-shrink-0">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <p className="text-white/30 text-xs uppercase tracking-wider font-medium">ページ</p>
                {/* Bulk duplicate button */}
                <button
                  onClick={() => setShowBulkDup((v) => !v)}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-lg border transition-colors',
                    showBulkDup
                      ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                      : 'border-white/10 text-white/30 hover:text-white/60'
                  )}
                >
                  一括複製
                </button>
              </div>

              {showBulkDup && (
                <div className="mb-2">
                  <div className="space-y-0.5 max-h-32 overflow-y-auto mb-1.5">
                    {site.pages.map((page) => (
                      <label
                        key={page.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5"
                      >
                        <button
                          onClick={() => setBulkSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(page.id)) next.delete(page.id);
                            else next.add(page.id);
                            return next;
                          })}
                          className="flex-shrink-0"
                        >
                          {bulkSelected.has(page.id)
                            ? <CheckSquare className="w-4 h-4 text-purple-400" />
                            : <Square className="w-4 h-4 text-white/20" />}
                        </button>
                        <span className="text-white/60 text-xs truncate">{page.title}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    disabled={bulkSelected.size === 0}
                    onClick={handleBulkDuplicate}
                    className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors disabled:opacity-40"
                  >
                    選択ページを複製 ({bulkSelected.size})
                  </button>
                </div>
              )}

              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {site.pages.map((page) => (
                  <div key={page.id} className="relative group/page">
                    <button
                      onClick={() => {
                        setActivePageId(page.id);
                        setSelectedSection(null);
                        setPageMenuOpen(null);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm transition-colors pr-8',
                        activePageId === page.id
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <Layout className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate text-xs">{page.title}</span>
                    </button>
                    {/* Page menu button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageMenuOpen((prev) => (prev === page.id ? null : page.id));
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-white/0 group-hover/page:text-white/40 hover:!text-white/80 hover:bg-white/10 transition-colors"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {/* Dropdown menu */}
                    {pageMenuOpen === page.id && (
                      <div className="absolute left-2 top-full mt-0.5 z-30 bg-[#13181f] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[140px]">
                        <button
                          onClick={() => openDuplicateDialog(page.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          ページを複製
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section list */}
          <div className="flex-1 overflow-y-auto p-3">
            <SortableSectionList
              sections={activeSections}
              selectedId={selectedSection?.id ?? null}
              onUpdate={handleSectionsUpdate}
              onSelect={handleSectionSelect}
              onDeleteRequest={(id) => setShowDeleteConfirm(id)}
            />
            <button
              onClick={() => setShowAddSection(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-white/15 text-white/30 hover:text-white/60 hover:border-white/30 text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              セクションを追加
            </button>
          </div>
        </div>

        {/* Center: Preview */}
        <div
          className={cn(
            'flex-1 overflow-hidden flex flex-col',
            mobileTab === 'sections' || mobileTab === 'edit' ? 'hidden md:flex' : 'flex'
          )}
        >
          {site && (
            <DeviceFrame mode={viewMode}>
              <SitePreview
                site={{ ...site, html: activeHtml }}
                viewMode={viewMode}
                viewSizes={VIEW_SIZES}
                iframeRef={iframeRef}
              />
            </DeviceFrame>
          )}
        </div>

        {/* Right: Edit + Chat panel */}
        <div
          className={cn(
            'border-l border-white/5 flex flex-col overflow-hidden',
            'md:flex md:w-72 md:flex-shrink-0',
            mobileTab === 'edit' || mobileTab === 'chat' ? 'flex flex-1' : 'hidden'
          )}
        >
          <div className="flex-1 overflow-y-auto min-h-0">
            {selectedSection ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-sm font-semibold">セクション編集</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowDeleteConfirm(selectedSection.id)}
                      className="text-red-400/60 hover:text-red-400 transition-colors p-1 rounded"
                      title="セクションを削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedSection(null)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">セクションタイトル</label>
                    <input
                      type="text"
                      value={selectedSection.title}
                      onChange={(e) => handleSectionEdit('title', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">コンテンツ (JSON)</label>
                    <textarea
                      value={selectedSection.content}
                      onChange={(e) => handleSectionEdit('content', e.target.value)}
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-xs font-mono outline-none focus:border-purple-500/60 transition-colors resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAiRewrite}
                    disabled={isAiRewriting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-purple-600/60 to-blue-600/60 hover:from-purple-600 hover:to-blue-600 border border-purple-500/30 text-white text-sm transition-all disabled:opacity-50"
                  >
                    {isAiRewriting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AIで書き直す
                  </button>

                  <div className="border-t border-white/5 pt-4">
                    <p className="text-white/50 text-xs mb-2">画像変更</p>
                    <ImageChanger />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3 min-h-[200px]">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-white/30 text-sm">左のセクションをクリックして編集</p>
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div className="border-t border-white/5 flex flex-col" style={{ minHeight: '180px', maxHeight: '40%' }}>
            <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span className="text-white/50 text-xs font-medium">AI修正指示</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-1 space-y-2 min-h-0">
              {chatMessages.length === 0 && (
                <p className="text-white/20 text-xs leading-relaxed pt-1">
                  例: 「ヒーローのキャッチコピーをもっとインパクトのあるものに」
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'text-xs rounded-lg px-2.5 py-1.5 break-words',
                    msg.role === 'user'
                      ? 'bg-purple-500/20 text-white ml-4'
                      : 'bg-white/5 text-white/70 mr-4'
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="bg-white/5 rounded-lg px-2.5 py-1.5 mr-4">
                  <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 p-2 border-t border-white/5 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                placeholder="修正を指示..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-purple-500/50 transition-colors placeholder:text-white/20 min-w-0"
              />
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isChatLoading}
                className="w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Color picker modal ── */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13181f] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-semibold">カラー設定</h2>
              </div>
              <button onClick={() => setShowColorPicker(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              {[
                { key: 'primary' as const, label: 'プライマリカラー', desc: 'メインカラー・ボタン' },
                { key: 'secondary' as const, label: 'セカンダリカラー', desc: '背景・ダークカラー' },
                { key: 'accent' as const, label: 'アクセントカラー', desc: '強調・ハイライト' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-white/40 text-xs">{desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs font-mono">{colors[key]}</span>
                    <label className="cursor-pointer">
                      <div
                        className="w-9 h-9 rounded-lg border-2 border-white/20 shadow-lg hover:scale-105 transition-transform"
                        style={{ backgroundColor: colors[key] }}
                      />
                      <input type="color" value={colors[key]} onChange={(e) => handleColorChange(key, e.target.value)} className="sr-only" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowColorPicker(false)} className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-sm">
              完了
            </button>
          </div>
        </div>
      )}

      {/* ── Add section modal ── */}
      {showAddSection && (
        <AddSectionModal
          onAdd={(type, content) => handleAddSection(type, content)}
          onClose={() => setShowAddSection(false)}
        />
      )}

      {/* ── Delete confirm modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13181f] border border-white/10 rounded-2xl p-6 w-full max-w-xs shadow-2xl text-center">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">セクションを削除しますか？</h3>
            <p className="text-white/40 text-sm mb-4">この操作は元に戻せません。</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">
                キャンセル
              </button>
              <button onClick={() => handleDeleteSection(showDeleteConfirm)} className="flex-1 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Duplicate page dialog ── */}
      {showDuplicateDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowDuplicateDialog(null); setPageMenuOpen(null); }}>
          <div className="bg-[#13181f] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-semibold">ページを複製</h2>
              </div>
              <button onClick={() => setShowDuplicateDialog(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/60 text-xs block mb-1.5">新しいページ名（日本語）</label>
                <input
                  type="text"
                  value={dupName}
                  onChange={(e) => setDupName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/60 text-xs block mb-1.5">スラッグ（英語・URL用）</label>
                <input
                  type="text"
                  value={dupSlug}
                  onChange={(e) => setDupSlug(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDuplicateDialog(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">
                キャンセル
              </button>
              <button onClick={handleDuplicatePage} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium transition-all">
                複製する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close page menu on outside click */}
      {pageMenuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setPageMenuOpen(null)} />
      )}
    </div>
  );
}

// ── ImageChanger sub-component ────────────────────────────────────────────────

const UNSPLASH_MOCK = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&q=80&fit=crop',
];

type ImageTab = 'unsplash' | 'upload' | 'url';

function ImageChanger() {
  const [tab, setTab] = useState<ImageTab>('unsplash');
  const [urlInput, setUrlInput] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>(UNSPLASH_MOCK);
  const [isSearching, setIsSearching] = useState(false);

  const accessKey = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ?? '')
    : '';

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    if (accessKey && accessKey !== 'your-unsplash-key') {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=9&client_id=${accessKey}`
        );
        const data = await res.json() as { results?: Array<{ urls?: { small?: string } }> };
        const urls = (data.results ?? []).map((r) => r.urls?.small ?? '').filter(Boolean);
        setSearchResults(urls.length > 0 ? urls : UNSPLASH_MOCK);
      } catch {
        setSearchResults(UNSPLASH_MOCK);
      }
    } else {
      setSearchResults(UNSPLASH_MOCK);
    }
    setIsSearching(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setSelectedUrl(ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
        {(['unsplash', 'upload', 'url'] as ImageTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-1 text-xs rounded transition-colors',
              tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            )}
          >
            {t === 'unsplash' ? '検索' : t === 'upload' ? 'アップロード' : 'URL'}
          </button>
        ))}
      </div>

      {tab === 'unsplash' && (
        <div className="space-y-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="キーワードで検索..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-purple-500/50 min-w-0"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {isSearching ? '...' : '検索'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {searchResults.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedUrl(url)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                  selectedUrl === url ? 'border-purple-500' : 'border-transparent hover:border-white/20'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-purple-500/40 transition-colors gap-1">
          <span className="text-white/40 text-xs">クリックしてアップロード</span>
          <span className="text-white/20 text-xs">PNG, JPG, WebP</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
        </label>
      )}

      {tab === 'url' && (
        <div className="flex gap-1.5">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-purple-500/50 min-w-0"
          />
          <button
            onClick={() => urlInput && setSelectedUrl(urlInput)}
            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs transition-colors flex-shrink-0"
          >
            適用
          </button>
        </div>
      )}

      {selectedUrl && (
        <div className="mt-1.5 rounded-lg overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedUrl} alt="Selected" className="w-full h-24 object-cover" />
        </div>
      )}
    </div>
  );
}
