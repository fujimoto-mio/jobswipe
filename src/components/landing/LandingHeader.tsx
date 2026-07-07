"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import LandingPwaInstallButton from "@/components/landing/LandingPwaInstallButton";

export const NAV_ITEMS = [
  { id: "sec01", label: "なぜ辞めてしまうの？" },
  { id: "sec02", label: "プラン" },
  { id: "sec05", label: "導入企業の声" },
  { id: "sec08", label: "よくある質問" },
] as const;

export const SECTION_IDS = [
  "top",
  "sec01",
  "sec02",
  "sec03",
  "sec04",
  "sec05",
  "sec06",
  "sec07",
  "sec08",
  "contact",
] as const;

export const HEADER_SCROLL_OFFSET = 72;

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
    <header>
      <div className="header-inner">
        <Link
          href="/"
          className="logo"
          onClick={(e) => {
            if (!onLandingPage) return;
            e.preventDefault();
            handleNav("top");
          }}
        >
          <Logo inTopbar />
        </Link>

        <nav>
          {onLandingPage ? (
            <>
              {NAV_ITEMS.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => handleNav(id)} className="lp-nav-text">
                  {label}
                </button>
              ))}
              <LandingPwaInstallButton />
              <button type="button" onClick={() => handleNav("contact")} className="btn-nav">
                ✉ お問い合わせ
              </button>
            </>
          ) : (
            <>
              {NAV_ITEMS.map(({ id, label }) => (
                <Link key={id} href={`/#${id}`} className="lp-nav-text">
                  {label}
                </Link>
              ))}
              <LandingPwaInstallButton />
              <Link href="/#contact" className="btn-nav">
                ✉ お問い合わせ
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
