"use client";

import Link from "next/link";
import ServiceLpImage from "@/components/service-lp/ServiceLpImage";
import { FOOTER_LEGAL_LINKS, LP_ASSETS, LP_CONTACT_PATH } from "@/components/service-lp/service-lp-data";
import { APP_NAME } from "@/lib/brand";

export default function ServiceLpFooter() {
  return (
    <footer className="jslp-footer">
      <div className="jslp-footer__inner">
        <div className="jslp-footer__top">
          <div className="jslp-footer__brand">
            <div className="jslp-brand">
              <ServiceLpImage src={LP_ASSETS.logo} alt={`${APP_NAME} ロゴ`} className="jslp-brand__logo" />
              <span className="jslp-brand__name">{APP_NAME}</span>
            </div>
            <div className="jslp-footer__address">
              株式会社MasKOFF
              <br />
              〒150-0021
              <br />
              東京都渋谷区恵比寿西1-33-6-216
            </div>
          </div>

          <nav className="jslp-footer__nav" aria-label="フッターナビゲーション">
            <Link href={LP_CONTACT_PATH} className="jslp-nav-link">
              お問い合わせ
            </Link>
          </nav>
        </div>

        <div className="jslp-footer__bottom">
          <p className="jslp-footer__copy">© 2026 MasKOFF inc.</p>
          <div className="jslp-footer__legal">
            {FOOTER_LEGAL_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="jslp-nav-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label} ↗
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="jslp-nav-link">
                  {link.label} ↗
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
