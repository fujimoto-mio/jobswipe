"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetchCached, invalidateApiCache } from "@/lib/api-client";
import { useSeekerUser } from "@/components/seeker/SeekerUserProvider";
import { useSeekerChatInbox } from "@/hooks/useSeekerChatInbox";

type SavesSummary = {
  count?: number;
  savedIds?: string[];
};

type ChatUnreadSummary = {
  unreadTotal?: number;
};

type SeekerBadgeContextValue = {
  saveCount: number;
  chatCount: number;
  savedIds: Set<string>;
  ready: boolean;
  refresh: () => Promise<void>;
  applySavesUpdate: (savedIds: string[], count: number) => void;
  setChatCount: (count: number) => void;
  /** Currently open chat thread — inbox events for this id won't bump the badge. */
  setActiveChatApplicationId: (applicationId: string | null) => void;
};

const SeekerBadgeContext = createContext<SeekerBadgeContextValue | null>(null);

export function SeekerBadgeProvider({ children }: { children: ReactNode }) {
  const { loggedIn, ready: authReady, profile } = useSeekerUser();
  const [saveCount, setSaveCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const activeChatApplicationIdRef = useRef<string | null>(null);

  const setActiveChatApplicationId = useCallback((applicationId: string | null) => {
    activeChatApplicationIdRef.current = applicationId;
  }, []);

  const refreshChatUnread = useCallback(async () => {
    invalidateApiCache("/api/chat/unread");
    const chat = await apiFetchCached<ChatUnreadSummary>("/api/chat/unread", 10_000);
    setChatCount(chat.unreadTotal ?? 0);
  }, []);

  const refresh = useCallback(async () => {
    const [saves, chat] = await Promise.all([
      apiFetchCached<SavesSummary>("/api/saves?summary=1", 20_000),
      apiFetchCached<ChatUnreadSummary>("/api/chat/unread", 10_000),
    ]);
    setSaveCount(saves.count ?? 0);
    setSavedIds(new Set(saves.savedIds ?? []));
    setChatCount(chat.unreadTotal ?? 0);
  }, []);

  const applySavesUpdate = useCallback((ids: string[], count: number) => {
    setSavedIds(new Set(ids));
    setSaveCount(count);
    invalidateApiCache("/api/saves");
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!loggedIn) {
      setSaveCount(0);
      setChatCount(0);
      setSavedIds(new Set());
      setReady(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      await refresh();
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, loggedIn, refresh]);

  useSeekerChatInbox(loggedIn ? profile?.id : null, (message) => {
    if (message.sender !== "company") return;
    if (activeChatApplicationIdRef.current === message.applicationId) return;

    setChatCount((prev) => prev + 1);
    invalidateApiCache("/api/chat/unread");
    invalidateApiCache("/api/chat");
    void refreshChatUnread();
  });

  // Fallback when returning to the tab / app
  useEffect(() => {
    if (!loggedIn) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      invalidateApiCache("/api/chat/unread");
      void refreshChatUnread();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [loggedIn, refreshChatUnread]);

  return (
    <SeekerBadgeContext.Provider
      value={{
        saveCount,
        chatCount,
        savedIds,
        ready,
        refresh,
        applySavesUpdate,
        setChatCount,
        setActiveChatApplicationId,
      }}
    >
      {children}
    </SeekerBadgeContext.Provider>
  );
}

export function useSeekerBadges(): SeekerBadgeContextValue {
  const ctx = useContext(SeekerBadgeContext);
  if (!ctx) {
    throw new Error("useSeekerBadges must be used within SeekerBadgeProvider");
  }
  return ctx;
}
