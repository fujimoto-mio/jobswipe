"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatTimeJST } from "@/lib/datetime";
import CompanyLogo from "@/components/chat/CompanyLogo";
import type { ChatThread } from "@/lib/types";

type ChatThreadListProps = {
  threads: ChatThread[];
  selectedId: string | null;
  onSelect: (applicationId: string) => void;
};

export default function ChatThreadList({ threads, selectedId, onSelect }: ChatThreadListProps) {
  return (
    <ul className="chat-thread-list divide-y divide-slate-100">
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
              <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                <p className={`truncate text-xs ${unread > 0 ? "font-medium text-slate-700" : "text-slate-400"}`}>
                  {t.lastMessage?.content ?? "会話を始めましょう"}
                </p>
              </div>
              {unread > 0 && (
                <span className="chat-unread-dot shrink-0" aria-label="未読あり" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
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

export function ChatThreadHeader({
  thread,
  onBack,
}: {
  thread: ChatThread;
  onBack?: () => void;
}) {
  return (
    <div className="chat-thread-header flex items-start gap-2 bg-white px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      {onBack ? (
        <div className="shrink-0 md:hidden">
          <button
            type="button"
            onClick={onBack}
            className="btn-icon btn-icon-muted h-9 w-9"
            aria-label="一覧に戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      ) : null}
      <CompanyLogo
        company={thread.job.company}
        logoUrl={thread.job.companyLogo}
        size="md"
        className="sm:h-12 sm:w-12 sm:rounded-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="chat-thread-company-name" title={thread.job.company}>
          {thread.job.company}
        </p>
        <Link
          href={`/jobs/${thread.job.id}`}
          className="chat-thread-job-title mt-0.5 hover:text-blue-700 active:text-blue-800"
          title={thread.job.title}
        >
          {thread.job.title}
        </Link>
      </div>
      <div className="hidden shrink-0 md:block">
        <ChatJobDetailsButton jobId={thread.job.id} />
      </div>
    </div>
  );
}
