"use client";

import Link from "next/link";
import { Download, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { usePwaInstallOptional } from "@/components/pwa/PwaInstallProvider";
import { SUPPORT_EMAIL } from "@/lib/constants";

const LEGAL_LINKS = [
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/guidelines", label: "求人掲載ガイドライン" },
] as const;

const SERVICE_LINKS = [
  { href: "/register", label: "無料で始める" },
  { href: "/login", label: "ログイン" },
  { href: "/company/login", label: "企業ログイン" },
  { href: "/explore", label: "アプリを開く" },
] as const;

export default function LandingFooter() {
  const pwa = usePwaInstallOptional();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-col--brand">
            <div className="footer-logo">
              <Logo size="sm" theme="dark" showText={false} />
            </div>
            <p className="footer-company">株式会社MasKOFF</p>
            <div className="footer-office">
              <h4 className="footer-col__title">本社</h4>
              <p>
                〒150-0021
                <br />
                東京都渋谷区恵比寿西
                <br />
                1-33-6-216
              </p>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col__title">お問い合わせ</h4>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="footer-contact__mail">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="footer-col">
            <h4 className="footer-col__title">法的情報</h4>
            <nav className="footer-col__nav" aria-label="法的情報">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="footer-nav__link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="footer-col">
            <h4 className="footer-col__title">サービス</h4>
            <nav className="footer-col__nav" aria-label="サービス">
              {SERVICE_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="footer-nav__link">
                  {link.label}
                </Link>
              ))}
              {pwa?.showInstallUi ? (
                <button
                  type="button"
                  className="footer-nav__link footer-nav__button"
                  onClick={() => pwa.openInstallModal()}
                >
                  <Download className="footer-nav__icon" aria-hidden />
                  アプリをインストール
                </button>
              ) : null}
            </nav>
          </div>
        </div>

        <p className="footer-copy">COPYRIGHT © MasKOFF - ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
