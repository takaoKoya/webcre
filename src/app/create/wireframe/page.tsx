'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft, ArrowRight, GripVertical, Image, LayoutTemplate,
  Type, Layout, Star, MessageSquare, Phone, HelpCircle,
  Newspaper, Download, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface WireframeBlock {
  id: string;
  type: string;
  label: string;
  heightClass: string;
  note: string;
}

// ── Section type config ───────────────────────────────────────────────────────

const SECTION_TYPES: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; heightClass: string; color: string }> = {
  hero:         { label: 'ヒーロー',         icon: Image,          heightClass: 'h-28', color: 'border-purple-500/40 bg-purple-500/10' },
  services:     { label: 'サービス',         icon: LayoutTemplate, heightClass: 'h-20', color: 'border-blue-500/40 bg-blue-500/10' },
  about:        { label: '私たちについて',   icon: FileText,       heightClass: 'h-20', color: 'border-green-500/40 bg-green-500/10' },
  gallery:      { label: 'ギャラリー',       icon: Image,          heightClass: 'h-16', color: 'border-pink-500/40 bg-pink-500/10' },
  pricing:      { label: '料金プラン',       icon: Star,           heightClass: 'h-20', color: 'border-yellow-500/40 bg-yellow-500/10' },
  testimonials: { label: 'お客様の声',       icon: MessageSquare,  heightClass: 'h-16', color: 'border-cyan-500/40 bg-cyan-500/10' },
  cta:          { label: 'CTA',             icon: Phone,          heightClass: 'h-12', color: 'border-orange-500/40 bg-orange-500/10' },
  access:       { label: 'アクセス',         icon: Layout,         heightClass: 'h-16', color: 'border-teal-500/40 bg-teal-500/10' },
  faq:          { label: 'FAQ',             icon: HelpCircle,     heightClass: 'h-16', color: 'border-indigo-500/40 bg-indigo-500/10' },
  news:         { label: 'ニュース',         icon: Newspaper,      heightClass: 'h-16', color: 'border-rose-500/40 bg-rose-500/10' },
};

// ── Default blocks per industry ──────────────────────────────────────────────

function getDefaultBlocks(industry?: string): WireframeBlock[] {
  const base: WireframeBlock[] = [
    { id: 'hero', type: 'hero', label: 'ヒーロー', heightClass: 'h-28', note: '' },
    { id: 'services', type: 'services', label: 'サービス', heightClass: 'h-20', note: '' },
    { id: 'about', type: 'about', label: '私たちについて', heightClass: 'h-20', note: '' },
    { id: 'cta', type: 'cta', label: 'CTA', heightClass: 'h-12', note: '' },
  ];

  switch (industry) {
    case 'beauty':
      return [
        { id: 'hero', type: 'hero', label: 'ヒーロー', heightClass: 'h-28', note: '' },
        { id: 'services', type: 'services', label: 'メニュー', heightClass: 'h-20', note: '' },
        { id: 'gallery', type: 'gallery', label: 'スタイル写真', heightClass: 'h-16', note: '' },
        { id: 'testimonials', type: 'testimonials', label: 'お客様の声', heightClass: 'h-16', note: '' },
        { id: 'pricing', type: 'pricing', label: '料金表', heightClass: 'h-20', note: '' },
        { id: 'faq', type: 'faq', label: 'よくある質問', heightClass: 'h-16', note: '' },
        { id: 'access', type: 'access', label: 'アクセス', heightClass: 'h-16', note: '' },
        { id: 'cta', type: 'cta', label: 'ご予約はこちら', heightClass: 'h-12', note: '' },
      ];
    case 'restaurant':
      return [
        { id: 'hero', type: 'hero', label: 'ヒーロー', heightClass: 'h-28', note: '' },
        { id: 'about', type: 'about', label: 'コンセプト', heightClass: 'h-20', note: '' },
        { id: 'services', type: 'services', label: 'メニュー', heightClass: 'h-20', note: '' },
        { id: 'gallery', type: 'gallery', label: 'フォトギャラリー', heightClass: 'h-16', note: '' },
        { id: 'access', type: 'access', label: 'アクセス・営業時間', heightClass: 'h-16', note: '' },
        { id: 'cta', type: 'cta', label: 'ご予約', heightClass: 'h-12', note: '' },
      ];
    case 'fitness':
      return [
        { id: 'hero', type: 'hero', label: 'ヒーロー', heightClass: 'h-28', note: '' },
        { id: 'services', type: 'services', label: 'プログラム', heightClass: 'h-20', note: '' },
        { id: 'pricing', type: 'pricing', label: '料金プラン', heightClass: 'h-20', note: '' },
        { id: 'testimonials', type: 'testimonials', label: '会員の声', heightClass: 'h-16', note: '' },
        { id: 'faq', type: 'faq', label: 'よくある質問', heightClass: 'h-16', note: '' },
        { id: 'cta', type: 'cta', label: '無料体験予約', heightClass: 'h-12', note: '' },
      ];
    case 'it':
      return [
        { id: 'hero', type: 'hero', label: 'ヒーロー', heightClass: 'h-28', note: '' },
        { id: 'services', type: 'services', label: 'サービス', heightClass: 'h-20', note: '' },
        { id: 'gallery', type: 'gallery', label: '導入実績', heightClass: 'h-16', note: '' },
        { id: 'about', type: 'about', label: '会社概要', heightClass: 'h-20', note: '' },
        { id: 'faq', type: 'faq', label: 'よくある質問', heightClass: 'h-16', note: '' },
        { id: 'cta', type: 'cta', label: 'お問い合わせ', heightClass: 'h-12', note: '' },
      ];
    default:
      return base;
  }
}

