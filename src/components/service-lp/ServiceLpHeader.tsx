"use client";

import Link from "next/link";
import { LP_ASSETS, LP_BASE_PATH, LP_CONTACT_PATH } from "@/components/service-lp/service-lp-data";

export default function ServiceLpHeader() {
  return (
    <header className="jslp-header">
      <Link href={LP_BASE_PATH} className="jslp-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LP_ASSETS.logo} alt="JobSwipe ロゴ" className="jslp-brand__logo" />
        <span className="jslp-brand__name">JobSwipe</span>
      </Link>

      <nav className="jslp-header__nav">
        <Link href={LP_CONTACT_PATH} className="jslp-nav-link">
          お問い合わせ
        </Link>
      </nav>
    </header>
  );
}
