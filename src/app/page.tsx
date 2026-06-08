'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, Palette, Globe, CheckCircle, Sparkles,
  FileText, Share2, Search, MessageSquare, Calendar, Image,
  Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const } }),
};

const STEPS = [
  { num: '01', title: '業種・目的を選ぶ', desc: 'チェック項目を選ぶだけ。LP・多ページ・フルパッケージから選択', icon: Sparkles },
  { num: '02', title: 'AIが自動生成', desc: 'デザインとコンテンツをAIが最適化。わずか数秒で完成', icon: Zap },
  { num: '03', title: '公開・管理', desc: 'ワンクリックで公開。ダッシュボードで複数サイトを管理', icon: Globe },
];

const FEATURES = [
  { icon: Zap, title: '最速3分で完成', desc: 'チェックを選ぶだけ。複雑な操作は一切不要。' },
  { icon: Palette, title: 'プロ品質のデザイン', desc: '業種・目的に最適なデザインをAIが自動選定。' },
  { icon: Globe, title: 'ワンクリック公開', desc: 'ドメイン設定も自動。今すぐネットに公開できます。' },
  { icon: FileText, title: 'マルチページ対応', desc: 'LP から会社サイトまで複数ページを一括生成。' },
  { icon: Search, title: 'SEO最適化', desc: 'メタタグ・OGP・GA4 をウィザードで設定。' },
  { icon: MessageSquare, title: 'お問い合わせフォーム', desc: 'Formspree 連携で問い合わせをすぐ受け取れる。' },
  { icon: Calendar, title: '予約機能', desc: 'Calendly など外部サービスとの連携対応。' },
  { icon: Image, title: 'ギャラリー・ブログ', desc: '写真ギャラリーやブログセクションも自動生成。' },
  { icon: Share2, title: 'SNS連携', desc: 'Instagram / LINE など SNS リンクを自動埋め込み。' },
];

const INDUSTRIES = [
  '美容サロン', 'レストラン', '法律事務所', 'IT企業',
  'フィットネス', '医療', '不動産', '教育',
];

const TESTIMONIALS = [
  { name: '山田 太郎', role: '美容室オーナー', text: '3分でサイトが完成してびっくり。プロに頼むより安くて本当に助かりました。', rating: 5 },
  { name: '佐藤 花子', role: '弁護士', text: '法律事務所向けのデザインが最初から選べて、クオリティに満足しています。', rating: 5 },
  { name: '田中 健二', role: 'フィットネストレーナー', text: '予約フォームも含めて一発で生成できた。集客に直結してます。', rating: 5 },
];

