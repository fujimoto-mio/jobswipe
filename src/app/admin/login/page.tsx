import { Suspense } from "react";
import AdminLoginPage from "./AdminLoginPage";
import { PageLoading } from "@/components/ui/LoadingSpinner";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="lp-root lp-auth flex min-h-[100dvh] items-center justify-center">
          <PageLoading />
        </div>
      }
    >
      <AdminLoginPage />
    </Suspense>
  );
}
