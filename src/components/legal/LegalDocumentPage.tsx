"use client";

import { useEffect, useState } from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import {
  loadSeekerTheme,
  SEEKER_THEME_CHANGE_EVENT,
  type SeekerTheme,
} from "@/lib/seeker-theme";
import {
  loadStaffTheme,
  STAFF_THEME_CHANGE_EVENT,
} from "@/lib/staff-theme";

type LegalDocumentPageProps = {
  title: string;
  src: string;
};

function loadLegalPageTheme(): SeekerTheme {
  return loadSeekerTheme() === "dark" || loadStaffTheme() === "dark" ? "dark" : "light";
}

export function LegalDocumentPage({ title, src }: LegalDocumentPageProps) {
  const [theme, setTheme] = useState<SeekerTheme | null>(null);

  useEffect(() => {
    setTheme(loadLegalPageTheme());
    const onSeekerThemeChange = () => setTheme(loadLegalPageTheme());
    const onStaffThemeChange = () => setTheme(loadLegalPageTheme());
    window.addEventListener(SEEKER_THEME_CHANGE_EVENT, onSeekerThemeChange);
    window.addEventListener(STAFF_THEME_CHANGE_EVENT, onStaffThemeChange);
    return () => {
      window.removeEventListener(SEEKER_THEME_CHANGE_EVENT, onSeekerThemeChange);
      window.removeEventListener(STAFF_THEME_CHANGE_EVENT, onStaffThemeChange);
    };
  }, []);

  const isDark = theme === "dark";
  const frameSrc = isDark ? `${src}?theme=dark` : src;

  return (
    <div
      className={`legal-page flex min-h-[100dvh] flex-col ${
        isDark ? "legal-page--dark" : "bg-[var(--surface)] text-slate-900"
      }`}
    >
      <LandingHeader dark={isDark} />
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
