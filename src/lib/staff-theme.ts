import {
  APP_THEME_CHANGE_EVENT,
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_THEME,
  loadAppTheme,
  saveAppTheme,
  type AppTheme,
} from "@/lib/app-theme";

export type StaffTheme = AppTheme;

export const STAFF_THEME_STORAGE_KEY = APP_THEME_STORAGE_KEY;
export const STAFF_THEME_CHANGE_EVENT = APP_THEME_CHANGE_EVENT;
export const DEFAULT_STAFF_THEME = DEFAULT_APP_THEME;

export const loadStaffTheme = loadAppTheme;
export const saveStaffTheme = saveAppTheme;
