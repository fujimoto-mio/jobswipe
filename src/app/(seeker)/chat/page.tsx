"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Search } from "lucide-react";
import { apiFetch, invalidateApiCache } from "@/lib/api-client";
import ApplicationChatView from "@/components/chat/ApplicationChatView";
import ChatThreadList, { ChatThreadHeader } from "@/components/chat/ChatThreadList";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner, { PageLoading } from "@/components/ui/LoadingSpinner";
import { markSeekerChatRead, prefetchChatMessages } from "@/lib/chat-unread";
import { useSeekerUser } from "@/components/seeker/SeekerUserProvider";
import type { ChatMessage, ChatThread } from "@/lib/types";

function syncChatUrl(applicationId: string | null) {
  const url = applicationId ? `/chat?applicationId=${applicationId}` : "/chat";
  window.history.replaceState(window.history.state, "", url);
}

function SeekerChatContent() {
  const searchParams = useSearchParams();
  const initialApplicationId = useRef(searchParams.get("applicationId")).current;

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialApplicationId);
  const [messageCache, setMessageCache] = useState<Record<string, ChatMessage[]>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [saveCount, setSaveCount] = useState(0);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const { profile: seekerProfile } = useSeekerUser();
  const seekerAvatarUrl = seekerProfile?.avatarUrl ?? null;

  const refreshThreads = useCallback(async () => {
    const [chatRes, savesRes] = await Promise.all([
      apiFetch("/api/chat"),
      apiFetch("/api/saves"),
    ]);
    const chatData = await chatRes.json();
    const saves = await savesRes.json();
    const list = (chatData.threads ?? []) as ChatThread[];
    setThreads(list);
    setUnreadTotal(chatData.unreadTotal ?? 0);
    setSaveCount(saves.count ?? 0);
    return list;
  }, []);

  const messageCacheRef = useRef(messageCache);
  messageCacheRef.current = messageCache;

  const loadMessagesFor = useCallback(async (applicationId: string) => {
    if (messageCacheRef.current[applicationId]) return;

    setLoadingIds((prev) => new Set(prev).add(applicationId));
    try {
      const res = await apiFetch(`/api/chat?applicationId=${applicationId}`);
      const data = await res.json();
      const msgs = (data.messages ?? []) as ChatMessage[];
      setMessageCache((prev) => (prev[applicationId] ? prev : { ...prev, [applicationId]: msgs }));
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  }, []);

  const loadMessagesForRef = useRef(loadMessagesFor);
  loadMessagesForRef.current = loadMessagesFor;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setInitialLoading(true);
      try {
        const list = await refreshThreads();
        if (cancelled) return;

        let resolvedId: string | null = null;
        setSelectedId((prev) => {
          if (prev && list.some((t) => t.application.id === prev)) {
            resolvedId = prev;
            return prev;
          }
          if (initialApplicationId && list.some((t) => t.application.id === initialApplicationId)) {
            resolvedId = initialApplicationId;
            return initialApplicationId;
          }
          resolvedId = list[0]?.application.id ?? null;
          return resolvedId;
        });

        if (resolvedId) {
          syncChatUrl(resolvedId);
          void loadMessagesForRef.current(resolvedId);
        }

        void prefetchChatMessages(list.map((t) => t.application.id)).then((cache) => {
          if (!cancelled) setMessageCache((prev) => ({ ...prev, ...cache }));
        });
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load threads once on mount
  }, [refreshThreads]);

  const markRead = useCallback(async (applicationId: string) => {
    const total = await markSeekerChatRead(applicationId);
    setThreads((prev) =>
      prev.map((t) => (t.application.id === applicationId ? { ...t, unreadCount: 0 } : t))
    );
    setUnreadTotal(total);
    invalidateApiCache("/api/chat");
  }, []);

  const selectThread = useCallback(
    (id: string) => {
      if (id === selectedId) return;
      setSelectedId(id);
      syncChatUrl(id);
      void loadMessagesFor(id);
      void markRead(id);
    },
    [selectedId, loadMessagesFor, markRead]
  );

  const backToList = () => {
    setSelectedId(null);
    syncChatUrl(null);
  };

  const selectedThread = threads.find((t) => t.application.id === selectedId);
  const cachedMessages = selectedId ? messageCache[selectedId] : undefined;
  const chatLoading = Boolean(
    selectedId && cachedMessages === undefined && loadingIds.has(selectedId)
  );

  const updateMessages = useCallback((applicationId: string, messages: ChatMessage[]) => {
    setMessageCache((prev) => ({ ...prev, [applicationId]: messages }));
    const last = messages[messages.length - 1];
    if (last) {
      setThreads((prev) =>
        prev.map((t) => (t.application.id === applicationId ? { ...t, lastMessage: last } : t))
      );
    }
  }, []);

  const handleSent = useCallback(() => {
    void refreshThreads();
  }, [refreshThreads]);

  const chatPanel = selectedThread ? (
    <>
      <div className="shrink-0 border-b border-slate-100 bg-white">
        <ChatThreadHeader thread={selectedThread} onBack={backToList} />
      </div>
      {chatLoading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50">
          <LoadingSpinner message="メッセージを読み込み中..." />
        </div>
      ) : (
        <ApplicationChatView
          applicationId={selectedThread.application.id}
          sender="seeker"
          seekerName={selectedThread.application.applicantName}
          seekerAvatarUrl={seekerAvatarUrl}
          companyName={selectedThread.job.company}
          companyStaffName={selectedThread.companyStaff?.name}
          companyStaffAvatarUrl={selectedThread.companyStaff?.avatarUrl}
          messages={cachedMessages ?? []}
          loading={false}
          onMessagesChange={(msgs) => updateMessages(selectedThread.application.id, msgs)}
          onSent={handleSent}
          onIncomingMessage={(message) => {
            setThreads((prev) =>
              prev.map((thread) =>
                thread.application.id === message.applicationId
                  ? { ...thread, lastMessage: message }
                  : thread
              )
            );
          }}
          emptyHint="企業担当者にメッセージを送って、選考について質問しましょう"
          className="min-h-0 flex-1"
        />
      )}
    </>
  ) : (
    <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
      左のリストから企業を選択してください
    </div>
  );

  return (
    <AppPage>
      <AppHeader
        title="チャット"
        backHref={selectedId ? undefined : "/explore"}
        className={selectedId ? "max-md:hidden" : undefined}
      />

      <main className="seeker-chat-page flex min-h-0 flex-1 flex-col overflow-hidden pb-[4.5rem]">
        {initialLoading ? (
          <PageLoading message="チャットを読み込み中..." minHeight="min-h-[50vh]" />
        ) : threads.length === 0 ? (
          <EmptyState
            variant="seeker"
            icon={MessageCircle}
            title="チャットはまだありません"
            description="求人に応募すると、企業担当者とメッセージのやり取りができます"
            action={
              <Link href="/explore" className="btn-primary flex items-center gap-2 px-8">
                <Search className="h-4 w-4" />
                求人を探す
              </Link>
            }
          />
        ) : (
          <div className="flex min-h-0 flex-1 overflow-hidden border-t border-slate-100">
            <aside
              className={`min-h-0 shrink-0 flex-col border-r border-slate-100 bg-white md:flex md:w-[300px] ${
                selectedId ? "hidden md:flex" : "flex w-full"
              }`}
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ChatThreadList threads={threads} selectedId={selectedId} onSelect={selectThread} />
              </div>
            </aside>

            <section
              className={`min-w-0 flex-1 flex-col bg-white ${
                selectedId ? "flex" : "hidden md:flex"
              }`}
            >
              {chatPanel}
            </section>
          </div>
        )}
      </main>

      <BottomNav saveCount={saveCount} chatCount={unreadTotal} />
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
