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
import { apiFetch, apiFetchCached, invalidateApiCache } from "@/lib/api-client";
import { useCompanyChatInbox } from "@/hooks/useCompanyChatInbox";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";

type ChatUnreadSummary = {
  unreadTotal?: number;
};

type CompanyBadgeContextValue = {
  chatCount: number;
  ready: boolean;
  companyId: string | null;
  refresh: () => Promise<void>;
  setChatCount: (count: number) => void;
  setActiveChatApplicationId: (applicationId: string | null) => void;
};

const CompanyBadgeContext = createContext<CompanyBadgeContextValue | null>(null);

export function CompanyBadgeProvider({ children }: { children: ReactNode }) {
  const { role } = useStaffPanel();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const [ready, setReady] = useState(false);
  const activeChatApplicationIdRef = useRef<string | null>(null);

  const setActiveChatApplicationId = useCallback((applicationId: string | null) => {
    activeChatApplicationIdRef.current = applicationId;
  }, []);

  const refresh = useCallback(async () => {
    if (role !== "company") {
      setChatCount(0);
      return;
    }
    invalidateApiCache("/api/admin/chat/unread");
    const chat = await apiFetchCached<ChatUnreadSummary>("/api/admin/chat/unread", 10_000);
    setChatCount(chat.unreadTotal ?? 0);
  }, [role]);

  useEffect(() => {
    if (role !== "company") {
      setCompanyId(null);
      setChatCount(0);
      setReady(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch("/api/admin/me");
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        const id = typeof data?.companyId === "string" ? data.companyId : null;
        setCompanyId(id);
        await refresh();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, refresh]);

  useCompanyChatInbox(role === "company" ? companyId : null, (message) => {
    if (message.sender !== "seeker") return;
    if (activeChatApplicationIdRef.current === message.applicationId) return;

    setChatCount((prev) => prev + 1);
    invalidateApiCache("/api/admin/chat/unread");
    invalidateApiCache("/api/chat");
    void refresh();
  });

  useEffect(() => {
    if (role !== "company") return;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [role, refresh]);

  return (
    <CompanyBadgeContext.Provider
      value={{
        chatCount,
        ready,
        companyId,
        refresh,
        setChatCount,
        setActiveChatApplicationId,
      }}
    >
      {children}
    </CompanyBadgeContext.Provider>
  );
}

export function useCompanyBadges(): CompanyBadgeContextValue {
  const ctx = useContext(CompanyBadgeContext);
  if (!ctx) {
    throw new Error("useCompanyBadges must be used within CompanyBadgeProvider");
  }
  return ctx;
}

export function useCompanyBadgesOptional(): CompanyBadgeContextValue | null {
  return useContext(CompanyBadgeContext);
}
