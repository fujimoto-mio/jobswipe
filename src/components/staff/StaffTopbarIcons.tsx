"use client";

import { Bell, MessageCircle } from "lucide-react";

const TOPBAR_ICONS = [
  { id: "notifications", icon: Bell, label: "通知", count: 3 },
  { id: "messages", icon: MessageCircle, label: "メッセージ", count: 2 },
] as const;

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export default function StaffTopbarIcons() {
  return (
    <div className="staff-topbar-icons">
      {TOPBAR_ICONS.map(({ id, icon: Icon, label, count }) => (
        <button
          key={id}
          type="button"
          className="staff-topbar-icon-btn"
          aria-label={count > 0 ? `${label}（${count}件）` : label}
        >
          <Icon className="staff-topbar-icon-btn__icon" aria-hidden />
          {count > 0 && (
            <span className="staff-topbar-icon-badge" aria-hidden>
              {formatBadgeCount(count)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
