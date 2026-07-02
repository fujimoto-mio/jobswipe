"use client";

import type { LucideIcon } from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import Logo from "@/components/ui/Logo";

type LpAuthShellProps = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function LpAuthShell({ title, subtitle, icon: Icon, footer, children }: LpAuthShellProps) {
  return (
    <div className="lp-root lp-auth min-h-[100dvh]">
      <LandingHeader />
      <main className="lp-auth__main">
        <div className="lp-auth__card">
          <div className="lp-auth__brand">
            {Icon ? (
              <div className="lp-auth__icon">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
            ) : (
              <Logo size="sm" showText={false} />
            )}
          </div>
          <h1 className="lp-auth__title">{title}</h1>
          <p className="lp-auth__subtitle">{subtitle}</p>
          <div className="lp-auth__body">{children}</div>
          {footer && <div className="lp-auth__footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
