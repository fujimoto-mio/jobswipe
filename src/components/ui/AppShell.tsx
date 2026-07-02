"use client";

import type { ReactNode } from "react";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";

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
  theme = "light",
  showMenu = true,
  menuVariant = "default",
  logoHref,
  className = "",
}: AppHeaderProps) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <SeekerBrandHeader
        title={title}
        theme={theme}
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
  return <div className={`page-shell bg-white text-slate-900 ${className}`.trim()}>{children}</div>;
}

export function AppBadge({ children }: { children: ReactNode }) {
  return <span className="badge badge-blue whitespace-nowrap">{children}</span>;
}

export function AppCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}
