"use client";

import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import { formatTimeJST } from "@/lib/datetime";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { APPLICATION_STATUS_CHIP_COLORS } from "@/components/staff/ApplicationSeekerDetail";
import CompanyLogo from "@/components/chat/CompanyLogo";
import StaffAvatar from "@/components/chat/StaffAvatar";
import type { ApplicationStatus, ChatThread } from "@/lib/types";

type ChatThreadListProps = {
  threads: ChatThread[];
  selectedId: string | null;
  onSelect: (applicationId: string) => void;
};

export default function ChatThreadList({ threads, selectedId, onSelect }: ChatThreadListProps) {
  return (
    <ul className="divide-y divide-slate-100">
      {threads.map((t) => {
        const active = selectedId === t.application.id;
        const unread = t.unreadCount ?? 0;

        return (
          <li key={t.application.id}>
            <button
              type="button"
              onClick={() => onSelect(t.application.id)}
              className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
                active ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <CompanyLogo company={t.job.company} logoUrl={t.job.companyLogo} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm ${unread > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                    {t.job.company}
                  </p>
                  {t.lastMessage && (
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {formatTimeJST(t.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-medium text-slate-600">{t.job.title}</p>
                <p className={`mt-0.5 truncate text-xs ${unread > 0 ? "font-medium text-slate-700" : "text-slate-400"}`}>
                  {t.lastMessage?.content ?? "会話を始めましょう"}
                </p>
              </div>
              {unread > 0 && (
                <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-1.5 text-[10px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ChatApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`badge shrink-0 ${APPLICATION_STATUS_CHIP_COLORS[status]}`}>
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}

export function ChatJobDetailsButton({ jobId }: { jobId: string }) {
  return (
    <Link
      href={`/jobs/${jobId}`}
      className="btn-secondary shrink-0 px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
    >
      求人詳細
    </Link>
  );
}

export function ChatThreadHeader({ thread }: { thread: ChatThread }) {
  const staffName = thread.companyStaff?.name?.trim();
  const staffAvatarUrl = thread.companyStaff?.avatarUrl ?? null;

  return (
    <div className="chat-thread-header flex items-start gap-3 bg-white px-4 py-3">
      <CompanyLogo company={thread.job.company} logoUrl={thread.job.companyLogo} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold leading-snug text-slate-900">{thread.job.title}</h2>
          <ChatApplicationStatusBadge status={thread.application.status} />
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{thread.job.company}</p>
        {staffName && (
          <div className="mt-2 flex items-center gap-2">
            <StaffAvatar name={staffName} avatarUrl={staffAvatarUrl} size="sm" />
            <p className="text-xs text-slate-600">
              担当: <span className="font-semibold text-slate-800">{staffName}</span>
            </p>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-blue-600" aria-hidden />
            {thread.job.location}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            {thread.job.salary}
          </span>
        </div>
      </div>
      <div className="chat-thread-header-actions shrink-0">
        <ChatJobDetailsButton jobId={thread.job.id} />
      </div>
    </div>
  );
}