const FAQS = [
  { q: 'コーディングの知識は必要ですか？', a: 'まったく不要です。チェックボックスを選ぶだけでプロ品質のサイトが生成されます。' },
  { q: '生成されたサイトはカスタマイズできますか？', a: 'はい。セクションの追加・削除・並び替えや、テキスト・カラーの変更が可能です。' },
  { q: '独自ドメインは使えますか？', a: 'プロプラン以上でカスタムドメインをご利用いただけます。' },
  { q: '無料プランでどこまで使えますか？', a: 'LP 1件まで、AI生成 3回/月まで無料でご利用いただけます。' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-white/80 font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />}
      </button>
      {open && <p className="pb-4 text-white/50 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

// Mock browser window with code
function MockPreview() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-purple-900/30">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/10">
        <div className="flex gap-1.5">
          {['bg-red-500/70', 'bg-yellow-500/70', 'bg-green-500/70'].map(c => (
            <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white/5 rounded-md px-3 py-1 text-white/30 text-xs text-center">
            your-site.webcre.app
          </div>
        </div>
      </div>
      {/* Fake site */}
      <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] p-8 min-h-[280px]">
        <div className="flex gap-3 mb-6">
          {['bg-purple-500/30', 'bg-blue-500/20', 'bg-white/5'].map((c, i) => (
            <div key={i} className={`h-2 rounded-full ${c} ${i === 0 ? 'w-24' : i === 1 ? 'w-16' : 'w-20'}`} />
          ))}
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-8 w-3/4 bg-gradient-to-r from-purple-500/30 to-blue-500/20 rounded-lg" />
          <div className="h-8 w-1/2 bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg" />
        </div>
        <div className="flex gap-2 mb-8">
          <div className="h-8 w-28 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-80" />
          <div className="h-8 w-24 border border-white/20 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.04] border border-white/8" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* ── Hero ── */}
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/6 blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8">
                <Zap className="w-3.5 h-3.5" />
                AIがあなたのサイトを自動生成
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                選ぶだけで、<br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  プロ品質のサイト
                </span>
                <br />がすぐに完成
              </h1>
              <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                中小企業・個人事業主向けのAI自動生成サービス。<br className="hidden sm:block" />
                チェック項目を選ぶだけで、最短3分でプロ品質のウェブサイトが完成します。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-lg font-semibold transition-all duration-200 shadow-xl shadow-purple-500/30"
                >
                  無料で作成を始める <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/15 hover:bg-white/5 text-white/80 text-lg font-medium transition-all"
                >
                  料金を見る
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
                {['クレジットカード不要', '最短3分で完成', '無料から始められる'].map(text => (
                  <span key={text} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    {text}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Mock preview */}
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            >
              <MockPreview />
            </motion.div>
          </div>
        </section>

        {/* ── Steps ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <h2 className="text-3xl font-bold text-white mb-3">かんたん3ステップ</h2>
              <p className="text-white/50">複雑な操作は一切なし。選ぶだけで完成します。</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.num}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={fadeUp}
                    className="relative"
                  >
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
                    )}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-purple-400" />
                      </div>
                      <div className="text-purple-400 text-xs font-bold mb-1 tracking-widest">{step.num}</div>
                      <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <h2 className="text-3xl font-bold text-white mb-3">なぜウェブクリが選ばれるのか</h2>
              <p className="text-white/50">必要な機能がすべて揃っています</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={fadeUp}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                    <p className="text-white/50 text-sm">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── LP特化クリエイター ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8"
            >
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
                  <Sparkles className="w-3 h-3" />NEW
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  既存サイトのトンマナを引き継いだLPを生成
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  クライアントのウェブサイトURLや画像を読み込むだけで、そのブランドのデザイン・配色・フォントを自動解析。
                  CVゴールを設定すれば、トンマナにぴったり合ったコンバージョン特化LPを数分で生成します。
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/lp-creator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/25"
                  >
                    LP特化クリエイターを試す <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="w-full sm:w-72 flex-shrink-0">
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] border-b border-white/10">
                    {['bg-red-500/60','bg-yellow-500/60','bg-green-500/60'].map(c=><div key={c} className={`w-2 h-2 rounded-full ${c}`}/>)}
                    <div className="flex-1 bg-white/5 rounded mx-2 h-4" />
                  </div>
                  <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0d1117] p-4 space-y-2">
                    <div className="h-1.5 w-24 bg-purple-500/40 rounded-full" />
                    <div className="h-6 w-full bg-gradient-to-r from-purple-500/30 to-blue-500/20 rounded-lg" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-8 w-28 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-80 mt-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Template Industries ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-white mb-3">対応業種</h2>
              <p className="text-white/50">あらゆる業種に最適化されたテンプレートを用意</p>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-3">
              {INDUSTRIES.map((industry, i) => (
                <motion.span
                  key={industry}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-sm hover:bg-purple-500/10 transition-colors cursor-default"
                >
                  {industry}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <h2 className="text-3xl font-bold text-white mb-3">お客様の声</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Teaser ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <h2 className="text-3xl font-bold text-white mb-4">シンプルな料金プラン</h2>
              <p className="text-white/50 mb-8">無料から始めて、必要に応じてアップグレード</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { name: 'フリー', price: '無料', highlight: false },
                  { name: 'スタンダード', price: '¥4,980/月', highlight: false },
                  { name: 'プロ', price: '¥14,980/月', highlight: true },
                  { name: 'エージェンシー', price: '¥49,800/月', highlight: false },
                ].map(plan => (
                  <div
                    key={plan.name}
                    className={`p-4 rounded-xl border ${
                      plan.highlight
                        ? 'border-purple-500/40 bg-purple-500/10'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <p className="text-white font-semibold text-sm mb-1">{plan.name}</p>
                    <p className={`text-sm ${plan.highlight ? 'text-purple-300' : 'text-white/50'}`}>{plan.price}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-sm font-medium transition-all"
              >
                料金の詳細を見る <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white">よくある質問</h2>
            </motion.div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6">
              {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-purple-600/8 blur-3xl" />
          </div>
          <div className="relative max-w-2xl mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                今すぐ無料で<br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  はじめてみよう
                </span>
              </h2>
              <p className="text-white/50 mb-8 text-lg">クレジットカード不要。3分で最初のサイトが完成します。</p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-lg font-semibold transition-all duration-200 shadow-2xl shadow-purple-500/30"
              >
                無料で始める <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
