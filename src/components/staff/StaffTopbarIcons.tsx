"use client";

import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { useCompanyBadgesOptional } from "@/components/staff/CompanyBadgeProvider";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";

function formatBadgeCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export default function StaffTopbarIcons() {
  const { role, basePath } = useStaffPanel();
  const companyBadges = useCompanyBadgesOptional();
  const chatCount = role === "company" ? (companyBadges?.chatCount ?? 0) : 0;
  const chatHref = `${basePath}/chat`;

  return (
    <div className="staff-topbar-icons">
      <button
        type="button"
        className="staff-topbar-icon-btn"
        aria-label="通知"
      >
        <Bell className="staff-topbar-icon-btn__icon" aria-hidden />
      </button>
      {role === "company" ? (
        <Link
          href={chatHref}
          className="staff-topbar-icon-btn"
          aria-label={chatCount > 0 ? `メッセージ（${chatCount}件）` : "メッセージ"}
        >
          <MessageCircle className="staff-topbar-icon-btn__icon" aria-hidden />
          {chatCount > 0 && (
            <span className="staff-topbar-icon-badge" aria-hidden>
              {formatBadgeCount(chatCount)}
            </span>
          )}
        </Link>
      ) : (
        <button type="button" className="staff-topbar-icon-btn" aria-label="メッセージ">
          <MessageCircle className="staff-topbar-icon-btn__icon" aria-hidden />
        </button>
      )}
    </div>
  );
}
