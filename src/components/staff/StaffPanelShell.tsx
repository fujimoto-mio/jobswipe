"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";

type StaffPanelShellProps = {
  children: React.ReactNode;
};

export default function StaffPanelShell({ children }: StaffPanelShellProps) {
  const { basePath, role, loginPath, title } = useStaffPanel();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push(loginPath);
    router.refresh();
  };

  const nav =
    role === "admin"
      ? [
          { href: basePath, label: "ダッシュボード", icon: LayoutDashboard },
          { href: `${basePath}/jobs`, label: "求人審査", icon: ShieldCheck },
          { href: `${basePath}/applications`, label: "応募一覧", icon: FileText },
          { href: `${basePath}/profile`, label: "プロフィール", icon: User },
        ]
      : [
          { href: basePath, label: "ダッシュボード", icon: LayoutDashboard },
          { href: `${basePath}/jobs`, label: "求人管理", icon: Briefcase },
          { href: `${basePath}/applications`, label: "応募管理", icon: FileText },
          { href: `${basePath}/chat`, label: "チャット", icon: MessageCircle },
          { href: `${basePath}/profile`, label: "プロフィール", icon: User },
        ];

  const isActive = (href: string) =>
    href === basePath ? pathname === basePath : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-full min-h-screen overflow-y-auto bg-slate-100">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 p-5">
          <Logo size="sm" />
          <p className="mt-2 text-xs text-slate-400">
            {title} · {role === "admin" ? "管理画面" : "企業パネル"}
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition ${
                isActive(href)
                  ? "bg-blue-50 font-semibold text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-4 py-3.5 md:hidden">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <button type="button" onClick={handleLogout} className="text-sm font-medium text-red-600">
              ログアウト
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${
                  isActive(href) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-0 md:p-0">
          <div className="page-container py-4 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
