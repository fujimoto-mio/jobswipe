import { Suspense } from "react";
import AdminLoginPage from "./AdminLoginPage";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface)]">
          <PageLoading />
        </div>
      }
    >
      <AdminLoginPage />
    </Suspense>
  );
}
