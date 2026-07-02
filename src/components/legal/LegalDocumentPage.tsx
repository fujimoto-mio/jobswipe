"use client";

import LandingHeader from "@/components/landing/LandingHeader";

type LegalDocumentPageProps = {
  title: string;
  src: string;
};

export function LegalDocumentPage({ title, src }: LegalDocumentPageProps) {
  return (
    <div className="legal-page flex min-h-[100dvh] flex-col bg-[var(--surface)] text-slate-900">
      <LandingHeader />
      <iframe src={src} title={title} className="legal-page-frame min-h-0 w-full flex-1 border-0 bg-[var(--surface)]" />
    </div>
  );
}
