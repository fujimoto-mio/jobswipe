"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LandingHeader, { scrollToSection, SECTION_IDS } from "@/components/landing/LandingHeader";
import LandingContactForm from "@/components/landing/LandingContactForm";
import LandingFooter from "@/components/landing/LandingFooter";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STATS = [
  { label: "応募完了まで", value: "最短", suffix: "1分" },
  { label: "職場の雰囲気", value: "動画で", suffix: "伝わる" },
  { label: "求職者の利用料", value: "完全", suffix: "無料" },
];

const PLAN_FEATURES = [
  { title: "動画求人", desc: "15〜30秒のショート動画で職場の空気感を伝達" },
  { title: "スワイプ操作", desc: "気になる求人を直感的に保存・スキップ" },
  { title: "チャット", desc: "応募後は企業担当者とその場で連絡" },
  { title: "応募管理", desc: "プロフィール自動入力でスムーズに応募" },
  { title: "レポート", desc: "保存・応募状況をマイページで一元管理" },
];

const CASE_ITEMS = [
  { src: "/companies/job-001.jpg", label: "IT・Web業界" },
  { src: "/companies/job-002.jpg", label: "スタートアップ" },
  { src: "/companies/job-003.jpg", label: "クリエイティブ" },
  { src: "/companies/job-004.jpg", label: "メディア" },
];

const COMPARISON_ROWS = [
  { label: "目的", jobswipe: "職場の空気感・ミスマッチ防止", other: "応募数の獲得", media: "閲覧数・露出" },
  { label: "情報形式", jobswipe: "ショート動画＋スワイプUI", other: "テキスト中心の求人票", media: "バナー・記事広告" },
  { label: "KPI", jobswipe: "応募の納得度・定着", other: "応募数", media: "PV・クリック数" },
  { label: "コスト（求職者）", jobswipe: "無料", other: "無料", media: "無料" },
];

const VOICES = [
  {
    meta: "東京都 / IT企業",
    title: "動画で社風が伝わり、ミスマッチが減った",
    body: "テキストだけの求人票では伝わらなかった職場の雰囲気が、動画で一目でわかるようになりました。応募者との初期コミュニケーションもスムーズです。",
  },
  {
    meta: "大阪府 / 建設業",
    title: "若手の応募が増えました",
    body: "スワイプ形式は若い求職者に好評で、動画を見て興味を持った方からの応募が着実に増えています。",
  },
  {
    meta: "東京都 / 不動産業",
    title: "採用担当の工数が大幅に削減",
    body: "応募からチャットまでアプリ内で完結するため、メールや電話のやり取りが減り、採用活動の効率が上がりました。",
  },
];

const FAQ_ITEMS = [
  {
    q: "JobSwipeは無料で使えますか？",
    a: "はい、求職者の方は登録・求人閲覧・応募・チャットまで無料でご利用いただけます。",
  },
  {
    q: "動画がない求人もありますか？",
    a: "動画付き求人を中心に掲載しています。企業によってはテキスト情報のみの求人もございます。",
  },
  {
    q: "企業として求人を掲載するには？",
    a: "企業アカウントを作成いただき、管理画面から求人（動画付き）を登録してください。審査後に公開されます。",
  },
  {
    q: "社員の顔出しが難しい場合でも動画は掲載できますか？",
    a: "職場の雰囲気や業務風景、オフィスツアーなど、顔出しなしでも効果的な動画構成が可能です。",
  },
];

const PARTNER_LOGOS = [
  "/companies/techstart-logo.svg",
  "/companies/cloudsol-logo.svg",
  "/companies/mediaworks-logo.svg",
  "/companies/innovation-logo.svg",
  "/companies/airecruit-logo.svg",
  "/companies/creativelab-logo.svg",
];

