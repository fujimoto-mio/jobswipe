"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "@/components/ui/Logo";
import SeekerAccountMenu from "@/components/seeker/SeekerAccountMenu";
import { useSeekerThemeOptional } from "@/components/seeker/SeekerThemeProvider";

type SeekerBrandHeaderProps = {
  title?: string;
  theme?: "light" | "dark";
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
  menuVariant?: "default" | "overlay";
  showMenu?: boolean;
  logoHref?: string;
  className?: string;
};

export default function SeekerBrandHeader({
  title,
  theme: themeProp,
  backHref,
  onBack,
  action,
  menuVariant = "default",
  showMenu = true,
  logoHref,
  className = "",
}: SeekerBrandHeaderProps) {
  const seekerTheme = useSeekerThemeOptional();
  const theme = themeProp ?? (seekerTheme?.theme === "light" ? "light" : "dark");
  const backButtonClass =
    theme === "dark"
      ? "btn-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white hover:bg-black/50"
      : "btn-icon btn-icon-muted h-9 w-9 shrink-0";

  const logo = <Logo inTopbar theme={theme} />;
  const logoNode = logoHref ? (
    <Link href={logoHref} className="min-w-0 shrink">
      {logo}
    </Link>
  ) : (
    logo
  );

  const titleClass =
    theme === "dark" ? "text-white" : "text-slate-900";

  return (
    <div
      className={`page-container flex items-center justify-between gap-2 px-4 py-2.5 sm:grid sm:grid-cols-[1fr_auto_1fr] ${className}`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:justify-self-start">
        {(backHref || onBack) &&
          (backHref ? (
            <Link href={backHref} className={backButtonClass} aria-label="戻る">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <button type="button" onClick={onBack} className={backButtonClass} aria-label="戻る">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ))}
        <div className="min-w-0">{logoNode}</div>
      </div>

      {title ? (
        <h1
          className={`pointer-events-none hidden max-w-[11rem] truncate px-1 text-center text-base font-bold sm:block ${titleClass}`}
        >
          {title}
        </h1>
      ) : (
        <span aria-hidden className="hidden w-0 sm:block" />
      )}

      <div className="flex items-center justify-end gap-2 sm:justify-self-end">
        {action}
        {showMenu ? <SeekerAccountMenu variant={menuVariant} /> : null}
      </div>
    </div>
  );
}
