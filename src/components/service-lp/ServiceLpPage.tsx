"use client";

import Link from "next/link";
import ServiceLpHeader from "@/components/service-lp/ServiceLpHeader";
import ServiceLpFooter from "@/components/service-lp/ServiceLpFooter";
import {
  LP_ASSETS,
  LP_CONTACT_PATH,
  POSTING_METHODS,
  PROBLEM_ITEMS,
} from "@/components/service-lp/service-lp-data";

export default function ServiceLpPage() {
  return (
    <div className="jobswipe-lp">
      <ServiceLpHeader />

      <div className="jslp-hero-row">
        <div className="jslp-hero-col">
          <div className="jslp-hero-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LP_ASSETS.hero}
              alt="JobSwipe メインビジュアル"
              className="jslp-hero-image__img"
            />
          </div>

          <h1 className="jslp-hero-title">
            <span className="jslp-accent">インフルエンサーPRの力を</span>
            <br />
            月額定額制で。
          </h1>

          <div className="jslp-block">
            <p className="jslp-section__label">既存採用媒体の課題</p>
            <h2 className="jslp-section__title">
              コストは上がり、応募は減り、仕事を辞める人は増えている。
            </h2>
            <div className="jslp-problem-grid">
              {PROBLEM_ITEMS.map((item) => (
                <div key={item.title} className="jslp-problem-card">
                  <div
                    className={`jslp-problem-card__icon${item.iconSize === "sm" ? " jslp-problem-card__icon--sm" : ""}`}
                    aria-hidden
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="jslp-problem-card__title">{item.title}</div>
                    <div className="jslp-problem-card__text">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="jslp-block jslp-block--spaced">
            <p className="jslp-section__label jslp-accent">JobSwipeとは</p>
            <h2 className="jslp-section__title">スワイプで見て、そのまま応募・面談へ。</h2>
            <p className="jslp-section__lead">
              #JobSwipe!は、求職者が企業紹介動画をスワイプしながら閲覧し、そのまま応募・面談まで進められる新しい採用サービスです。求人票だけでは伝わらない職場の雰囲気や働く人の魅力を、全国の求職者へ動画で届けられます。
            </p>
          </div>

          <div className="jslp-block">
            <h2 className="jslp-section__title jslp-section__title--sm">
              企業様のご負担を抑える、3つの掲載方法
            </h2>
            <div className="jslp-method-grid">
              {POSTING_METHODS.map((item) => (
                <div key={item.number} className="jslp-method-card">
                  <div className="jslp-method-card__number">{item.number}</div>
                  <div className="jslp-method-card__title">{item.title}</div>
                  <div className="jslp-method-card__text">
                    {item.description}
                    {"footnote" in item && item.footnote ? (
                      <span className="jslp-method-card__footnote">{item.footnote}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="jslp-cta">
            <p className="jslp-cta__label">モニター企業様 募集中</p>
            <p className="jslp-cta__title">まずは永年無料でお試しください。</p>
            <p className="jslp-cta__text">
              オンラインで15分ほどのサービス説明も可能です。エン転職、マイナビ転職、@type転職、DODAなど、現在ご利用中の求人媒体と#JobSwipe!を紐づけるだけで掲載費用をコストダウンできる手続きもございますので、お気軽にご相談ください。
            </p>
            <Link href={LP_CONTACT_PATH} className="jslp-cta__btn">
              お問い合わせ
              <span className="jslp-cta__btn-icon" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="jslp-spacer" aria-hidden />

      <ServiceLpFooter />
    </div>
  );
}
