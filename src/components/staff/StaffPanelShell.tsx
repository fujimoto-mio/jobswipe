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
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import Logo from "@/components/ui/Logo";
import StaffAccountMenu from "@/components/staff/StaffAccountMenu";
import StaffTopbarIcons from "@/components/staff/StaffTopbarIcons";
import { StaffThemeToggle } from "@/components/staff/StaffThemeToggle";
import { useStaffTheme } from "@/components/staff/StaffThemeProvider";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";

const SIDEBAR_COLLAPSED_KEY = "jobswipe-staff-sidebar-collapsed";

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
  isActive,
  collapsed,
  onNavigate,
}: {
  nav: NavItem[];
  isActive: (href: string) => boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="staff-sidebar-header">
        <Link href="/" className="staff-sidebar-logo" onClick={onNavigate} aria-label="JobSwipe ホーム">
          <Logo inTopbar showText={!collapsed} />
        </Link>
      </div>

      <nav className="staff-sidebar-nav" aria-label="メインナビゲーション">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={`staff-nav-link ${isActive(href) ? "staff-nav-link-active" : ""}`}
          >
            <Icon className="staff-nav-link-icon" aria-hidden />
            <span className="staff-nav-link-label">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}

function StaffSidebarFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="staff-sidebar-footer">
      <button type="button" onClick={onLogout} className="staff-logout-btn" title="ログアウト">
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="staff-nav-link-label">ログアウト</span>
      </button>
    </div>
  );
}

export default function StaffPanelShell({ children }: StaffPanelShellProps) {
  const { basePath, role, loginPath } = useStaffPanel();
  const { theme } = useStaffTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      setSidebarCollapsed(false);
    }
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const handleLogout = async () => {
    await apiFetch("/api/auth/login", { method: "DELETE" });
    router.push(loginPath);
    router.refresh();
  };

  const accountMenuHref = role === "admin" ? `${basePath}/settings` : `${basePath}/profile`;
  const accountMenuLabel = role === "admin" ? "設定" : "プロフィール";

  const nav: NavItem[] =
    role === "admin"
      ? [
          { href: basePath, label: "ダッシュボード", icon: LayoutDashboard },
          { href: `${basePath}/companies`, label: "企業管理", icon: Building2 },
          { href: `${basePath}/seekers`, label: "求職者管理", icon: Users },
          { href: `${basePath}/jobs`, label: "求人審査", icon: ShieldCheck },
          { href: `${basePath}/settings`, label: "設定", icon: Settings },
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
      className={`lp-root staff-panel-shell staff-ui staff-theme-${theme} flex ${
        sidebarCollapsed ? "staff-panel-shell--sidebar-collapsed" : ""
      } ${isFullWidthPage ? "h-dvh max-h-dvh min-h-0 overflow-hidden" : "h-full min-h-screen overflow-y-auto"}`}
    >
      <aside
        className={`staff-sidebar hidden shrink-0 flex-col md:flex ${
          sidebarCollapsed ? "staff-sidebar--collapsed" : ""
        }`}
      >
        <StaffSidebarContent
          nav={nav}
          isActive={isActive}
          collapsed={sidebarCollapsed}
        />
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
              <StaffSidebarContent nav={nav} isActive={isActive} onNavigate={closeMobileNav} />
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
        <header className="staff-desktop-header hidden shrink-0 md:block">
          <div className="staff-header-bar staff-ui justify-between gap-4 px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="staff-sidebar-toggle staff-sidebar-toggle--header"
                aria-label={sidebarCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
                aria-expanded={!sidebarCollapsed}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
              <p className="lp-staff-page-title truncate">{pageTitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StaffTopbarIcons />
              <StaffThemeToggle />
              <StaffAccountMenu
                accountHref={accountMenuHref}
                accountLabel={accountMenuLabel}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        <header className="staff-mobile-header sticky top-0 z-50 shrink-0 md:hidden">
          <div className="staff-header-bar staff-ui gap-3 px-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="btn-icon btn-icon-muted h-10 w-10 shrink-0"
              aria-label="メニューを開く"
              aria-expanded={mobileNavOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="lp-staff-page-title min-w-0 flex-1 truncate">{pageTitle}</p>
            <div className="flex shrink-0 items-center gap-1">
              <StaffTopbarIcons />
              <StaffThemeToggle />
              <StaffAccountMenu
                accountHref={accountMenuHref}
                accountLabel={accountMenuLabel}
                onLogout={handleLogout}
              />
            </div>
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
