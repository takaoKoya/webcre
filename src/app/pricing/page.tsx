'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight, X, Star } from 'lucide-react';
import { plans, type PlanId } from '@/lib/plans';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const FEATURE_ROWS = [
  { label: 'プロジェクト数', free: '1件', standard: '3件', pro: '10件', agency: '無制限' },
  { label: 'ページ数/サイト', free: '1P (LP)', standard: '最大5P', pro: '無制限', agency: '無制限' },
  { label: 'AI生成', free: '3回/月', standard: '無制限', pro: '無制限', agency: '無制限' },
  { label: 'ブログ・ギャラリー', free: false, standard: true, pro: true, agency: true },
  { label: 'フォーム・予約機能', free: false, standard: true, pro: true, agency: true },
  { label: 'SEO最適化', free: false, standard: true, pro: true, agency: true },
  { label: 'SNS連携', free: false, standard: true, pro: true, agency: true },
  { label: 'カスタムドメイン', free: false, standard: false, pro: true, agency: true },
  { label: 'ホワイトラベル', free: false, standard: false, pro: false, agency: true },
  { label: 'サポート', free: 'メール', standard: 'メール', pro: '優先', agency: '専任' },
];

const FAQS = [
  { q: '無料プランでどこまで使えますか？', a: 'LP1件まで、AI生成3回/月まで無料でご利用いただけます。ZIPダウンロードも可能です。' },
  { q: 'いつでもキャンセルできますか？', a: 'はい、いつでもキャンセル可能です。解約後も月末まではご利用いただけます。' },
  { q: '生成されたサイトのデータはどうなりますか？', a: '解約後30日間はデータを保持します。その後は自動削除されます。' },
  { q: 'Stripe決済は安全ですか？', a: '決済はStripeが処理します。カード情報は当社のサーバーには保存されません。' },
];

function UpgradeModal({ plan, onClose }: { plan: PlanId; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 p-6 rounded-2xl border border-white/10 bg-[#161b22]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">準備中</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-white/50 text-sm">
          Stripe決済機能は現在準備中です。<br />
          サービスリリース時にお知らせします。
        </p>
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium transition-all"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [upgradeModal, setUpgradeModal] = useState<PlanId | null>(null);

  const planList = [
    { id: 'free' as PlanId, highlighted: false },
    { id: 'standard' as PlanId, highlighted: false },
    { id: 'pro' as PlanId, highlighted: true },
    { id: 'agency' as PlanId, highlighted: false },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-purple-600/8 blur-3xl" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              シンプルな料金プラン
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              ビジネスに合わせた<br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                料金プラン
              </span>
            </h1>
            <p className="text-white/50 text-lg">まずは無料で始めて、必要に応じてアップグレード</p>
          </div>
        </section>

        {/* Plan cards */}
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {planList.map(({ id, highlighted }) => {
                const plan = plans[id];
                return (
                  <div
                    key={id}
                    className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                      highlighted
                        ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-purple-500/5 shadow-xl shadow-purple-500/10'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    {highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold shadow-lg">
                        <Star className="w-3 h-3" />おすすめ
                      </div>
                    )}
                    <div className="mb-5">
                      <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold text-white">
                          {plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}
                        </span>
                        {plan.price > 0 && <span className="text-white/40 text-sm mb-1">/月</span>}
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                          <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {id === 'free' ? (
                      <Link
                        href="/auth/signup"
                        className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-sm font-medium text-center transition-all"
                      >
                        無料で始める
                      </Link>
                    ) : (
                      <button
                        onClick={() => setUpgradeModal(id)}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          highlighted
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                            : 'border border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                        }`}
                      >
                        今すぐ始める <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white text-center mb-10">プラン比較</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-white/40 font-medium w-1/3">機能</th>
                    {['フリー', 'スタンダード', 'プロ', 'エージェンシー'].map(name => (
                      <th key={name} className="text-center py-3 text-white font-semibold">{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 text-white/60">{row.label}</td>
                      {(['free', 'standard', 'pro', 'agency'] as PlanId[]).map(pid => {
                        const val = row[pid];
                        return (
                          <td key={pid} className="text-center py-3">
                            {typeof val === 'boolean' ? (
                              val
                                ? <Check className="w-4 h-4 text-green-400 mx-auto" />
                                : <X className="w-4 h-4 text-white/20 mx-auto" />
                            ) : (
                              <span className="text-white/70">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white text-center mb-10">よくある質問</h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                  <p className="text-white/50 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">まずは無料で試してみる</h2>
            <p className="text-white/50 mb-8">クレジットカード不要。今すぐ始められます。</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold transition-all shadow-xl shadow-purple-500/25"
            >
              無料で始める <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />

      {upgradeModal && (
        <UpgradeModal plan={upgradeModal} onClose={() => setUpgradeModal(null)} />
      )}
    </div>
  );
}
