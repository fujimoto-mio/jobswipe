"use client";

import { useEffect } from "react";
import ServiceLpHeader, { scrollToSection, SECTION_IDS } from "@/components/service-lp/ServiceLpHeader";
import ServiceLpContactForm from "@/components/service-lp/ServiceLpContactForm";
import ServiceLpFooter from "@/components/service-lp/ServiceLpFooter";
import {
  CASE_ITEMS,
  COMPARISON_ROWS,
  FAQ_ITEMS,
  INDUSTRY_TAGS,
  PAIN_POINTS,
  PARTNER_LOGOS,
  PLAN_FEATURES,
  PLAN_RESULTS,
  VOICES,
  lpImg,
} from "@/components/service-lp/service-lp-data";

function CaseMockup({ caseImage }: { caseImage: string }) {
  return (
    <div className="case-item">
      <img src={lpImg("mockup-img01.webp")} alt="" className="case-item__frame" />
      <div className="case-item__screen">
        <img src={lpImg(caseImage)} alt="投稿事例" />
      </div>
      <img src={lpImg("mockup-img02.webp")} alt="" className="case-item__bezel" />
    </div>
  );
}

export default function ServiceLpPage() {
  const logoSlides = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

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

  return (
    <div className="service-lp">
      <ServiceLpHeader />

      <section id="top" className="hero">
        <div className="hero-bg1" aria-hidden />
        <div className="hero-bg2" aria-hidden />
        <div className="hero-dot1" aria-hidden />
        <div className="hero-dot2" aria-hidden />
        <div className="hero-inner">
          <div className="hero-text">
            <p className="hero-label">選ばれる企業になるためにSNSを始めたい方へ</p>
            <h1 className="hero-title">
              <span className="hero-title__lead">採用のプロ集団が提案する</span>
              <span className="hero-title__sub">
                <span className="hero-title__accent">SNS運用代行</span>サービス
              </span>
            </h1>
            <p className="hero-desc">
              SNS運用×動画で届ける会社の<strong>&ldquo;空気感&rdquo;</strong>。
              <br />
              応募者が知っていれば生じなかったミスマッチを、
              <br />
              <strong style={{ color: "#1a56c8" }}>月15万円から完全代行</strong>で防ぎます。
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-label">説明会予約率</div>
                <div className="stat-num">176%</div>
                <div className="stat-up">▲ 向上</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">面接出席率</div>
                <div className="stat-num">142%</div>
                <div className="stat-up">▲ 向上</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">内定承諾率</div>
                <div className="stat-num">118%</div>
                <div className="stat-up">▲ 改善</div>
              </div>
            </div>
            <button type="button" className="btn-hero" onClick={() => scrollToSection("contact")}>
              無料で資料をもらう →
            </button>
          </div>
          <div className="hero-visual">
            <div className="hero-visual__group">
              <img
                src={lpImg("fv-img01.webp")}
                alt="スマートフォンを見る男性"
                className="hero-visual__img hero-visual__img--left"
              />
              <img
                src={lpImg("fv-img02.webp")}
                alt="スマートフォンを見る女性"
                className="hero-visual__img hero-visual__img--right"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="logos-section">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#888",
              letterSpacing: 3,
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            PARTNER COMPANIES — 導入企業さま
          </p>
        </div>
        <div className="logos-track">
          <div className="logos-inner">
            {logoSlides.map((logo, i) => (
              <img
                key={`${logo}-${i}`}
                src={lpImg(logo)}
                alt="導入先ロゴ"
                style={{ height: 36, objectFit: "contain" }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="sec01" className="why-section">
        <div className="why-inner">
          <div className="text-center mb-60">
            <span className="section-tag">WHY?</span>
            <p className="section-sub">「求人票は良かった。でも、想像と違った」</p>
            <h2 className="section-title mb-16">
              なぜ、採用しても
              <br />
              辞めてしまうの？
            </h2>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.8 }}>
              Z世代が内定辞退・早期離職する理由の多くは、
              <br />
              事前の認識ギャップにあります。
            </p>
          </div>

          <div className="why-cards">
            <div className="why-card why-card--blue">
              <p className="why-card__label">企業側</p>
              <img src={lpImg("why-img01.webp")} alt="" className="why-card__image" />
              <p className="why-card__text">
                &ldquo;採用&rdquo;が
                <br />
                ゴールになっている
              </p>
            </div>
            <div className="why-divider" aria-hidden>
              <div className="why-divider__line" />
              <div className="why-divider__icon">⚡</div>
              <div className="why-divider__line" />
            </div>
            <div className="why-card why-card--gold">
              <p className="why-card__label">学生側</p>
              <img src={lpImg("why-img02.webp")} alt="" className="why-card__image" />
              <p className="why-card__text">
                &ldquo;内定&rdquo;が
                <br />
                ゴールになっている
              </p>
            </div>
          </div>

          <div className="why-result">
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e84040", marginBottom: 10 }}>▼ その結果</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0d1a38", lineHeight: 1.7 }}>
              面接ではお互いに<strong style={{ color: "#e84040" }}>&ldquo;良いトコロ&rdquo;</strong>しか見せ合わないから、
              <br />
              入社後にミスマッチが顕在化。
            </p>
          </div>

          <div className="why-solution">
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background: "rgba(255,255,255,0.03)",
                borderRadius: "50%",
              }}
              aria-hidden
            />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16, position: "relative" }}>
              採用市場では当たり前となったこの構造に、
            </p>
            <h3
              style={{
                fontSize: "clamp(20px, 3vw, 30px)",
                fontWeight: 900,
                lineHeight: 1.4,
                marginBottom: 20,
                position: "relative",
              }}
            >
              私たちは <span style={{ color: "#7eb4ff" }}>&ldquo;SNSで信頼関係を構築する&rdquo;</span>
              <br />
              という解決策を提示します。
            </h3>
            <div
              style={{
                width: 60,
                height: 3,
                background: "#c8952a",
                borderRadius: 2,
                margin: "20px auto",
                position: "relative",
              }}
            />
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.8,
                position: "relative",
                maxWidth: 540,
                margin: "0 auto",
              }}
            >
              投稿の量ではなく<strong style={{ color: "#fff" }}>&ldquo;何を伝えるか&rdquo;</strong>。
              <br />
              Z世代に向けて会社のリアルな魅力が伝わり、
              <br />
              入社前・入社後のミスマッチを防ぎます。
            </p>
          </div>
        </div>
      </section>

      <section id="sec02" className="plan-section">
        <div className="plan-inner">
          <div className="text-center mb-60">
            <span className="section-tag">PLAN</span>
            <p className="section-sub">一般的なSNS運用代行サービスとは目的も成果も違う</p>
            <h2 className="section-title">信用形成プラン</h2>
          </div>

          <div className="plan-card">
            <div className="plan-header">
              <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 8 }}>月額費用</p>
              <p className="plan-price">
                15万円<span style={{ fontSize: 24, fontWeight: 600 }}>〜</span>
              </p>
            </div>
            <div className="plan-features">
              {PLAN_FEATURES.map((feature) => (
                <div key={feature.title} className={`plan-feature${feature.full ? " plan-feature--full" : ""}`}>
                  <div className="plan-icon">{feature.icon}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1a38", marginBottom: 4 }}>{feature.title}</div>
                    <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, whiteSpace: "pre-line" }}>{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="plan-results">
            {PLAN_RESULTS.map((result) => (
              <div key={result.label} className="plan-result-card">
                <div style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 600 }}>{result.label}</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#1a56c8",
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  }}
                >
                  {result.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sec03" className="case-section">
        <div className="case-bg-glow" aria-hidden />
        <div className="case-inner">
          <div className="text-center mb-60">
            <span className="dark-tag">CASE</span>
            <h2 className="section-title" style={{ color: "#fff" }}>
              Z世代採用の投稿事例
            </h2>
          </div>
          <div className="case-grid">
            {CASE_ITEMS.map((caseImage) => (
              <CaseMockup key={caseImage} caseImage={caseImage} />
            ))}
          </div>
        </div>
      </section>

      <section id="sec04" className="comparison-section">
        <div className="comparison-inner">
          <div className="text-center mb-60">
            <span className="section-tag">COMPARISON</span>
            <h2 className="section-title">他のサービスとの比較</h2>
          </div>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="comparison-table__corner" />
                  <th className="th-highlight">
                    <span className="comparison-badge">おすすめ</span>
                    信用形成プラン
                  </th>
                  <th className="comparison-table__head">他社SNS運用</th>
                  <th className="comparison-table__head comparison-table__head--last">求人媒体系</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="comparison-table__label">{row.label}</td>
                    <td className={`td-highlight${row.price ? " td-highlight--price" : ""}`}>{row.highlight}</td>
                    <td className={`comparison-table__cell${row.price ? " comparison-table__cell--price" : ""}`}>
                      {row.other1}
                    </td>
                    <td
                      className={`comparison-table__cell comparison-table__cell--last${row.price ? " comparison-table__cell--price" : ""}`}
                    >
                      {row.other2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="sec05" className="voice-section">
        <div className="voice-inner">
          <div className="text-center mb-60">
            <span className="section-tag">VOICE</span>
            <h2 className="section-title">導入企業の声をご紹介</h2>
          </div>
          <div className="voice-grid">
            {VOICES.map((voice) => (
              <div key={voice.title} className="voice-card">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={lpImg(voice.illust)}
                    alt=""
                    style={{ width: 60, height: 60, objectFit: "contain", flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 11, color: "#888" }}>{voice.region}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{voice.meta}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1a38", marginBottom: 10 }}>{voice.title}</div>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>{voice.body}</p>
                </div>
                <div style={{ color: "#c8952a", fontSize: 14 }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sec06" className="service-section">
        <div className="service-inner">
          <div className="text-center mb-60">
            <span className="section-tag">SERVICE</span>
            <p className="section-sub">30秒の動画で信用形成を勝ち取る秘密は</p>
            <h2 className="section-title">
              SNS×動画の力で
              <br />
              <span style={{ color: "#1a56c8" }}>「中小企業でも新卒採用を成功させる」</span>
              <br />
              SNS運用代行サービス
            </h2>
          </div>
          <div className="industry-tags">
            {INDUSTRY_TAGS.map((tag) => (
              <span key={tag} className="industry-tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="service-panel">
            <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 800, color: "#0d1a38", marginBottom: 32 }}>
              中小企業が採用に苦しむ悩みを解決
            </h3>
            <div className="pain-grid">
              {PAIN_POINTS.map((pain) => (
                <div key={pain.text} className="pain-card">
                  <div style={{ fontSize: 30, marginBottom: 12 }}>{pain.emoji}</div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1a38", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    {pain.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="service-cta">
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 20 }}>
              働く人や会社の文化・雰囲気を見てもらい、企業のソフト面で勝負できる環境をご用意。
              <br />
              ショート動画を通して企業の新たな魅力を創造し学生に直接届ける
            </p>
            <h3 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 900 }}>
              求人広告代理店が本気で作った
              <br />
              <span style={{ color: "#7eb4ff" }}>Z世代の心をつかむ新卒プラットフォームです。</span>
            </h3>
          </div>
        </div>
      </section>

      <section id="sec07" className="management-section">
        <div className="management-inner">
          <div className="text-center mb-60">
            <span className="section-tag">SNS MANAGEMENT</span>
            <p className="section-sub">まだSNSアカウントすら持ってないから...という企業でも安心</p>
            <h2 className="section-title">
              SNS運用目的に応じて
              <br />
              多様なプランもご用意
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "14px 18px",
                      background: "#e8edf4",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "left",
                      borderRadius: "12px 0 0 0",
                    }}
                  >
                    プラン
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      background: "#e8edf4",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    採用促進
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      background: "#e8edf4",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    アカウント育成
                  </th>
                  <th className="mgmt-highlight-th" style={{ padding: "14px 18px", fontSize: 13, textAlign: "center" }}>
                    信用形成
                  </th>
                  <th
                    style={{
                      padding: "14px 18px",
                      background: "#e8edf4",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#666",
                      textAlign: "center",
                      borderRadius: "0 12px 0 0",
                    }}
                  >
                    オウンドメディア強化
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #e8edf4",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#444",
                      background: "#fafafa",
                    }}
                  >
                    動画制作
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid #e8edf4", textAlign: "center", fontSize: 13, color: "#666", background: "#fff" }}>月2本</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid #e8edf4", textAlign: "center", fontSize: 13, color: "#666", background: "#fff" }}>月4本</td>
                  <td className="mgmt-highlight-td" style={{ padding: "14px 18px", borderBottom: "1px solid #dbe6ff", fontSize: 13 }}>月4本</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid #e8edf4", textAlign: "center", fontSize: 13, color: "#666", background: "#fff" }}>月8本</td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #e8edf4",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#444",
                      background: "#fafafa",
                    }}
                  >
                    ストーリーズ
                  </td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid #e8edf4", textAlign: "center", fontSize: 13, color: "#999", background: "#fff" }}>—</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid #e8edf4", textAlign: "center", fontSize: 13, color: "#999", background: "#fff" }}>—</td>
                  <td className="mgmt-highlight-td" style={{ padding: "14px 18px", borderBottom: "1px solid #dbe6ff", fontSize: 13 }}>毎日更新</td>
                  <td style={{ padding: "14px 18px", borderBottom: "1px solid #e8edf4", textAlign: "center", fontSize: 13, color: "#666", background: "#fff" }}>毎日更新</td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "14px 18px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#444",
                      background: "#fafafa",
                      borderRadius: "0 0 0 12px",
                    }}
                  >
                    月額費用
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#444", background: "#fff" }}>8万円〜</td>
                  <td style={{ padding: "14px 18px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#444", background: "#fff" }}>12万円〜</td>
                  <td className="mgmt-highlight-td" style={{ padding: "14px 18px", fontSize: 15 }}>15万円〜</td>
                  <td style={{ padding: "14px 18px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#444", background: "#fff", borderRadius: "0 0 12px 0" }}>20万円〜</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mgmt-summary">
            <p style={{ fontSize: 16, fontWeight: 800, color: "#0d1a38", marginBottom: 6 }}>企画・撮影・編集・投稿</p>
            <p style={{ fontSize: 15, color: "#1a56c8", fontWeight: 700 }}>すべて代行します</p>
          </div>
        </div>
      </section>

      <section id="sec08" className="faq-section">
        <div className="faq-inner">
          <div className="text-center mb-60">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">よくある質問</h2>
          </div>
          <div className="faq-list">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="faq-item">
                <div className="faq-q">
                  {item.useIllust ? (
                    <img src={lpImg("faq-illust-q.webp")} alt="Q" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
                  ) : (
                    <div className="faq-badge-q">Q</div>
                  )}
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0d1a38", lineHeight: 1.6 }}>{item.q}</p>
                </div>
                <div className="faq-a">
                  {item.useIllust ? (
                    <img src={lpImg("faq-illust-a.webp")} alt="A" style={{ width: 36, height: 36, objectFit: "contain", flexShrink: 0 }} />
                  ) : (
                    <div className="faq-badge-a">A</div>
                  )}
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-inner">
          <div className="text-center mb-48">
            <span className="section-tag">CONTACT</span>
            <h2 className="section-title">お問い合わせ</h2>
          </div>

          <div className="contact-gift">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#7eb4ff", marginBottom: 10 }}>
                お問い合わせいただいた企業様に特別なプレゼントをご用意
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.5, marginBottom: 14 }}>
                新卒採用に効くSNS活用術！
                <br />
                成功の秘訣を今日からお役立てください
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {["なぜ今SNSが必要なのか", "SNS市場について", "新卒採用にもたらす効果"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                    <span style={{ color: "#c8952a" }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <img
              src={lpImg("contact-img.webp")}
              alt="採用向けSNS運用代行の提案資料"
              style={{ width: 180, objectFit: "contain", flexShrink: 0, borderRadius: 12 }}
            />
          </div>

          <ServiceLpContactForm />
        </div>
      </section>

      <ServiceLpFooter />
    </div>
  );
}
