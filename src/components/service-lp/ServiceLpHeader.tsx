"use client";

import Link from "next/link";
import ServiceLpImage from "@/components/service-lp/ServiceLpImage";
import { LP_ASSETS, LP_BASE_PATH, LP_CONTACT_PATH } from "@/components/service-lp/service-lp-data";

export default function ServiceLpHeader() {
  return (
    <header className="jslp-header">
      <Link href={LP_BASE_PATH} className="jslp-brand">
        <ServiceLpImage src={LP_ASSETS.logo} alt="JobSwipe ロゴ" className="jslp-brand__logo" />
        <span className="jslp-brand__name">JobSwipe</span>
      </Link>

      <nav className="jslp-header__nav">
        <Link href={LP_CONTACT_PATH} className="jslp-header__cta">
          お問い合わせ
          <span className="jslp-header__cta-icon" aria-hidden>
            →
          </span>
        </Link>
      </nav>
    </header>
  );
}
