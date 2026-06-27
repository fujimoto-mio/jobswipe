"use client";

import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--surface)]">
          <PageLoading />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
