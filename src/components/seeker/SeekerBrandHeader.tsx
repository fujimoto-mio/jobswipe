"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "@/components/ui/Logo";
import SeekerAccountMenu from "@/components/seeker/SeekerAccountMenu";
import PwaInstallTopbarButton from "@/components/pwa/PwaInstallTopbarButton";
import { useSeekerThemeOptional } from "@/components/seeker/SeekerThemeProvider";
import { DEFAULT_SEEKER_THEME } from "@/lib/seeker-theme";

type SeekerBrandHeaderProps = {
  title?: string;
  theme?: "light" | "dark";
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
  menuVariant?: "default" | "overlay";
  showMenu?: boolean;
  showInstallButton?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  onInstallOpenChange?: (open: boolean) => void;
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
  showInstallButton = false,
  onMenuOpenChange,
  onInstallOpenChange,
  logoHref,
  className = "",
}: SeekerBrandHeaderProps) {
  const seekerTheme = useSeekerThemeOptional();
  const theme = themeProp ?? seekerTheme?.theme ?? DEFAULT_SEEKER_THEME;
  const backButtonClass =
    theme === "dark"
      ? "btn-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-white/92 transition hover:bg-white/10 active:scale-95"
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

      <div className="flex items-center justify-end gap-1.5 sm:justify-self-end sm:gap-2">
        {action}
        {showInstallButton ? (
          <PwaInstallTopbarButton variant={menuVariant} onOpenChange={onInstallOpenChange} />
        ) : null}
        {showMenu ? <SeekerAccountMenu variant={menuVariant} onOpenChange={onMenuOpenChange} /> : null}
      </div>
    </div>
  );
}
