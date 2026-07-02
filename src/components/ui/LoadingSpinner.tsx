type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  dark?: boolean;
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

export default function LoadingSpinner({
  size = "md",
  message,
  className = "",
  dark = false,
  staff = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`loading-spinner flex flex-col items-center justify-center gap-3 ${
        staff ? "loading-spinner--staff" : ""
      } ${className}`}
    >
      <div
        className={`loading-spinner-default animate-spin rounded-full border-solid ${sizeClass[size]} ${
          dark
            ? "border-white/20 border-t-white"
            : "border-[var(--border)] border-t-[var(--accent)]"
        }`}
        role="status"
        aria-label="読み込み中"
      />
      <div
        className={`loading-spinner-seeker ${seekerSizeClass[size]} ${
          dark ? "loading-spinner-seeker--dark" : ""
        }`}
        role="status"
        aria-label="読み込み中"
      >
        <span className="loading-spinner-seeker-dot" />
        <span className="loading-spinner-seeker-dot" />
        <span className="loading-spinner-seeker-dot" />
      </div>
      {message && (
        <p
          className={`loading-spinner-message text-sm ${
            dark ? "loading-spinner-message--dark text-white/70" : "text-[var(--muted)]"
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
  staff = false,
}: {
  message?: string;
  minHeight?: string;
  dark?: boolean;
  staff?: boolean;
}) {
  return (
    <div className={`flex ${minHeight} items-center justify-center`}>
      <LoadingSpinner size="lg" message={message} dark={dark} staff={staff} />
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
