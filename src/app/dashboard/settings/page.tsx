'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap, LayoutDashboard, Settings, User, Lock, CreditCard,
  Trash2, AlertCircle, CheckCircle, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getPlan, plans } from '@/lib/plans';

export default function SettingsPage() {
  const { user, isDevMode, signOut } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const currentPlan = getPlan('free');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: update profiles table
    await new Promise(r => setTimeout(r, 600));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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
            const isActive = item.href === '/dashboard/settings';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-purple-500/20 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 sm:p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            ダッシュボードに戻る
          </Link>
          <h1 className="text-2xl font-bold text-white mb-8">アカウント設定</h1>

          {isDevMode && (
            <div className="mb-6 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-300/80 text-xs">開発モード — 変更は実際には保存されません</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Profile */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-purple-400" />
                <h2 className="text-white font-semibold">プロフィール</h2>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">メールアドレス</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-white/3 border border-white/10 text-white/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">表示名</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="山田 太郎"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">会社名（任意）</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="株式会社サンプル"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saved ? (
                    <><CheckCircle className="w-4 h-4" />保存しました</>
                  ) : '変更を保存'}
                </button>
              </form>
            </div>

            {/* Plan */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-purple-400" />
                <h2 className="text-white font-semibold">プラン</h2>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">{currentPlan.name}プラン</p>
                  <p className="text-white/40 text-sm">
                    {currentPlan.price === 0 ? '無料' : `¥${currentPlan.price.toLocaleString()}/月`}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full border border-purple-500/30 text-purple-300 text-xs font-medium">
                  現在のプラン
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'プロジェクト', val: currentPlan.projects === -1 ? '無制限' : `${currentPlan.projects}件` },
                  { label: 'ページ数', val: currentPlan.pages === -1 ? '無制限' : `${currentPlan.pages}P` },
                  { label: 'AI生成', val: currentPlan.aiCalls === -1 ? '無制限' : `${currentPlan.aiCalls}回/月` },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                    <p className="text-white font-semibold text-sm">{item.val}</p>
                    <p className="text-white/40 text-xs mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-sm transition-all"
              >
                プランをアップグレード
              </Link>
            </div>

            {/* Password */}
            {!isDevMode && (
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <h2 className="text-white font-semibold">パスワード変更</h2>
                </div>
                <p className="text-white/50 text-sm mb-3">
                  パスワードリセットのメールを送信します
                </p>
                <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-sm transition-all">
                  リセットメールを送信
                </button>
              </div>
            )}

            {/* Danger zone */}
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-4 h-4 text-red-400" />
                <h2 className="text-red-400 font-semibold">危険な操作</h2>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm font-medium">サインアウト</p>
                  <p className="text-white/40 text-xs">現在のセッションを終了します</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/60 hover:text-white text-sm transition-all"
                >
                  サインアウト
                </button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-white/70 text-sm font-medium">アカウント削除</p>
                  <p className="text-white/40 text-xs">すべてのデータが削除されます（取り消し不可）</p>
                </div>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-sm transition-all"
                  >
                    削除する
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-xs transition-all"
                    >
                      キャンセル
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-all"
                    >
                      本当に削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
