"use client";

import { Suspense } from "react";
import LoginPageContent from "./LoginPageContent";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="seeker-ui seeker-auth seeker-theme-dark flex min-h-[100dvh] items-center justify-center">
          <PageLoading seeker />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
