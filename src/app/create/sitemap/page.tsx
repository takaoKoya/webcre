'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/store';
import { ArrowLeft, ArrowRight, Plus, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageSlug } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SitemapNode {
  id: string;
  label: string;
  slug: string;
  children: SitemapNode[];
}

// ── Mock templates per industry ───────────────────────────────────────────────

const INDUSTRY_SITEMAPS: Record<string, { nodes: SitemapNode[]; reason: string }> = {
  beauty: {
    reason:
      '美容サロンはビジュアル訴求と予約導線が鍵です。トップページでブランド世界観を伝え、メニュー・料金ページで比較検討を支援、スタッフ紹介で親近感を醸成、予約ページへスムーズに誘導する構成を採用しました。',
    nodes: [
      {
        id: 'index', label: 'トップページ', slug: 'index',
        children: [
          { id: 'services', label: 'メニュー・料金', slug: 'services', children: [] },
          { id: 'gallery', label: 'スタイルギャラリー', slug: 'gallery', children: [] },
          { id: 'about', label: 'サロン・スタッフ紹介', slug: 'about', children: [] },
          { id: 'reservation', label: 'ご予約', slug: 'reservation', children: [] },
          { id: 'access', label: 'アクセス', slug: 'access', children: [] },
          { id: 'contact', label: 'お問い合わせ', slug: 'contact', children: [] },
        ],
      },
    ],
  },
  restaurant: {
    reason:
      '飲食店はメニュー情報と予約機能が最優先です。トップページでコンセプトと雰囲気を伝え、メニューと予約を最短1クリックで届け、アクセス情報を明確にする構成にしました。',
    nodes: [
      {
        id: 'index', label: 'トップページ', slug: 'index',
        children: [
          { id: 'services', label: 'メニュー', slug: 'services', children: [] },
          { id: 'reservation', label: 'ご予約', slug: 'reservation', children: [] },
          { id: 'about', label: 'シェフ・こだわり', slug: 'about', children: [] },
          { id: 'access', label: 'アクセス・営業時間', slug: 'access', children: [] },
          { id: 'contact', label: 'お問い合わせ', slug: 'contact', children: [] },
        ],
      },
    ],
  },
  fitness: {
    reason:
      'フィットネスは無料体験への誘導と料金透明性が重要です。プログラム紹介で価値を伝え、料金プランを明示し、無料体験申し込みへの動線を最短化した構成を採用しました。',
    nodes: [
      {
        id: 'index', label: 'トップページ', slug: 'index',
        children: [
          { id: 'services', label: 'プログラム紹介', slug: 'services', children: [] },
          { id: 'pricing', label: '料金プラン', slug: 'pricing', children: [] },
          { id: 'about', label: 'トレーナー紹介', slug: 'about', children: [] },
          { id: 'faq', label: 'よくある質問', slug: 'faq', children: [] },
          { id: 'contact', label: '無料体験申し込み', slug: 'contact', children: [] },
        ],
      },
    ],
  },
  it: {
    reason:
      'IT企業は専門性と実績の可視化が最重要です。サービス詳細・導入事例で信頼を構築し、技術ブログで専門知識をアピール、問い合わせまでの動線をシンプルにした構成を採用しました。',
    nodes: [
      {
        id: 'index', label: 'トップページ', slug: 'index',
        children: [
          { id: 'services', label: 'サービス一覧', slug: 'services', children: [
            { id: 'services-dev', label: 'システム開発', slug: 'services', children: [] },
            { id: 'services-cloud', label: 'クラウド', slug: 'services', children: [] },
            { id: 'services-dx', label: 'DXコンサル', slug: 'services', children: [] },
          ]},
          { id: 'gallery', label: '導入実績・事例', slug: 'gallery', children: [] },
          { id: 'about', label: '会社概要', slug: 'about', children: [] },
          { id: 'blog', label: '技術ブログ', slug: 'blog', children: [] },
          { id: 'recruit', label: '採用情報', slug: 'recruit', children: [] },
          { id: 'contact', label: 'お問い合わせ', slug: 'contact', children: [] },
        ],
      },
    ],
  },
  legal: {
    reason:
      '士業事務所は信頼性と相談しやすさがカギです。業務内容を分かりやすく整理し、初回無料相談への導線を明確にし、よくある質問でユーザーの不安を解消する構成を採用しました。',
    nodes: [
      {
        id: 'index', label: 'トップページ', slug: 'index',
        children: [
          { id: 'services', label: '業務案内', slug: 'services', children: [
            { id: 'services-hojin', label: '法人設立', slug: 'services', children: [] },
            { id: 'services-souzoku', label: '相続・遺言', slug: 'services', children: [] },
            { id: 'services-fudosan', label: '不動産登記', slug: 'services', children: [] },
          ]},
          { id: 'about', label: '事務所・スタッフ紹介', slug: 'about', children: [] },
          { id: 'faq', label: 'よくある質問', slug: 'faq', children: [] },
          { id: 'access', label: 'アクセス', slug: 'access', children: [] },
          { id: 'contact', label: '無料相談のご予約', slug: 'contact', children: [] },
        ],
      },
    ],
  },
  default: {
    reason:
      'ビジネスサイトの基本構成として、トップページでブランドを伝え、サービス・会社概要で価値を説明し、お問い合わせへスムーズに誘導する一般的な構成を採用しました。',
    nodes: [
      {
        id: 'index', label: 'トップページ', slug: 'index',
        children: [
          { id: 'services', label: 'サービス', slug: 'services', children: [] },
          { id: 'about', label: '会社概要', slug: 'about', children: [] },
          { id: 'access', label: 'アクセス', slug: 'access', children: [] },
          { id: 'contact', label: 'お問い合わせ', slug: 'contact', children: [] },
        ],
      },
    ],
  },
};

