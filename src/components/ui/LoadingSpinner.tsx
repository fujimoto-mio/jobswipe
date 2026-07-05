"use client";

import { APP_LOGO_FULL } from "@/lib/brand";
import { useSeekerThemeOptional } from "@/components/seeker/SeekerThemeProvider";
import { useStaffThemeOptional } from "@/components/staff/StaffThemeProvider";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  dark?: boolean;
  /** Force seeker logo loader on or off. Defaults to auto-detect in seeker app. */
  seeker?: boolean;
  /** Staff panel (admin/company) teal accent */
  staff?: boolean;
};

const sizeClass = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-10 w-10 border-4",
} as const;

const seekerSizeClass = {
  sm: "loading-spinner-seeker--sm",
  md: "loading-spinner-seeker--md",
  lg: "loading-spinner-seeker--lg",
} as const;

function useStaffLoaderEnabled(staff: boolean) {
  const staffTheme = useStaffThemeOptional();
  return staff || staffTheme !== null;
}

function useSeekerLoaderEnabled(staff: boolean, seeker?: boolean) {
  const seekerTheme = useSeekerThemeOptional();
  const staffLoader = useStaffLoaderEnabled(staff);
  return !staffLoader && (seeker ?? seekerTheme !== null);
}

export default function LoadingSpinner({
  size = "md",
  message,
  className = "",
  dark = false,
  seeker,
  staff = false,
}: LoadingSpinnerProps) {
  const seekerTheme = useSeekerThemeOptional();
  const staffTheme = useStaffThemeOptional();
  const staffLoader = useStaffLoaderEnabled(staff);
  const useSeekerLoader = useSeekerLoaderEnabled(staff, seeker);
  const staffDark = staffLoader && staffTheme?.theme === "dark";
  const messageDark = dark || seekerTheme?.theme === "dark" || staffDark;

  return (
    <div
      className={`loading-spinner flex flex-col items-center justify-center gap-2 ${
        staffLoader ? "loading-spinner--staff" : ""
      } ${staffDark ? "loading-spinner--staff-dark" : ""} ${useSeekerLoader ? "loading-spinner--seeker" : ""} ${
        useSeekerLoader && seekerTheme?.theme === "dark" ? "loading-spinner--seeker-dark" : ""
      } ${className}`}
    >
      <div
        className={`loading-spinner-default rounded-full border-solid ${sizeClass[size]} ${
          messageDark
            ? "border-white/20 border-t-white"
            : staffLoader
              ? ""
              : "border-[var(--border)] border-t-[var(--accent)]"
        }`}
        style={{ animation: "loading-spin 0.9s linear infinite" }}
        role="status"
        aria-label="読み込み中"
      />
      <div
        className={`loading-spinner-seeker ${seekerSizeClass[size]} ${
          messageDark ? "loading-spinner-seeker--dark" : ""
        }`}
        role="status"
        aria-label="読み込み中"
      >
        <img
          className="loading-spinner-seeker-logo"
          src={APP_LOGO_FULL}
          alt=""
          aria-hidden
          draggable={false}
        />
      </div>
      {message && (
        <p
          className={`loading-spinner-message text-sm ${
            messageDark ? "loading-spinner-message--dark text-white/70" : "text-[var(--muted)]"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function PageLoading({
  message = "読み込み中...",
  minHeight = "min-h-[240px]",
  dark = false,
  seeker,
  staff = false,
}: {
  message?: string;
  minHeight?: string;
  dark?: boolean;
  seeker?: boolean;
  staff?: boolean;
}) {
  return (
    <div className={`flex ${minHeight} items-center justify-center`}>
      <LoadingSpinner size="lg" message={message} dark={dark} seeker={seeker} staff={staff} />
    </div>
  );
}

/** Inline spinner for primary submit buttons */
export function ButtonSpinner({ seeker, staff = false }: { seeker?: boolean; staff?: boolean } = {}) {
  const useSeekerLoader = useSeekerLoaderEnabled(staff, seeker);

  if (useSeekerLoader) {
    return (
      <img
        src={APP_LOGO_FULL}
        alt=""
        aria-hidden
        draggable={false}
        className="button-spinner-seeker-logo"
      />
    );
  }

  return (
    <span
      className="button-spinner-default inline-block h-4 w-4 shrink-0 rounded-full border-2 border-white/35 border-t-white"
      style={{ animation: "loading-spin 0.9s linear infinite" }}
      aria-hidden="true"
    />
  );
}
