"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  LogOut,
  ShieldCheck,
  User,
  Menu,
  X,
  Building2,
  Users,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Logo from "@/components/ui/Logo";
import StaffAccountMenu from "@/components/staff/StaffAccountMenu";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";

type StaffPanelShellProps = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

function StaffSidebarContent({
  nav,
  title,
  role,
  isActive,
  onNavigate,
}: {
  nav: NavItem[];
  title: string;
  role: "admin" | "company";
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="staff-sidebar-header">
        <Logo size="sm" />
        <p>
          {title} · {role === "admin" ? "管理画面" : "企業パネル"}
        </p>
      </div>
      <nav className="staff-sidebar-nav">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`staff-nav-link ${isActive(href) ? "staff-nav-link-active" : ""}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

function StaffSidebarFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="staff-sidebar-footer">
      <button type="button" onClick={onLogout} className="staff-logout-btn">
        <LogOut className="h-4 w-4" />
        ログアウト
      </button>
    </div>
  );
}

export default function StaffPanelShell({ children }: StaffPanelShellProps) {
  const { basePath, role, loginPath, title } = useStaffPanel();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push(loginPath);
    router.refresh();
  };

  const nav: NavItem[] =
    role === "admin"
      ? [
          { href: basePath, label: "ダッシュボード", icon: LayoutDashboard },
          { href: `${basePath}/companies`, label: "企業管理", icon: Building2 },
          { href: `${basePath}/seekers`, label: "求職者管理", icon: Users },
          { href: `${basePath}/jobs`, label: "求人審査", icon: ShieldCheck },
          { href: `${basePath}/profile`, label: "プロフィール", icon: User },
        ]
      : [
          { href: basePath, label: "ダッシュボード", icon: LayoutDashboard },
          { href: `${basePath}/jobs`, label: "求人管理", icon: Briefcase },
          { href: `${basePath}/applications`, label: "応募管理", icon: FileText },
          { href: `${basePath}/chat`, label: "チャット", icon: MessageCircle },
          { href: `${basePath}/profile`, label: "プロフィール", icon: User },
        ];

  const isActive = useCallback(
    (href: string) =>
      href === basePath ? pathname === basePath : pathname === href || pathname.startsWith(`${href}/`),
    [basePath, pathname]
  );

  const pageTitle = useMemo(() => {
    const activeNav = nav.find(({ href }) =>
      href === basePath ? pathname === basePath : pathname === href || pathname.startsWith(`${href}/`)
    );
    return activeNav?.label ?? (role === "admin" ? "管理画面" : "企業パネル");
  }, [nav, pathname, role, basePath]);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileNav();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen, closeMobileNav]);

  const isFullWidthPage = pathname === `${basePath}/chat`;

  return (
    <div
      className={`staff-panel-shell staff-ui flex ${
        isFullWidthPage ? "h-dvh max-h-dvh min-h-0 overflow-hidden" : "h-full min-h-screen overflow-y-auto"
      }`}
    >
      <aside className="staff-sidebar hidden w-60 shrink-0 flex-col md:flex">
        <StaffSidebarContent nav={nav} title={title} role={role} isActive={isActive} />
        <StaffSidebarFooter onLogout={() => void handleLogout()} />
      </aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="staff-mobile-nav-backdrop fixed inset-0 z-[60] md:hidden"
            onClick={closeMobileNav}
            aria-hidden
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}
              className="staff-mobile-nav-panel staff-ui flex h-full w-[min(17rem,85vw)] flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="ナビゲーションメニュー"
            >
              <div className="flex items-center justify-end px-3 py-2">
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="btn-icon btn-icon-muted h-10 w-10"
                  aria-label="メニューを閉じる"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <StaffSidebarContent
                nav={nav}
                title={title}
                role={role}
                isActive={isActive}
                onNavigate={closeMobileNav}
              />
              <StaffSidebarFooter
                onLogout={() => {
                  closeMobileNav();
                  void handleLogout();
                }}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${isFullWidthPage ? "overflow-hidden" : ""}`}>
        <header className="staff-desktop-header page-header hidden shrink-0 md:block">
          <div className="staff-ui flex h-14 items-center justify-between px-6">
            <p className="text-sm font-bold text-slate-900">{pageTitle}</p>
            <StaffAccountMenu profileHref={`${basePath}/profile`} onLogout={handleLogout} />
          </div>
        </header>

        <header className="staff-mobile-header sticky top-0 z-50 shrink-0 md:hidden">
          <div className="staff-ui flex h-14 items-center gap-3 px-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="btn-icon btn-icon-muted h-10 w-10 shrink-0"
              aria-label="メニューを開く"
              aria-expanded={mobileNavOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">{pageTitle}</p>
            <StaffAccountMenu profileHref={`${basePath}/profile`} onLogout={handleLogout} />
          </div>
        </header>

        <main className={`flex-1 p-0 md:p-0 ${isFullWidthPage ? "flex min-h-0 flex-col" : ""}`}>
          <div
            className={
              isFullWidthPage
                ? "page-container-full company-chat-layout py-3 md:py-4"
                : "page-container py-4 md:py-8"
            }
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
