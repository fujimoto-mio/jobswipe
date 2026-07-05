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
  DEFAULT_STAFF_THEME,
  loadStaffTheme,
  saveStaffTheme,
  STAFF_THEME_CHANGE_EVENT,
  type StaffTheme,
} from "@/lib/staff-theme";

type StaffThemeContextValue = {
  theme: StaffTheme;
  setTheme: (theme: StaffTheme) => void;
  toggleTheme: () => void;
};

const StaffThemeContext = createContext<StaffThemeContextValue | null>(null);

export function StaffThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<StaffTheme>(DEFAULT_STAFF_THEME);

  useEffect(() => {
    setThemeState(loadStaffTheme());
  }, []);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const next = (event as CustomEvent<StaffTheme>).detail;
      if (next === "light" || next === "dark") {
        setThemeState(next);
      }
    };
    window.addEventListener(STAFF_THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(STAFF_THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const setTheme = useCallback((next: StaffTheme) => {
    setThemeState(next);
    saveStaffTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      saveStaffTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.staffTheme = theme;
    document.documentElement.style.colorScheme = theme;
    return () => {
      delete document.documentElement.dataset.staffTheme;
      document.documentElement.style.colorScheme = "";
    };
  }, [theme]);

  return (
    <StaffThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </StaffThemeContext.Provider>
  );
}

export function useStaffTheme(): StaffThemeContextValue {
  const ctx = useContext(StaffThemeContext);
  if (!ctx) {
    throw new Error("useStaffTheme must be used within StaffThemeProvider");
  }
  return ctx;
}

export function useStaffThemeOptional(): StaffThemeContextValue | null {
  return useContext(StaffThemeContext);
}
