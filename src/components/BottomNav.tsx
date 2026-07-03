"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, User, MessageCircle, GraduationCap } from "lucide-react";

type BottomNavProps = {
  saveCount?: number;
  chatCount?: number;
  theme?: "light" | "overlay";
};

export default function BottomNav({ saveCount = 0, chatCount = 0, theme = "light" }: BottomNavProps) {
  const pathname = usePathname();
  const isOverlay = theme === "overlay";

  const tabs = [
    { href: "/explore", label: "探す", icon: Search },
    { href: "/liked", label: "保存", icon: Heart, badge: saveCount },
    { href: "/chat", label: "チャット", icon: MessageCircle, badge: chatCount },
    { href: "/courses", label: "スキル講座", icon: GraduationCap },
    { href: "/profile", label: "プロフィール", icon: User },
  ];

  return (
    <nav
      className={`seeker-bottom-nav absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)] ${
        isOverlay ? "seeker-bottom-nav--overlay" : ""
      }`}
    >
      <div className="page-container flex items-stretch justify-around py-1.5">
        {tabs.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`seeker-bottom-nav-link relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                isActive ? "is-active" : ""
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-[22px] w-[22px] ${isActive && href === "/liked" ? "fill-current" : ""}`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {badge !== undefined && badge > 0 && (
                  <span className="seeker-bottom-nav-badge absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white ring-2">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className={`max-w-[4.25rem] truncate text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
