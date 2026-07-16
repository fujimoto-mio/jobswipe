"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { getYearJST } from "@/lib/datetime";
import Logo from "@/components/ui/Logo";
import { APP_NAME } from "@/lib/brand";
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
  return (
    <footer className="lp-footer">
      <div className="lp-footer__overlay" aria-hidden />
      <div className="lp-inner lp-footer__inner">
        <div className="lp-footer__brand">
          <Logo size="sm" theme="dark" showText={false} />
          <p className="lp-footer__company">株式会社Level Frontier</p>
          <p className="lp-footer__tagline">{APP_NAME}運営事務局</p>
        </div>

        <div className="lp-footer__info">
          <dl>
            <dt>お問い合わせ</dt>
            <dd>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="lp-footer__mail">
                <Mail className="h-4 w-4 shrink-0" />
                {SUPPORT_EMAIL}
              </a>
            </dd>
          </dl>
        </div>

        <nav className="lp-footer__legal" aria-label="法的情報">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="lp-footer__legal-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="lp-footer__service" aria-label="サービス">
          {SERVICE_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="lp-footer__copy">
          <small>COPYRIGHT © JOB SWIPE / LEVEL FRONTIER — ALL RIGHTS RESERVED. {getYearJST()}</small>
        </div>
      </div>
    </footer>
  );
}
