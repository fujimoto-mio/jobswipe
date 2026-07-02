"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

const NAV_ITEMS = [
  { id: "features", label: "特徴" },
  { id: "flow", label: "使い方" },
  { id: "company", label: "企業の方へ", short: "企業" },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

type LandingHeaderProps = {
  onLandingPage?: boolean;
};

export default function LandingHeader({ onLandingPage = false }: LandingHeaderProps) {
  return (
    <header className="shrink-0 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo inTopbar />
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-4 text-sm font-medium text-[var(--body)] sm:gap-8">
          {NAV_ITEMS.map(({ id, label, short }) =>
            onLandingPage ? (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(id);
                }}
                className="whitespace-nowrap transition-colors hover:text-[var(--accent)]"
              >
                {short ? (
                  <>
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </>
                ) : (
                  label
                )}
              </a>
            ) : (
              <Link
                key={id}
                href={`/#${id}`}
                className="whitespace-nowrap transition-colors hover:text-[var(--accent)]"
              >
                {short ? (
                  <>
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </>
                ) : (
                  label
                )}
              </Link>
            )
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/company/login"
            className="hidden text-sm font-medium text-[var(--body)] hover:text-[var(--accent)] sm:inline"
          >
            企業ログイン
          </Link>
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[var(--body)] hover:text-[var(--accent)] md:inline"
          >
            ログイン
          </Link>
          <Link href="/register" className="btn-primary px-4 py-2 text-sm sm:px-5">
            無料で始める
          </Link>
        </div>
      </div>
    </header>
  );
}

export { scrollToSection, NAV_ITEMS };
