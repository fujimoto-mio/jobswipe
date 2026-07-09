"use client";

import Link from "next/link";
import ServiceLpHeader from "@/components/service-lp/ServiceLpHeader";
import ServiceLpFooter from "@/components/service-lp/ServiceLpFooter";
import ServiceLpContactForm from "@/components/service-lp/ServiceLpContactForm";
import { LP_BASE_PATH } from "@/components/service-lp/service-lp-data";

export default function ServiceLpContactPage() {
  return (
    <div className="jobswipe-lp">
      <ServiceLpHeader />

      <main className="jslp-contact-page">
        <div className="jslp-contact-page__inner">
          <Link href={LP_BASE_PATH} className="jslp-contact-page__back">
            ← JobSwipe トップへ戻る
          </Link>

          <header className="jslp-contact-page__header">
            <p className="jslp-section__label jslp-accent">お問い合わせ</p>
            <h1 className="jslp-section__title">まずはお気軽にご相談ください</h1>
            <p className="jslp-section__lead">
              モニター企業のご相談、サービス説明のご依頼など、下記フォームよりお送りください。
            </p>
          </header>

          <div className="jslp-contact-card">
            <ServiceLpContactForm />
          </div>
        </div>
      </main>

      <ServiceLpFooter />
    </div>
  );
}
