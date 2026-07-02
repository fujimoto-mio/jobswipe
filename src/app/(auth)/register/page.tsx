"use client";

import { Suspense } from "react";
import RegisterPageContent from "./RegisterPageContent";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="seeker-ui seeker-auth flex min-h-[100dvh] items-center justify-center">
          <PageLoading />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
