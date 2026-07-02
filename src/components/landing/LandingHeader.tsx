"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export const NAV_ITEMS = [
  { id: "plan", label: "プラン" },
  { id: "service", label: "サービス" },
  { id: "faq", label: "よくある質問" },
  { id: "contact", label: "お問い合わせ" },
] as const;

export const SECTION_IDS = [
  "top",
  "why",
  "plan",
  "case",
  "comparison",
  "voice",
  "service",
  "faq",
  "contact",
] as const;

export const HEADER_SCROLL_OFFSET = 88;

function smoothScrollTo(top: number) {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function scrollToSection(id: string) {
  if (id === "top") {
    smoothScrollTo(0);
    window.history.replaceState(null, "", "/");
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET;
  smoothScrollTo(top);
  window.history.replaceState(null, "", `#${id}`);
}

type LandingHeaderProps = {
  onLandingPage?: boolean;
};

export default function LandingHeader({ onLandingPage = false }: LandingHeaderProps) {
  const handleNav = (id: string) => {
    if (onLandingPage) scrollToSection(id);
  };

  return (
    <header className="lp-header">
      <div className="lp-header__inner">
        <Link
          href="/"
          className="lp-header__logo"
          onClick={(e) => {
            if (!onLandingPage) return;
            e.preventDefault();
            handleNav("top");
          }}
        >
          <Logo inTopbar />
        </Link>

        <nav className="lp-header__nav">
          {NAV_ITEMS.map(({ id, label }) =>
            onLandingPage ? (
              <button key={id} type="button" onClick={() => handleNav(id)} className="lp-header-nav-link">
                {label}
              </button>
            ) : (
              <Link key={id} href={`/#${id}`} className="lp-header-nav-link">
                {label}
              </Link>
            )
          )}
        </nav>

        <div className="lp-header__actions">
          <Link href="/company/login" className="lp-header-link lp-header-link--ghost">
            企業ログイン
          </Link>
          <Link href="/login" className="lp-header-link">
            ログイン
          </Link>
          <Link href="/register" className="lp-header-btn">
            無料で始める
          </Link>
        </div>
      </div>
    </header>
  );
}
