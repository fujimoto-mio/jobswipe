"use client";

import { formatTimeJST } from "@/lib/datetime";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import type { ChatThread } from "@/lib/types";

type ChatThreadListProps = {
  threads: ChatThread[];
  selectedId: string | null;
  onSelect: (applicationId: string) => void;
};

function CompanyAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
      {name.trim().charAt(0) || "?"}
    </div>
  );
}

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
              <CompanyAvatar name={t.job.company} />
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
                <p className="truncate text-xs text-slate-500">{t.job.title}</p>
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

export function ChatThreadHeader({ thread }: { thread: ChatThread }) {
  return (
    <div className="border-b border-slate-100 bg-white px-4 py-3">
      <p className="font-semibold text-slate-900">{thread.job.company}</p>
      <p className="text-sm text-slate-500">{thread.job.title}</p>
      <span className="mt-1 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
        {APPLICATION_STATUS_LABELS[thread.application.status]}
      </span>
    </div>
  );
}
