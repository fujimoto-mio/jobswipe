"use client";

import { Suspense } from "react";
import StaffLoginForm from "@/components/auth/StaffLoginForm";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--surface)]">
          <PageLoading />
        </div>
      }
    >
      <StaffLoginForm mode="admin" />
    </Suspense>
  );
}