// ── Sortable block component ──────────────────────────────────────────────────

function SortableWireframeBlock({
  block,
  isSelected,
  onSelect,
}: {
  block: WireframeBlock;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeConfig = SECTION_TYPES[block.type] ?? SECTION_TYPES.about;
  const Icon = typeConfig.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(block.id)}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border-2 px-4 cursor-pointer transition-all',
        block.heightClass,
        isSelected
          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
          : typeConfig.color,
        'hover:opacity-90'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="ml-4 flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-white/70" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{block.label}</p>
          {block.note && (
            <p className="text-white/40 text-xs truncate">{block.note}</p>
          )}
        </div>
      </div>

      {/* Section type badge */}
      <span className="ml-auto text-white/30 text-xs flex-shrink-0">{typeConfig.label}</span>
    </div>
  );
}

// ── Page list sidebar ─────────────────────────────────────────────────────────

const PAGES = [
  { id: 'index', label: 'トップページ' },
  { id: 'about', label: '会社概要' },
  { id: 'services', label: 'サービス' },
  { id: 'contact', label: 'お問い合わせ' },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WireframePage() {
  const router = useRouter();
  const { config, setGeneratedSite } = useWizardStore();
  const wireframeRef = useRef<HTMLDivElement>(null);

  const [activePage, setActivePage] = useState('index');
  const [blocks, setBlocks] = useState<WireframeBlock[]>(() => getDefaultBlocks(config.industry));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleNoteChange = (id: string, note: string) => {
    setNoteInputs((prev) => ({ ...prev, [id]: note }));
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, note } : b)));
  };

  const handleExportPng = async () => {
    if (!wireframeRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(wireframeRef.current, {
        backgroundColor: '#13181f',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `wireframe-${activePage}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleProceed = async () => {
    setIsGenerating(true);
    setGenerateError(null);
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
        config: config as import('@/types').GeneratedSite['config'],
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
      setGenerateError(err instanceof Error ? err.message : '生成中にエラーが発生しました');
      setIsGenerating(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1117]/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 h-14 gap-4">
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-white font-semibold text-sm">ワイヤーフレーム</h1>
            <span className="text-white/30 text-xs">ドラッグで並び替え・メモ追加</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white text-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '書き出し中...' : 'PNGダウンロード'}
            </button>
            <button
              onClick={handleProceed}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              {isGenerating ? '生成中...' : 'サイトを生成'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {generateError && (
        <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {generateError}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: page list */}
        <div className="w-48 border-r border-white/5 flex flex-col flex-shrink-0">
          <p className="text-white/30 text-xs px-4 pt-4 pb-2 uppercase tracking-wider font-medium">ページ</p>
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-colors',
                  activePage === page.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <Layout className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate text-xs">{page.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: wireframe canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#0d1117]">
          <div
            ref={wireframeRef}
            className="w-full max-w-2xl space-y-3 rounded-2xl bg-[#13181f] border border-white/5 p-6"
          >
            {/* Page title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Type className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/60 text-xs font-medium">
                  {PAGES.find((p) => p.id === activePage)?.label ?? 'ページ'}
                </span>
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <SortableWireframeBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
              <div className="flex items-center justify-center h-40 text-white/20 text-sm">
                セクションがありません
              </div>
            )}
          </div>
        </div>

        {/* Right: note panel */}
        <div className="w-64 border-l border-white/5 flex flex-col flex-shrink-0">
          {selectedBlock ? (
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  {(() => {
                    const Icon = (SECTION_TYPES[selectedBlock.type] ?? SECTION_TYPES.about).icon;
                    return <Icon className="w-4 h-4 text-white/70" />;
                  })()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{selectedBlock.label}</p>
                  <p className="text-white/40 text-xs">{(SECTION_TYPES[selectedBlock.type] ?? SECTION_TYPES.about).label}</p>
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs block mb-1.5">メモ・設計意図</label>
                <textarea
                  rows={6}
                  value={noteInputs[selectedBlock.id] ?? selectedBlock.note}
                  onChange={(e) => handleNoteChange(selectedBlock.id, e.target.value)}
                  placeholder="例：ファーストビューで予約に誘導。背景は高級感のある画像を使用。"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-purple-500/60 transition-colors resize-none placeholder:text-white/20"
                />
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className="text-white/30 text-xs mb-2">高さ目安</p>
                <div className="flex flex-wrap gap-2">
                  {['h-12', 'h-16', 'h-20', 'h-24', 'h-28', 'h-36'].map((h) => (
                    <button
                      key={h}
                      onClick={() => setBlocks((prev) => prev.map((b) => b.id === selectedBlock.id ? { ...b, heightClass: h } : b))}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs border transition-colors',
                        selectedBlock.heightClass === h
                          ? 'border-purple-500/60 bg-purple-500/20 text-purple-300'
                          : 'border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                      )}
                    >
                      {h === 'h-12' ? 'XS' : h === 'h-16' ? 'S' : h === 'h-20' ? 'M' : h === 'h-24' ? 'L' : h === 'h-28' ? 'XL' : 'XXL'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">ブロックをクリックして<br />メモを追加</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
