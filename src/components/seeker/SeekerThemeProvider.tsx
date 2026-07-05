"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SEEKER_THEME,
  loadSeekerTheme,
  saveSeekerTheme,
  SEEKER_THEME_CHANGE_EVENT,
  type SeekerTheme,
} from "@/lib/seeker-theme";
import { isStandalonePwa } from "@/lib/pwa";

type SeekerThemeContextValue = {
  theme: SeekerTheme;
  setTheme: (theme: SeekerTheme) => void;
  toggleTheme: () => void;
};

const SeekerThemeContext = createContext<SeekerThemeContextValue | null>(null);

export function SeekerThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SeekerTheme>(DEFAULT_SEEKER_THEME);
  const [immersiveShell, setImmersiveShell] = useState(false);

  useEffect(() => {
    setThemeState(loadSeekerTheme());
  }, []);

  useEffect(() => {
    const syncImmersive = () => setImmersiveShell(isStandalonePwa());
    syncImmersive();

    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", syncImmersive);
    return () => media.removeEventListener("change", syncImmersive);
  }, []);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const next = (event as CustomEvent<SeekerTheme>).detail;
      if (next === "light" || next === "dark") {
        setThemeState(next);
      }
    };
    window.addEventListener(SEEKER_THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(SEEKER_THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const setTheme = useCallback((next: SeekerTheme) => {
    setThemeState(next);
    saveSeekerTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      saveSeekerTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.seekerTheme = theme;
    return () => {
      delete document.documentElement.dataset.seekerTheme;
    };
  }, [theme]);

  const shellClass = immersiveShell
    ? "seeker-app-shell--immersive relative flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden"
    : "relative mx-auto flex h-[100dvh] min-h-0 w-full max-w-[1440px] flex-col overflow-hidden border-transparent sm:border-x";

  return (
    <SeekerThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={theme === "dark" ? "min-h-[100dvh] bg-black" : "min-h-[100dvh] bg-slate-100"}>
        <div
          className={`seeker-ui seeker-theme-${theme} ${shellClass}`}
          style={
            immersiveShell
              ? undefined
              : {
                  borderColor: "var(--seeker-frame-border)",
                  boxShadow: "var(--seeker-frame-shadow)",
                }
          }
        >
          {children}
        </div>
      </div>
    </SeekerThemeContext.Provider>
  );
}

export function useSeekerTheme(): SeekerThemeContextValue {
  const ctx = useContext(SeekerThemeContext);
  if (!ctx) {
    throw new Error("useSeekerTheme must be used within SeekerThemeProvider");
  }
  return ctx;
}

export function useSeekerThemeOptional(): SeekerThemeContextValue | null {
  return useContext(SeekerThemeContext);
}
