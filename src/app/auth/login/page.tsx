'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { signIn, signInWithGoogle, signInWithMagicLink, isDevMode } = useAuth();

  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'magic') {
      const { error } = await signInWithMagicLink(email);
      if (error) setError(error.message);
      else setMagicSent(true);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else router.push(redirect);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleDevSkip = () => router.push(redirect);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl">ウェブクリ</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">ログイン</h1>
          <p className="text-white/50 text-sm">アカウントにサインインしてください</p>
        </div>

        {/* Dev mode banner */}
        {isDevMode && (
          <div className="mb-4 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 text-xs font-medium">開発モード</p>
              <p className="text-yellow-300/70 text-xs mt-0.5">Supabase未設定のため認証をスキップできます</p>
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
          {magicSent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-white font-semibold mb-1">メールを送信しました</h2>
              <p className="text-white/50 text-sm">{email} に認証リンクを送りました。メールをご確認ください。</p>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-white/10 p-1 mb-5">
                {(['password', 'magic'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                      mode === m
                        ? 'bg-purple-600 text-white'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {m === 'password' ? 'パスワード' : 'マジックリンク'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>

                {mode === 'password' && (
                  <div>
                    <label className="block text-white/60 text-xs mb-1.5">パスワード</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-purple-500/60 transition-all"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'password' ? 'ログイン' : 'マジックリンクを送信'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-[#161b22] text-white/30 text-xs">または</span>
                </div>
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-white/3 hover:bg-white/8 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="font-bold text-sm">G</span>
                Googleでログイン
              </button>

              {isDevMode && (
                <button
                  onClick={handleDevSkip}
                  className="w-full py-2.5 mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/15 text-yellow-300 text-sm font-medium transition-all"
                >
                  開発モードでスキップ
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-center text-white/40 text-sm mt-5">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
            サインアップ
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
