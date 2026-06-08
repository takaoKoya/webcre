'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, FileText, Clock, Globe, Edit2, Trash2, Copy,
  MoreVertical, ExternalLink, LayoutDashboard, Settings, Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { listProjects, deleteProject, duplicateProject, updateProject } from '@/lib/projects';
import type { Project } from '@/lib/projects';
import { getPlan } from '@/lib/plans';
import { useWizardStore } from '@/lib/store';

function DeleteDialog({
  project,
  onConfirm,
  onCancel,
}: { project: Project; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 rounded-2xl border border-white/10 bg-[#161b22] shadow-2xl">
        <h3 className="text-white font-semibold mb-2">プロジェクトを削除</h3>
        <p className="text-white/50 text-sm mb-5">
          「{project.name}」を削除しますか？この操作は元に戻せません。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
  onDuplicate,
  onPublish,
  onEdit,
}: {
  project: Project;
  onDelete: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onEdit: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublished = project.status === 'published';
  const date = new Date(project.updated_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="group relative flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
      {/* Thumbnail placeholder */}
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
        <FileText className="w-6 h-6 text-purple-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium truncate">{project.name}</span>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
            isPublished
              ? 'bg-green-500/15 text-green-400 border border-green-500/20'
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}>
            {isPublished ? '公開中' : '下書き'}
          </span>
        </div>
        <p className="text-white/40 text-xs">{date}更新</p>
        {project.deploy_url && (
          <a
            href={project.deploy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs mt-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {project.deploy_url}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/40 text-white/60 hover:text-white text-xs transition-all"
        >
          編集
        </button>
        {!isPublished && (
          <button
            onClick={onPublish}
            className="px-3 py-1.5 rounded-lg border border-green-500/20 hover:bg-green-500/10 text-green-400 text-xs transition-all"
          >
            公開
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/40 hover:text-white transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-36 py-1 rounded-xl border border-white/10 bg-[#161b22] shadow-xl">
                <button
                  onClick={() => { onDuplicate(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 text-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />複製
                </button>
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isDevMode, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const resetWizard = useWizardStore(s => s.reset);
  const setGeneratedSite = useWizardStore(s => s.setGeneratedSite);
  const updateConfig = useWizardStore(s => s.updateConfig);
  const setStep = useWizardStore(s => s.setStep);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listProjects(user.id);
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (project: Project) => {
    resetWizard();
    updateConfig(project.config);
    if (project.generated_site) setGeneratedSite(project.generated_site);
    setStep(5);
    router.push('/create/preview');
  };

  const handleDelete = async (project: Project) => {
    await deleteProject(project.id);
    setProjects(prev => prev.filter(p => p.id !== project.id));
    setDeleteTarget(null);
  };

  const handleDuplicate = async (project: Project) => {
    const newProject = await duplicateProject(project);
    setProjects(prev => [newProject, ...prev]);
  };

  const handlePublish = async (project: Project) => {
    const updated = await updateProject(project.id, { status: 'published' });
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const published = projects.filter(p => p.status === 'published').length;
  const draft = projects.filter(p => p.status === 'draft').length;
  const plan = getPlan(isDevMode ? 'free' : 'free'); // TODO: fetch from profile

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/5 bg-[#0d1117] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">ウェブクリ</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
            { href: '/dashboard/settings', label: '設定', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
            <p className="text-white/40 text-xs">現在のプラン</p>
            <p className="text-purple-400 text-sm font-semibold mt-0.5">{plan.name}</p>
            {isDevMode && <p className="text-yellow-400/60 text-xs mt-0.5">開発モード</p>}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 sm:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
              <p className="text-white/50 text-sm mt-1">作成したサイトを管理できます</p>
            </div>
            <Link
              href="/create/wizard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              新しく作成
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: '作成したサイト', value: String(projects.length), icon: FileText },
              { label: '公開中', value: String(published), icon: Globe },
              { label: '下書き', value: String(draft), icon: Clock },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                  <Icon className="w-5 h-5 text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/50 text-xs">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-white font-semibold mb-4">プロジェクト一覧</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="py-16 text-center rounded-xl border border-dashed border-white/10">
                <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm mb-4">まだプロジェクトがありません</p>
                <Link
                  href="/create/wizard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  最初のサイトを作成
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => handleEdit(project)}
                    onDelete={() => setDeleteTarget(project)}
                    onDuplicate={() => handleDuplicate(project)}
                    onPublish={() => handlePublish(project)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {deleteTarget && (
        <DeleteDialog
          project={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
