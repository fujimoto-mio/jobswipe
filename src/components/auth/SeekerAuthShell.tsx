"use client";

import { useEffect, useState } from "react";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";
import {
  DEFAULT_SEEKER_THEME,
  loadSeekerTheme,
  SEEKER_THEME_CHANGE_EVENT,
  type SeekerTheme,
} from "@/lib/seeker-theme";

type SeekerAuthShellProps = {
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function SeekerAuthShell({
  title,
  subtitle,
  footer,
  children,
}: SeekerAuthShellProps) {
  const [theme, setTheme] = useState<SeekerTheme>(DEFAULT_SEEKER_THEME);

  useEffect(() => {
    setTheme(loadSeekerTheme());
    const onThemeChange = (event: Event) => {
      const next = (event as CustomEvent<SeekerTheme>).detail;
      if (next === "light" || next === "dark") setTheme(next);
    };
    window.addEventListener(SEEKER_THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(SEEKER_THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.seekerTheme = theme;
    return () => {
      delete document.documentElement.dataset.seekerTheme;
    };
  }, [theme]);

  return (
    <div className={`seeker-ui seeker-auth seeker-theme-${theme}`}>
      <header className="seeker-auth-header">
        <SeekerBrandHeader showMenu={false} logoHref="/" className="seeker-auth-header__bar" />
      </header>

      <main className="seeker-auth-main">
        <div className="seeker-auth-card">
          <div className="seeker-auth-intro">
            <h1 className="seeker-auth-title">{title}</h1>
            <p className="seeker-auth-subtitle">{subtitle}</p>
          </div>

          <div className="seeker-auth-body">{children}</div>

          {footer ? <div className="seeker-auth-footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
