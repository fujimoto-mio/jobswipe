"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Search } from "lucide-react";
import ApplicationChatView from "@/components/chat/ApplicationChatView";
import EmptyState from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatTimeJST } from "@/lib/datetime";
import { apiFetch } from "@/lib/api-client";
import type { ApplicationWithSeeker, ChatMessage, Job } from "@/lib/types";

type Thread = {
  application: ApplicationWithSeeker;
  job: Job;
  lastMessage?: ChatMessage;
};

function CompanyChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get("applicationId");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(presetId);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchThreads = useCallback(() => {
    setLoading(true);
    apiFetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        const list = d.threads ?? [];
        setThreads(list);
        setSelectedId((prev) => {
          if (prev && list.some((t: Thread) => t.application.id === prev)) return prev;
          if (presetId && list.some((t: Thread) => t.application.id === presetId)) return presetId;
          return list[0]?.application.id ?? null;
        });
      })
      .finally(() => setLoading(false));
  }, [presetId]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const selectThread = (id: string) => {
    setSelectedId(id);
    router.replace(`/company/chat?applicationId=${id}`, { scroll: false });
  };

  const filtered = threads.filter((t) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      t.application.applicantName.toLowerCase().includes(q) ||
      t.job.title.toLowerCase().includes(q) ||
      t.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  const selected = threads.find((t) => t.application.id === selectedId);

  if (loading) {
    return <PageLoading message="チャットを読み込み中..." minHeight="min-h-[480px]" />;
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="チャットはまだありません"
        description="求人への応募があると、求職者とメッセージのやり取りができます"
        action={
          <Link href="/company/jobs" className="btn-primary flex items-center gap-2 px-6">
            求人管理へ
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">チャット</h1>
        <p className="mt-1 text-sm text-slate-500">応募した求職者とのメッセージ管理</p>
      </div>

      <div className="card flex min-h-[560px] overflow-hidden">
        <aside className="flex w-full flex-col border-r border-slate-100 md:w-80 lg:w-96">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="応募者・求人を検索..."
                className="input-field w-full pl-9 text-sm"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.map((t) => {
              const active = t.application.id === selectedId;
              return (
                <li key={t.application.id}>
                  <button
                    type="button"
                    onClick={() => selectThread(t.application.id)}
                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition ${
                      active ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {t.application.applicantName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`truncate text-sm ${active ? "font-semibold text-blue-900" : "font-medium text-slate-900"}`}>
                          {t.application.applicantName}
                        </p>
                        {t.lastMessage && (
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatTimeJST(t.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">{t.job.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {t.lastMessage?.content ?? "新規応募"}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="hidden min-w-0 flex-1 flex-col md:flex">
          {selected ? (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{selected.application.applicantName}</p>
                    <p className="text-sm text-slate-500">{selected.job.title}</p>
                    <p className="text-xs text-slate-400">{selected.application.applicantEmail}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="badge badge-blue text-xs">
                      {APPLICATION_STATUS_LABELS[selected.application.status]}
                    </span>
                    <Link
                      href="/company/applications"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      応募詳細へ
                    </Link>
                  </div>
                </div>
              </div>
              <ApplicationChatView
                applicationId={selected.application.id}
                sender="company"
                emptyHint="求職者にメッセージを送って、選考や面談について連絡しましょう"
                className="flex-1"
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              左のリストから会話を選択してください
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="mt-4 flex flex-col md:hidden">
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">{selected.application.applicantName}</p>
              <p className="text-sm text-slate-500">{selected.job.title}</p>
            </div>
            <ApplicationChatView
              applicationId={selected.application.id}
              sender="company"
              className="h-[420px]"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function CompanyChatPage() {
  return (
    <Suspense fallback={<PageLoading message="チャットを読み込み中..." minHeight="min-h-[480px]" />}>
      <CompanyChatContent />
    </Suspense>
  );
}
