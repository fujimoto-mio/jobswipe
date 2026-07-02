"use client";

import { useRouter } from "next/navigation";
import { AppHeader, AppPage } from "@/components/ui/AppShell";

type LegalDocumentPageProps = {
  title: string;
  src: string;
  backHref?: string;
};

export function LegalDocumentPage({ title, src, backHref }: LegalDocumentPageProps) {
  const router = useRouter();

  return (
    <AppPage className="!bg-[var(--surface)]">
      <AppHeader
        title={title}
        backHref={backHref}
        onBack={backHref ? undefined : () => router.back()}
      />
      <iframe
        src={src}
        title={title}
        className="page-main min-h-0 w-full flex-1 border-0 bg-[var(--surface)]"
      />
    </AppPage>
  );
}
