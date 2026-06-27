"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import type { StaffRole } from "@/lib/auth/roles";
import { mapStaffPanelPath } from "@/lib/staff/paths";
import { apiFetch } from "@/lib/api-client";

type StaffAuthGuardProps = {
  children: React.ReactNode;
  expectedRole: StaffRole;
  loginPath: string;
};

export default function StaffAuthGuard({ children, expectedRole, loginPath }: StaffAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data.role !== expectedRole) {
          const dest =
            data.role === "admin" || data.role === "company"
              ? mapStaffPanelPath(pathname, data.role === "admin" ? "/admin" : "/company")
              : loginPath;
          router.replace(dest);
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (cancelled) return;
        const next = encodeURIComponent(pathname);
        router.replace(`${loginPath}?next=${next}`);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router, expectedRole, loginPath]);

  if (!authorized) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100">
        <PageLoading message="認証を確認中..." />
      </div>
    );
  }

  return <>{children}</>;
}
