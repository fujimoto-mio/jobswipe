type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  dark?: boolean;
};

const sizeClass = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-10 w-10 border-4",
} as const;

export default function LoadingSpinner({
  size = "md",
  message,
  className = "",
  dark = false,
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-solid ${sizeClass[size]} ${
          dark
            ? "border-white/20 border-t-white"
            : "border-[var(--border)] border-t-[var(--accent)]"
        }`}
        role="status"
        aria-label="読み込み中"
      />
      {message && (
        <p className={`text-sm ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>{message}</p>
      )}
    </div>
  );
}

export function PageLoading({
  message = "読み込み中...",
  minHeight = "min-h-[240px]",
  dark = false,
}: {
  message?: string;
  minHeight?: string;
  dark?: boolean;
}) {
  return (
    <div className={`flex ${minHeight} items-center justify-center`}>
      <LoadingSpinner size="lg" message={message} dark={dark} />
    </div>
  );
}

/** Inline spinner for primary submit buttons */
export function ButtonSpinner() {
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white"
      aria-hidden="true"
    />
  );
}
