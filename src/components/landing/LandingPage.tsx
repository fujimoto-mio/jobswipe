"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Heart,
  MessageCircle,
  Building2,
  ChevronRight,
  Smartphone,
  Shield,
} from "lucide-react";
import { getYearJST } from "@/lib/datetime";
import Logo from "@/components/ui/Logo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const FEATURES = [
  {
    icon: Play,
    title: "動画で求人がわかる",
    desc: "15〜30秒のショート動画で、職場の雰囲気や仕事内容を直感的に把握できます。",
  },
  {
    icon: Heart,
    title: "スワイプで直感操作",
    desc: "気になる求人を右スワイプで保存。スキップ・次へと、サクサク探せます。",
  },
  {
    icon: MessageCircle,
    title: "応募からチャットまで",
    desc: "応募後は企業担当者とその場でメッセージ。疑問をすぐに解消できます。",
  },
];

const STEPS = [
  { num: "01", title: "無料登録", desc: "メールアドレスで1分登録" },
  { num: "02", title: "動画をスワイプ", desc: "エリア・職種で絞り込み" },
  { num: "03", title: "気になる求人に応募", desc: "ワンタップで応募・面談予約" },
];

const SECTION_IDS = ["features", "flow", "company"] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const role = data.session.user.app_metadata?.role ?? data.session.user.user_metadata?.role;
      if (role === "admin") {
        router.replace("/admin");
      } else if (role === "company") {
        router.replace("/company");
      } else {
        router.replace("/explore");
      }
    });
  }, [router]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) return;
    requestAnimationFrame(() => scrollToSection(hash));
  }, []);

  return (
    <div className="w-full bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <Logo inTopbar />
          </Link>
          <nav className="flex flex-1 items-center justify-center gap-4 text-sm font-medium text-[var(--body)] sm:gap-8">
            {[
              { id: "features", label: "特徴" },
              { id: "flow", label: "使い方" },
              { id: "company", label: "企業の方へ", short: "企業" },
            ].map(({ id, label, short }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
                className="whitespace-nowrap transition-colors hover:text-[var(--accent)]"
              >
                {short ? (
                  <>
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </>
                ) : (
                  label
                )}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/company/login"
              className="hidden text-sm font-medium text-[var(--body)] hover:text-[var(--accent)] sm:inline"
            >
              企業ログイン
            </Link>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[var(--body)] hover:text-[var(--accent)] md:inline"
            >
              ログイン
            </Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-sm sm:px-5">
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center border-b border-[var(--border)] bg-white sm:min-h-[calc(100dvh-4rem)]">
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <p className="mb-5 inline-block rounded-full bg-[var(--accent-light)] px-4 py-1.5 text-xs font-bold text-[var(--accent)]">
              動画×スワイプの新しい求人体験
            </p>
            <h1 className="text-[2rem] font-bold leading-[1.5] text-[var(--foreground)] sm:text-[2.5rem] lg:text-[3rem]">
              動画で、いい仕事に出会う。
            </h1>
            <p className="mt-6 max-w-lg text-base leading-[1.8] text-[var(--body)]">
              JobSwipeは求人動画をスワイプするだけで探せる、求職者向けプラットフォーム。
              職場の空気感まで伝わるから、ミスマッチの少ない転職・就活ができます。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className="btn-primary px-8 py-3.5 text-base">
                無料で始める
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link href="/company/login" className="btn-secondary px-8 py-3.5 text-base">
                <Building2 className="h-4 w-4" />
                採用担当の方
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--accent)]" />
                無料で利用可能
              </span>
              <span className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[var(--accent)]" />
                スマホに最適化
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none lg:justify-self-end">
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--foreground)] shadow-[0_4px_16px_rgba(1,41,58,0.08)] sm:max-w-[300px]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#345461] to-[#01293a]" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="mb-3 h-2 w-12 rounded-full bg-white/30" />
                <p className="text-sm font-bold text-white">株式会社サンプル</p>
                <p className="mt-1 text-xs text-white/70">フロントエンドエンジニア</p>
                <div className="mt-4 flex gap-2">
                  <span className="rounded bg-white/20 px-3 py-1.5 text-[10px] font-bold text-white">気になる</span>
                  <span className="rounded bg-[var(--accent)] px-3 py-1.5 text-[10px] font-bold text-white">応募する</span>
                </div>
              </div>
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-4">
                {[Heart, MessageCircle, Play].map((Icon, i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/20"
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("features");
          }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          aria-label="特徴セクションへスクロール"
        >
          <span>スクロール</span>
          <ChevronRight className="h-4 w-4 rotate-90" />
        </a>
      </section>

      <section
        id="features"
        className="flex min-h-[calc(100dvh-3.5rem)] w-full scroll-mt-14 items-center bg-[var(--background)] py-16 sm:min-h-[calc(100dvh-4rem)] sm:scroll-mt-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold text-[var(--accent)]">JobSwipeの特徴</p>
            <h2 className="mt-3 text-2xl font-bold leading-[1.5] text-[var(--foreground)] sm:text-[2rem]">
              なぜJobSwipeなのか
            </h2>
            <p className="mt-4 text-base leading-[1.8] text-[var(--body)]">
              テキストだけの求人票では伝わらない「働くイメージ」を、動画で届けます。
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="card bg-white p-8 transition hover:border-[var(--accent)] hover:shadow-[0_4px_16px_rgba(1,41,58,0.06)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded bg-[var(--accent-light)] text-[var(--accent)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm leading-[1.8] text-[var(--body)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="flow"
        className="flex min-h-[calc(100dvh-3.5rem)] w-full scroll-mt-14 items-center border-y border-[var(--border)] bg-white py-16 sm:min-h-[calc(100dvh-4rem)] sm:scroll-mt-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold text-[var(--accent)]">ご利用の流れ</p>
            <h2 className="mt-3 text-2xl font-bold leading-[1.5] text-[var(--foreground)] sm:text-[2rem]">
              3ステップで始められる
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <span className="text-3xl font-bold text-[var(--accent-light)]">{num}</span>
                <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm leading-[1.8] text-[var(--body)]">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/register" className="btn-primary px-10 py-3.5 text-base">
              今すぐ求人を探す
            </Link>
          </div>
        </div>
      </section>

      <section
        id="company"
        className="flex min-h-[calc(100dvh-3.5rem)] w-full scroll-mt-14 items-center bg-[var(--background)] py-16 sm:min-h-[calc(100dvh-4rem)] sm:scroll-mt-16 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-elevated overflow-hidden bg-white">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-14">
                <p className="text-sm font-bold text-[var(--accent)]">採用ご担当の方へ</p>
                <h2 className="mt-3 text-2xl font-bold leading-[1.5] text-[var(--foreground)] sm:text-[1.75rem]">
                  動画で魅力を伝える採用へ
                </h2>
                <p className="mt-4 text-base leading-[1.8] text-[var(--body)]">
                  動画付き求人の掲載、応募管理、チャット対応まで一元管理。
                  求職者とのミスマッチを減らし、採用効率を高めます。
                </p>
                <Link href="/company/login" className="btn-primary mt-8 inline-flex px-8 py-3">
                  企業ログイン
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex items-center justify-center bg-[var(--accent-light)] p-8 sm:p-12">
                <div className="text-center">
                  <Building2 className="mx-auto h-12 w-12 text-[var(--accent)]" />
                  <p className="mt-4 text-lg font-bold text-[var(--foreground)]">求人動画の掲載・管理</p>
                  <p className="mt-2 text-sm leading-[1.8] text-[var(--body)]">
                    アップロード・審査・公開までワンストップ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Logo size="sm" />
          <p className="text-sm text-[var(--muted)]">
            © {getYearJST()} JobSwipe. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--muted)] sm:gap-6">
            <Link href="/explore" className="font-medium hover:text-[var(--accent)]">
              アプリを開く
            </Link>
            <Link href="/company/login" className="font-medium hover:text-[var(--accent)]">
              企業ログイン
            </Link>
            <Link href="/admin/login" className="font-medium hover:text-[var(--accent)]">
              管理者ログイン
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
