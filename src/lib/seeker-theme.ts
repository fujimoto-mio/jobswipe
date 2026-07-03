export type SeekerTheme = "light" | "dark";

export const SEEKER_THEME_STORAGE_KEY = "jobswipe-seeker-theme";
export const SEEKER_THEME_CHANGE_EVENT = "jobswipe-seeker-theme-change";

export const DEFAULT_SEEKER_THEME: SeekerTheme = "dark";

export function loadSeekerTheme(): SeekerTheme {
  if (typeof window === "undefined") return DEFAULT_SEEKER_THEME;
  const stored = window.localStorage.getItem(SEEKER_THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : DEFAULT_SEEKER_THEME;
}

export function saveSeekerTheme(theme: SeekerTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEKER_THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(SEEKER_THEME_CHANGE_EVENT, { detail: theme }));
}
