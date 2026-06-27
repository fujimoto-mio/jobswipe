"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Search } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import ApplicationChatView from "@/components/chat/ApplicationChatView";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage, AppBadge } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatTimeJST } from "@/lib/datetime";
import type { Application, ChatMessage, Job } from "@/lib/types";

type Thread = {
  application: Application;
  job: Job;
  lastMessage?: ChatMessage;
};

function SeekerChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get("applicationId");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(presetId);
  const [saveCount, setSaveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch("/api/chat"), apiFetch("/api/saves")])
      .then(async ([chatRes, savesRes]) => {
        const d = await chatRes.json();
        const saves = await savesRes.json();
        const list = d.threads ?? [];
        setThreads(list);
        setSaveCount(saves.count);
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
    router.replace(`/chat?applicationId=${id}`, { scroll: false });
  };

  const selectedThread = threads.find((t) => t.application.id === selectedId);

  return (
    <AppPage>
      <AppHeader title="チャット" backHref="/explore" />

      <main className="page-container flex flex-1 flex-col overflow-hidden pb-[4.5rem]">
        {loading ? (
          <PageLoading message="チャットを読み込み中..." minHeight="min-h-[50vh]" />
        ) : threads.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="チャットはまだありません"
            description="求人に応募すると、企業担当者とメッセージのやり取りができます"
            action={
              <Link href="/explore" className="btn-primary flex items-center gap-2 rounded-full px-6">
                <Search className="h-4 w-4" />
                求人を探す
              </Link>
            }
          />
        ) : (
          <>
            <div className="border-b border-slate-100 bg-white">
              <div className="flex gap-2 overflow-x-auto px-4 py-3">
                {threads.map((t) => (
                  <button
                    key={t.application.id}
                    type="button"
                    onClick={() => selectThread(t.application.id)}
                    className={`max-w-[200px] shrink-0 rounded-2xl px-3 py-2 text-left transition ${
                      selectedId === t.application.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <p className="truncate text-xs font-semibold">{t.job.company}</p>
                    <p className="truncate text-[10px] opacity-80">{t.job.title}</p>
                    {t.lastMessage && (
                      <p className={`mt-0.5 truncate text-[10px] ${selectedId === t.application.id ? "text-blue-100" : "text-slate-400"}`}>
                        {t.lastMessage.content}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedThread && (
              <>
                <div className="border-b border-slate-100 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">{selectedThread.job.company}</p>
                  <p className="text-sm text-slate-500">{selectedThread.job.title}</p>
                  <AppBadge>{APPLICATION_STATUS_LABELS[selectedThread.application.status]}</AppBadge>
                  {selectedThread.lastMessage && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      最終更新 {formatTimeJST(selectedThread.lastMessage.createdAt)}
                    </p>
                  )}
                </div>

                <ApplicationChatView
                  applicationId={selectedThread.application.id}
                  sender="seeker"
                  emptyHint="企業担当者にメッセージを送って、選考について質問しましょう"
                  className="flex-1"
                />
              </>
            )}
          </>
        )}
      </main>

      <BottomNav saveCount={saveCount} chatCount={threads.length} />
    </AppPage>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<PageLoading message="チャットを読み込み中..." minHeight="min-h-[50vh]" />}>
      <SeekerChatContent />
    </Suspense>
  );
}
