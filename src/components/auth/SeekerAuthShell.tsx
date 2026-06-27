"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";

type SeekerAuthShellProps = {
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function SeekerAuthShell({
  title,
  subtitle,
  backHref = "/",
  backLabel = "トップへ戻る",
  footer,
  children,
}: SeekerAuthShellProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--surface)]">
      <header className="page-header">
        <div className="page-container flex h-14 items-center justify-between sm:h-16">
          <Link href="/" className="shrink-0">
            <Logo inTopbar />
          </Link>
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </header>

      <main className="page-container py-8 pb-12 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>
          </div>

          <div className="card-elevated p-6 sm:p-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-[var(--muted)]">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
