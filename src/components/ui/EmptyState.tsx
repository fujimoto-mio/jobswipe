"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useStaffThemeOptional } from "@/components/staff/StaffThemeProvider";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  dark?: boolean;
  variant?: "default" | "seeker";
  /** Staff panel (admin/company). Defaults to auto-detect in staff app. */
  staff?: boolean;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  dark = false,
  variant = "default",
  staff = false,
}: EmptyStateProps) {
  const staffTheme = useStaffThemeOptional();
  const isStaff = staff || staffTheme !== null;
  const isSeeker = variant === "seeker";
  const useDark = dark || (isStaff && staffTheme?.theme === "dark");

  return (
    <div
      className={`empty-state flex w-full flex-col items-center justify-center px-5 text-center ${
        isSeeker ? "empty-state--seeker gap-3 py-12" : "gap-4 py-16"
      } ${isStaff ? "empty-state--staff" : ""}`}
    >
      <div
        className={
          isSeeker
            ? "empty-state-icon--seeker flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full"
            : isStaff
              ? "empty-state-icon--staff flex h-16 w-16 items-center justify-center rounded-2xl"
              : `flex h-16 w-16 items-center justify-center rounded-2xl ${
                  useDark ? "bg-white/5 ring-1 ring-white/10" : "bg-slate-100"
                }`
        }
      >
        <Icon
          className={
            isSeeker
              ? "h-7 w-7 text-[var(--accent)]"
              : isStaff
                ? "empty-state-icon-graphic h-8 w-8"
                : `h-8 w-8 ${useDark ? "text-white/25" : "text-slate-300"}`
          }
          strokeWidth={isSeeker ? 2 : 1.5}
        />
      </div>
      <div className={isSeeker ? "w-full min-w-0 max-w-[18rem] px-1" : undefined}>
        <p
          className={
            isSeeker
              ? "text-base font-bold tracking-tight text-[var(--seeker-text)]"
              : isStaff
                ? "empty-state-title font-semibold"
                : `font-semibold ${useDark ? "text-white" : "text-slate-800"}`
          }
        >
          {title}
        </p>
        {description && (
          <p
            className={
              isSeeker
                ? "mt-1.5 break-words text-sm leading-relaxed text-[var(--seeker-text-muted)]"
                : isStaff
                  ? "empty-state-description mt-1.5 text-sm leading-relaxed"
                  : `mt-1.5 text-sm leading-relaxed ${useDark ? "text-white/45" : "text-slate-500"}`
            }
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className={isSeeker ? "mt-3 flex w-full min-w-0 justify-center px-1" : undefined}>{action}</div>
      )}
    </div>
  );
}