function PhoneMock({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="lp-mock">
      <div className="lp-mock__notch" />
      <Image src={src} alt={alt} width={400} height={700} className="h-full w-full object-cover" />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const role = data.session.user.app_metadata?.role ?? data.session.user.user_metadata?.role;
      if (role === "admin") router.replace("/admin");
      else if (role === "company") router.replace("/company");
      else router.replace("/explore");
    });
  }, [router]);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!SECTION_IDS.includes(hash as (typeof SECTION_IDS)[number])) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => scrollToSection(hash));
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const logoSlides = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <div className="lp-root w-full">
      <LandingHeader onLandingPage />

      {/* Hero */}
      <section id="top" className="lp-hero">
        <div className="lp-hero__circle lp-hero__circle--1" aria-hidden />
        <div className="lp-hero__circle lp-hero__circle--2" aria-hidden />
        <div className="lp-inner lp-hero__content">
          <p className="lp-hero__eyebrow">動画×スワイプで、いい仕事に出会う方へ</p>
          <h1 className="lp-hero__title">
            動画で届ける、
            <br />
            職場の&ldquo;空気感&rdquo;。
          </h1>
          <p className="lp-hero__lead">
            JobSwipeは求人動画をスワイプするだけで探せる、新しい求職プラットフォーム。
            応募者が知っていれば生じなかったミスマッチを、動画で先に防ぎます。
          </p>
          <div className="lp-hero__stats">
            {STATS.map((s) => (
              <div key={s.label} className="lp-stat">
                <p className="lp-stat__label">{s.label}</p>
                <p className="lp-stat__value">{s.value}</p>
                <span className="lp-stat__suffix">{s.suffix}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="lp-cta-btn">
              無料で始める
            </Link>
            <button type="button" onClick={() => scrollToSection("contact")} className="lp-cta-btn lp-cta-btn--outline">
              お問い合わせ
            </button>
          </div>
          <div className="lp-hero__visual">
            <PhoneMock src="/companies/job-001.jpg" alt="求人動画サンプル1" />
            <PhoneMock src="/companies/job-003.jpg" alt="求人動画サンプル2" />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="lp-section lp-section--white">
        <div className="lp-inner">
          <h2 className="lp-section-heading">Partner Companies</h2>
          <p className="lp-section-title">掲載企業さま</p>
          <div className="lp-logo-slider">
            <div className="lp-logo-track">
              {logoSlides.map((src, i) => (
                <div key={`${src}-${i}`} className="lp-logo-slide">
                  <Image src={src} alt="" width={120} height={40} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="lp-section lp-section--gray scroll-mt-24">
        <div className="lp-inner--wide">
          <div className="lp-white-panel">
            <h2 className="lp-section-heading">Why?</h2>
            <p className="lp-quote">「求人票は良さそうだった。でも、想像と違った」</p>
            <p className="lp-section-title">なぜ、採用しても辞めてしまうの？</p>
            <p className="lp-section-lead">
              求職者が内定辞退・早期離職する理由の多くは、事前の認識ギャップにあります。
            </p>
            <div className="lp-why-grid">
              <div className="lp-why-card">
                <p className="lp-why-card__role">企業</p>
                <p className="lp-why-card__text">&ldquo;採用&rdquo;がゴールになっている</p>
              </div>
              <div className="lp-why-card">
                <p className="lp-why-card__role">求職者</p>
                <p className="lp-why-card__text">&ldquo;内定&rdquo;がゴールになっている</p>
              </div>
            </div>
            <p className="lp-result-label">その結果</p>
            <p className="lp-section-lead">
              テキストの求人票だけでは職場の空気感や人間関係が伝わらず、入社後にミスマッチが顕在化してしまいます。
            </p>
            <p className="lp-section-sub mt-8">ただし、最重要は「投稿数」ではありません。</p>
            <p className="lp-section-lead">
              投稿の量ではなく&ldquo;何を伝えるか&rdquo;。JobSwipeなら、動画で会社のリアルな魅力が伝わり、入社前のミスマッチを防ぎます。
            </p>
            <div className="lp-highlight-box">
              &ldquo;認知ではなく、納得&rdquo;の採用へ。
              <br />
              動画×スワイプで職場の「空気」を届ける設計。
            </div>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section id="plan" className="lp-section lp-section--white scroll-mt-24">
        <div className="lp-inner">
          <h2 className="lp-section-heading">Plan</h2>
          <p className="lp-section-title">一般的な求人媒体とは目的も成果も違う</p>
          <p className="lp-section-sub">JobSwipe 基本プラン</p>
          <div className="lp-plan-card">
            <div className="lp-plan-card__head">
              <p className="lp-plan-card__name">動画×スワイプ求人プラットフォーム</p>
              <p className="lp-plan-card__price">
                求職者利用料 <strong>無料</strong>
              </p>
            </div>
            <div className="lp-plan-features">
              {PLAN_FEATURES.map((f) => (
                <div key={f.title} className="lp-plan-feature">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="lp-section-lead mt-10">
            「企業が見せたい情報」と「求職者が知りたい情報」には大きなズレがあります。JobSwipeは動画で&ldquo;社内の空気感&rdquo;を先に届けます。
          </p>
        </div>
      </section>

      {/* Case */}
      <section id="case" className="lp-section lp-section--gray scroll-mt-24">
        <div className="lp-inner">
          <h2 className="lp-section-heading">Case</h2>
          <p className="lp-section-title">動画求人の掲載事例</p>
          <div className="lp-case-scroll">
            {CASE_ITEMS.map((item) => (
              <div key={item.src} className="lp-case-item">
                <PhoneMock src={item.src} alt={item.label} />
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className="lp-section lp-section--white scroll-mt-24">
        <div className="lp-inner--narrow">
          <h2 className="lp-section-heading">Comparison</h2>
          <p className="lp-section-title">他のサービスとの比較</p>
          <div className="mt-10 overflow-x-auto">
            <table className="lp-compare min-w-[640px]">
              <thead>
                <tr>
                  <th />
                  <th className="lp-compare--highlight">JobSwipe</th>
                  <th>従来の求人媒体</th>
                  <th>求人広告</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th>{row.label}</th>
                    <td className="lp-compare--highlight">{row.jobswipe}</td>
                    <td>{row.other}</td>
                    <td>{row.media}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Voice */}
      <section id="voice" className="lp-section lp-section--gray scroll-mt-24">
        <div className="lp-inner">
          <h2 className="lp-section-heading">Voice</h2>
          <p className="lp-section-title">導入企業の声</p>
          <div className="lp-voice-grid">
            {VOICES.map((v) => (
              <article key={v.title} className="lp-voice-card">
                <p className="lp-voice-card__meta">{v.meta}</p>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Service */}
      <section id="service" className="lp-section lp-section--white scroll-mt-24">
        <div className="lp-inner">
          <h2 className="lp-section-heading">Service</h2>
          <p className="lp-section-title">動画で信用形成を勝ち取る</p>
          <p className="lp-section-lead">
            動画×スワイプの力で「中小企業でもミスマッチの少ない採用を実現する」求職プラットフォーム
          </p>
          <p className="lp-section-sub mt-10">こんな採用の悩みを解決</p>
          <div className="lp-pain-grid">
            <div className="lp-pain-card">ネームバリューのある大手企業に勝てない</div>
            <div className="lp-pain-card">条件だけでは人が集まらない</div>
            <div className="lp-pain-card">採用後の定着率が低い</div>
          </div>
          <p className="lp-section-lead mt-10">
            働く人や会社の文化・雰囲気を動画で見てもらい、企業のソフト面で勝負できる環境をご用意。ショート動画を通じて企業の魅力を求職者に直接届けます。
          </p>
          <div className="mt-10 text-center">
            <Link href="/company/login" className="lp-cta-btn">
              企業ログインはこちら
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lp-section lp-section--gray scroll-mt-24">
        <div className="lp-inner--narrow">
          <h2 className="lp-section-heading">Faq</h2>
          <p className="lp-section-title">よくある質問</p>
          <div className="lp-faq-list">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="lp-faq-item">
                <summary>{item.q}</summary>
                <p className="lp-faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="lp-section lp-contact scroll-mt-24">
        <div className="lp-inner--narrow">
          <h2 className="lp-section-heading">Contact</h2>
          <p className="lp-section-title">お問い合わせ</p>
          <p className="lp-section-lead">下記フォームへ必要事項をご記入の上、送信ください。</p>
          <LandingContactForm />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
