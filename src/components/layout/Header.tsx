'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">ウェブクリ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
            ホーム
          </Link>
          <Link href="/lp-creator" className="text-white/60 hover:text-white text-sm transition-colors">
            LP特化
          </Link>
          <Link href="/pricing" className="text-white/60 hover:text-white text-sm transition-colors">
            料金
          </Link>
          {user && (
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">
              ダッシュボード
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              ダッシュボード
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 rounded-lg text-white/60 hover:text-white text-sm transition-colors">
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                無料で始める
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
