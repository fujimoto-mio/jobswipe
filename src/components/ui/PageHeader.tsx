import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
  subtitle?: string;
};

export default function PageHeader({ title, backHref, onBack, action, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header px-4 py-3.5">
      <div className="page-container flex items-center gap-3 py-3.5">
        {(backHref || onBack) && (
          backHref ? (
            <Link
              href={backHref}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
