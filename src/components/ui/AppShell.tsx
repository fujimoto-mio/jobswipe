"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type AppHeaderProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
};

export function AppHeader({ title, backHref, onBack, action }: AppHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-container flex items-center gap-3 py-3.5">
        {(backHref || onBack) &&
          (backHref ? (
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
          ))}
        <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold text-slate-900">{title}</h1>
        <div className="w-9 shrink-0 text-right">{action}</div>
      </div>
    </header>
  );
}

export function AppPage({ children }: { children: ReactNode }) {
  return <div className="page-shell bg-white text-slate-900">{children}</div>;
}

export function AppBadge({ children }: { children: ReactNode }) {
  return <span className="badge badge-blue">{children}</span>;
}

export function AppCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-4 ${className}`}>{children}</div>;
}
