import {
  APP_THEME_CHANGE_EVENT,
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_THEME,
  loadAppTheme,
  saveAppTheme,
  type AppTheme,
} from "@/lib/app-theme";

export type SeekerTheme = AppTheme;

export const SEEKER_THEME_STORAGE_KEY = APP_THEME_STORAGE_KEY;
export const SEEKER_THEME_CHANGE_EVENT = APP_THEME_CHANGE_EVENT;
export const DEFAULT_SEEKER_THEME = DEFAULT_APP_THEME;

export const loadSeekerTheme = loadAppTheme;
export const saveSeekerTheme = saveAppTheme;
