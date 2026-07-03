import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  dark?: boolean;
  variant?: "default" | "seeker";
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  dark = false,
  variant = "default",
}: EmptyStateProps) {
  const isSeeker = variant === "seeker";

  return (
    <div
      className={`empty-state flex w-full flex-col items-center justify-center px-5 text-center ${
        isSeeker ? "empty-state--seeker gap-3 py-12" : "gap-4 py-16"
      }`}
    >
      <div
        className={
          isSeeker
            ? "empty-state-icon--seeker flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full"
            : `flex h-16 w-16 items-center justify-center rounded-2xl ${
                dark ? "bg-white/5 ring-1 ring-white/10" : "bg-slate-100"
              }`
        }
      >
        <Icon
          className={
            isSeeker
              ? "h-7 w-7 text-[var(--accent)]"
              : `h-8 w-8 ${dark ? "text-white/25" : "text-slate-300"}`
          }
          strokeWidth={isSeeker ? 2 : 1.5}
        />
      </div>
      <div className={isSeeker ? "w-full min-w-0 max-w-[18rem] px-1" : undefined}>
        <p
          className={
            isSeeker
              ? "text-base font-bold tracking-tight text-[var(--seeker-text)]"
              : `font-semibold ${dark ? "text-white" : "text-slate-800"}`
          }
        >
          {title}
        </p>
        {description && (
          <p
            className={
              isSeeker
                ? "mt-1.5 break-words text-sm leading-relaxed text-[var(--seeker-text-muted)]"
                : `mt-1.5 text-sm leading-relaxed ${dark ? "text-white/45" : "text-slate-500"}`
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
