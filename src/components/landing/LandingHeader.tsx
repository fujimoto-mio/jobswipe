"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const NAV_ITEMS = [
  { id: "top", label: "TOP" },
  { id: "why", label: "なぜJobSwipe？" },
  { id: "plan", label: "プラン" },
  { id: "case", label: "投稿事例" },
  { id: "comparison", label: "比較" },
  { id: "voice", label: "導入の声" },
  { id: "service", label: "サービス" },
  { id: "faq", label: "よくある質問" },
] as const;

export const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function scrollToSection(id: string) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", "/");
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

type LandingHeaderProps = {
  onLandingPage?: boolean;
};

export default function LandingHeader({ onLandingPage = false }: LandingHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleNav = (id: string) => {
    setDrawerOpen(false);
    if (onLandingPage) {
      scrollToSection(id);
    }
  };

  return (
    <>
      <header className="lp-header">
        <div className="lp-header__inner">
          <Link href="/" className="lp-header__logo" onClick={() => handleNav("top")}>
            <Logo inTopbar />
          </Link>

          <nav className="lp-header__nav-desktop hidden lg:flex flex-1 items-center justify-center gap-6 text-sm font-bold text-[var(--lp-text)]">
            {NAV_ITEMS.map(({ id, label }) =>
              onLandingPage ? (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNav(id)}
                  className="transition-colors hover:text-[var(--lp-teal)]"
                >
                  {label}
                </button>
              ) : (
                <Link key={id} href={id === "top" ? "/" : `/#${id}`} className="transition-colors hover:text-[var(--lp-teal)]">
                  {label}
                </Link>
              )
            )}
          </nav>

          <div className="lp-header__actions">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="lp-header-btn lp-header-btn--text hidden md:inline-flex">
              メールお問い合わせ
              <span className="lp-header-btn__arrow" />
            </a>
            {onLandingPage ? (
              <button type="button" onClick={() => handleNav("contact")} className="lp-header-btn hidden sm:inline-flex">
                お問い合わせ
                <span className="lp-header-btn__arrow" />
              </button>
            ) : (
              <Link href="/#contact" className="lp-header-btn hidden sm:inline-flex">
                お問い合わせ
                <span className="lp-header-btn__arrow" />
              </Link>
            )}
            <button
              type="button"
              className={`lp-hamburger lg:hidden ${drawerOpen ? "is-open" : ""}`}
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="メニュー"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`lp-drawer lg:hidden ${drawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <div className="lp-drawer__panel" onClick={(e) => e.stopPropagation()}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} type="button" className="lp-drawer__link w-full text-left" onClick={() => handleNav(id)}>
              {label}
              <span className="lp-drawer__link-arrow" />
            </button>
          ))}
          <div className="px-6 pt-6 flex flex-col gap-3">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="lp-header-btn w-full justify-center">
              メールお問い合わせ
              <span className="lp-header-btn__arrow" />
            </a>
            <Link href="/register" className="lp-cta-btn w-full" onClick={() => setDrawerOpen(false)}>
              無料で始める
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
