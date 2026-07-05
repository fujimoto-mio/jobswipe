"use client";

import { Moon, Sun } from "lucide-react";
import { useStaffTheme } from "@/components/staff/StaffThemeProvider";

type StaffThemeToggleProps = {
  className?: string;
};

export function StaffThemeToggle({ className = "" }: StaffThemeToggleProps) {
  const { theme, toggleTheme } = useStaffTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`staff-theme-toggle btn-icon btn-icon-muted h-10 w-10 ${className}`.trim()}
      aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      title={isDark ? "ライトモード" : "ダークモード"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

type StaffThemeToggleRowProps = {
  label?: string;
  description?: string;
};

export function StaffThemeToggleRow({
  label = "ダークモード",
  description = "管理画面の表示を暗い配色に切り替えます",
}: StaffThemeToggleRowProps) {
  const { theme, setTheme } = useStaffTheme();
  const checked = theme === "dark";

  return (
    <div className="staff-theme-toggle-row">
      <div className="min-w-0 flex-1">
        <p className="staff-theme-toggle-row__label">{label}</p>
        {description && <p className="staff-theme-toggle-row__desc">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => setTheme(checked ? "light" : "dark")}
        className={`staff-theme-switch ${checked ? "staff-theme-switch--on" : ""}`}
      >
        <span className="staff-theme-switch__thumb" />
      </button>
    </div>
  );
}
