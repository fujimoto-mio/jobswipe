export type AppTheme = "light" | "dark";

export const APP_THEME_STORAGE_KEY = "jobswipe-theme";
export const APP_THEME_CHANGE_EVENT = "jobswipe-theme-change";

/** Shared default for seeker, admin, and company UIs */
export const DEFAULT_APP_THEME: AppTheme = "light";

const LEGACY_SEEKER_KEY = "jobswipe-seeker-theme";
const LEGACY_STAFF_KEY = "jobswipe-staff-theme";
const LEGACY_SEEKER_EVENT = "jobswipe-seeker-theme-change";
const LEGACY_STAFF_EVENT = "jobswipe-staff-theme-change";

export function loadAppTheme(): AppTheme {
  if (typeof window === "undefined") return DEFAULT_APP_THEME;

  const unified = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
  if (unified === "light" || unified === "dark") return unified;

  const seeker = window.localStorage.getItem(LEGACY_SEEKER_KEY);
  if (seeker === "light" || seeker === "dark") return seeker;

  const staff = window.localStorage.getItem(LEGACY_STAFF_KEY);
  if (staff === "light" || staff === "dark") return staff;

  return DEFAULT_APP_THEME;
}

export function saveAppTheme(theme: AppTheme) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  window.localStorage.setItem(LEGACY_SEEKER_KEY, theme);
  window.localStorage.setItem(LEGACY_STAFF_KEY, theme);

  const detail = { detail: theme };
  window.dispatchEvent(new CustomEvent(APP_THEME_CHANGE_EVENT, detail));
  window.dispatchEvent(new CustomEvent(LEGACY_SEEKER_EVENT, detail));
  window.dispatchEvent(new CustomEvent(LEGACY_STAFF_EVENT, detail));
}
