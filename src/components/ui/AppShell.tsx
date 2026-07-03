"use client";

import type { ReactNode } from "react";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";
import { useSeekerThemeOptional } from "@/components/seeker/SeekerThemeProvider";

type AppHeaderProps = {
  title?: string;
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
  theme?: "light" | "dark";
  showMenu?: boolean;
  menuVariant?: "default" | "overlay";
  logoHref?: string;
  className?: string;
};

export function AppHeader({
  title,
  backHref,
  onBack,
  action,
  theme,
  showMenu = true,
  menuVariant = "default",
  logoHref,
  className = "",
}: AppHeaderProps) {
  const seekerTheme = useSeekerThemeOptional();
  const resolvedTheme = theme ?? (seekerTheme?.theme === "light" ? "light" : "dark");

  return (
    <header className={`page-header ${className}`.trim()}>
      <SeekerBrandHeader
        title={title}
        theme={resolvedTheme}
        backHref={backHref}
        onBack={onBack}
        action={action}
        showMenu={showMenu}
        menuVariant={menuVariant}
        logoHref={logoHref}
      />
    </header>
  );
}

export function AppPage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`page-shell ${className}`.trim()}>{children}</div>;
}

export function AppBadge({ children }: { children: ReactNode }) {
  return <span className="badge badge-blue whitespace-nowrap">{children}</span>;
}

export function AppCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}
