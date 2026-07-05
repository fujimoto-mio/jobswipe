export type StaffTheme = "light" | "dark";

export const STAFF_THEME_STORAGE_KEY = "jobswipe-staff-theme";
export const STAFF_THEME_CHANGE_EVENT = "jobswipe-staff-theme-change";

export const DEFAULT_STAFF_THEME: StaffTheme = "light";

export function loadStaffTheme(): StaffTheme {
  if (typeof window === "undefined") return DEFAULT_STAFF_THEME;
  const stored = window.localStorage.getItem(STAFF_THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : DEFAULT_STAFF_THEME;
}

export function saveStaffTheme(theme: StaffTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent(STAFF_THEME_CHANGE_EVENT, { detail: theme }));
}
