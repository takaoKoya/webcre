import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Map, Layout } from 'lucide-react';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          ウェブサイトを作成しましょう
        </h1>
        <p className="text-white/50 text-lg mb-10">
          3つのスタート方法から選んでください。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Quick Generate */}
          <Link
            href="/create/wizard"
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center group-hover:from-purple-500/40 group-hover:to-blue-500/40 transition-all">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">クイック生成</h3>
              <p className="text-white/40 text-xs leading-relaxed">
                簡単な質問に答えるだけでAIが自動生成。最短3分で完成。
              </p>
            </div>
            <div className="flex items-center gap-1 text-purple-400/60 text-xs group-hover:text-purple-400 transition-colors mt-auto">
              はじめる <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Sitemap first */}
          <Link
            href="/create/sitemap"
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-blue-500/40 group-hover:to-cyan-500/40 transition-all">
              <Map className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">サイトマップから</h3>
              <p className="text-white/40 text-xs leading-relaxed">
                まずサイト構成を設計。AIが業種に合った構成を提案します。
              </p>
            </div>
            <div className="flex items-center gap-1 text-blue-400/60 text-xs group-hover:text-blue-400 transition-colors mt-auto">
              サイトマップ → ワイヤーフレーム → 生成 <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* Wireframe first */}
          <Link
            href="/create/wireframe"
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-green-500/40 group-hover:to-teal-500/40 transition-all">
              <Layout className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">ワイヤーフレームから</h3>
              <p className="text-white/40 text-xs leading-relaxed">
                ページ構成をビジュアルで設計してから生成。細かく設計したい方向け。
              </p>
            </div>
            <div className="flex items-center gap-1 text-green-400/60 text-xs group-hover:text-green-400 transition-colors mt-auto">
              ワイヤーフレーム → 生成 <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>

        <p className="text-white/20 text-xs">
          どのパスを選んでもウィザードで詳細を設定できます
        </p>
      </div>
    </div>
  );
}