// ── Tree node component ───────────────────────────────────────────────────────

interface TreeNodeProps {
  node: SitemapNode;
  depth: number;
  editingId: string | null;
  editLabel: string;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string, label: string) => void;
  onLabelChange: (val: string) => void;
  onLabelCommit: () => void;
  onAdd: (parentId: string) => void;
  onDelete: (id: string) => void;
}

function TreeNode({
  node,
  depth,
  editingId,
  editLabel,
  onSelect,
  onDoubleClick,
  onLabelChange,
  onLabelCommit,
  onAdd,
  onDelete,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const isEditing = editingId === node.id;

  return (
    <div>
      <div
        className="flex items-center gap-1 group"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Expand/collapse toggle */}
        {node.children.length > 0 ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
          >
            <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-90')} />
          </button>
        ) : (
          <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/20" />
          </div>
        )}

        {/* Node label */}
        <div
          className={cn(
            'flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all group/node',
            'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
            depth === 0 && 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50'
          )}
          onClick={() => onSelect(node.id)}
          onDoubleClick={() => onDoubleClick(node.id, node.label)}
        >
          {isEditing ? (
            <input
              autoFocus
              value={editLabel}
              onChange={(e) => onLabelChange(e.target.value)}
              onBlur={onLabelCommit}
              onKeyDown={(e) => e.key === 'Enter' && onLabelCommit()}
              className="flex-1 bg-transparent outline-none text-white text-sm min-w-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={cn('flex-1 text-sm min-w-0 truncate', depth === 0 ? 'text-white font-semibold' : 'text-white/80')}>
              {node.label}
            </span>
          )}

          {/* Action buttons */}
          <div className="hidden group-hover/node:flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(node.id); }}
              className="w-5 h-5 flex items-center justify-center rounded text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              title="子ページを追加"
            >
              <Plus className="w-3 h-3" />
            </button>
            {depth > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                className="w-5 h-5 flex items-center justify-center rounded text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="削除"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {expanded && node.children.length > 0 && (
        <div className="relative ml-2.5 pl-2 border-l border-white/[0.07]">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              editingId={editingId}
              editLabel={editLabel}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
              onLabelChange={onLabelChange}
              onLabelCommit={onLabelCommit}
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function addNode(nodes: SitemapNode[], parentId: string, newNode: SitemapNode): SitemapNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, newNode] };
    return { ...n, children: addNode(n.children, parentId, newNode) };
  });
}

