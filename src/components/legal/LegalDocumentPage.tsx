"use client";

import { useEffect, useState } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import {
  loadSeekerTheme,
  SEEKER_THEME_CHANGE_EVENT,
  type SeekerTheme,
} from "@/lib/seeker-theme";

type LegalDocumentPageProps = {
  title: string;
  src: string;
};

export function LegalDocumentPage({ title, src }: LegalDocumentPageProps) {
  const [theme, setTheme] = useState<SeekerTheme | null>(null);

  useEffect(() => {
    setTheme(loadSeekerTheme());
    const onThemeChange = () => setTheme(loadSeekerTheme());
    window.addEventListener(SEEKER_THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(SEEKER_THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const isDark = theme === "dark";
  const frameSrc = isDark ? `${src}?theme=dark` : src;

  return (
    <div
      className={`lp-root legal-page flex min-h-[100dvh] flex-col ${
        isDark ? "legal-page--dark" : "bg-[var(--surface)] text-slate-900"
      }`}
    >
      <LandingHeader />
      {theme !== null ? (
        <iframe
          key={frameSrc}
          src={frameSrc}
          title={title}
          className="legal-page-frame min-h-0 w-full flex-1 border-0"
        />
      ) : (
        <div className="legal-page-frame min-h-0 w-full flex-1" aria-hidden />
      )}
    </div>
  );
}