function deleteNode(nodes: SitemapNode[], id: string): SitemapNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: deleteNode(n.children, id) }));
}

function renameNode(nodes: SitemapNode[], id: string, label: string): SitemapNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, label };
    return { ...n, children: renameNode(n.children, id, label) };
  });
}

function collectSlugs(nodes: SitemapNode[]): PageSlug[] {
  const slugs: PageSlug[] = [];
  const visit = (n: SitemapNode) => {
    if (!slugs.includes(n.slug as PageSlug)) slugs.push(n.slug as PageSlug);
    n.children.forEach(visit);
  };
  nodes.forEach(visit);
  return slugs;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SitemapPage() {
  const router = useRouter();
  const { config, updateConfig } = useWizardStore();

  const industryKey = config.industry && INDUSTRY_SITEMAPS[config.industry] ? config.industry : 'default';
  const template = INDUSTRY_SITEMAPS[industryKey];

  const [nodes, setNodes] = useState<SitemapNode[]>(() =>
    JSON.parse(JSON.stringify(template.nodes)) as SitemapNode[]
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleDoubleClick = useCallback((id: string, label: string) => {
    setEditingId(id);
    setEditLabel(label);
  }, []);

  const handleLabelCommit = useCallback(() => {
    if (editingId && editLabel.trim()) {
      setNodes((prev) => renameNode(prev, editingId, editLabel.trim()));
    }
    setEditingId(null);
    setEditLabel('');
  }, [editingId, editLabel]);

  const handleAdd = useCallback((parentId: string) => {
    const id = `page-${Date.now()}`;
    const newNode: SitemapNode = { id, label: '新しいページ', slug: 'about', children: [] };
    setNodes((prev) => addNode(prev, parentId, newNode));
    setEditingId(id);
    setEditLabel('新しいページ');
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNodes((prev) => deleteNode(prev, id));
  }, []);

  const handleProceed = () => {
    const slugs = collectSlugs(nodes);
    updateConfig({ selectedPages: slugs.length > 0 ? slugs : ['index', 'services', 'about', 'access', 'contact'] });
    router.push('/create/wireframe');
  };

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
            <h1 className="text-white font-semibold text-sm">サイトマップ</h1>
            <span className="text-white/30 text-xs">ダブルクリックで名前変更・+で子ページ追加</span>
          </div>

          <button
            onClick={handleProceed}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium transition-all"
          >
            この構成で生成する
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h2 className="text-white text-xl font-bold mb-1">サイト構成</h2>
          <p className="text-white/40 text-sm">
            {config.industry ? `${config.industry}業種向け` : ''}に最適化された構成をAIが提案しました。
          </p>
        </div>

        {/* Tree */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 mb-6 space-y-1.5">
          {nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              editingId={editingId}
              editLabel={editLabel}
              onSelect={() => {}}
              onDoubleClick={handleDoubleClick}
              onLabelChange={setEditLabel}
              onLabelCommit={handleLabelCommit}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* AI explanation */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 text-xs font-bold">AI</span>
            </div>
            <p className="text-white/70 text-sm font-medium">なぜこの構成か</p>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">{template.reason}</p>
        </div>

        {/* Action row */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setNodes(JSON.parse(JSON.stringify(template.nodes)) as SitemapNode[])}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white text-sm transition-colors"
          >
            リセット
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/create/wireframe')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white text-sm transition-colors"
            >
              ワイヤーフレームへ
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleProceed}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              この構成で生成する
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
