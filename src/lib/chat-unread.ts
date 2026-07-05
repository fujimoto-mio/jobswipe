import { apiFetch, apiFetchCached, invalidateApiCache } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/types";

type ChatSummary = {
  unreadTotal?: number;
};

export async function fetchSeekerUnreadTotal(): Promise<number> {
  const data = await apiFetchCached<ChatSummary>("/api/chat/unread", 10_000);
  return data.unreadTotal ?? 0;
}

export async function markSeekerChatRead(applicationId: string): Promise<number> {
  const res = await apiFetch("/api/chat", {
    method: "PATCH",
    body: JSON.stringify({ applicationId }),
  });
  const data = await res.json();
  invalidateApiCache("/api/chat");
  invalidateApiCache("/api/chat/unread");
  return typeof data.unreadTotal === "number" ? data.unreadTotal : 0;
}

type PrefetchOptions = {
  /** Prefer these threads first when capping. */
  first?: string[];
  /** Max threads to prefetch (default: all). */
  max?: number;
};

export async function prefetchChatMessages(
  applicationIds: string[],
  options?: PrefetchOptions
): Promise<Record<string, ChatMessage[]>> {
  const first = options?.first ?? [];
  const max = options?.max ?? applicationIds.length;
  const ordered = [...new Set([...first, ...applicationIds])].slice(0, max);
  if (!ordered.length) return {};

  const entries = await Promise.all(
    ordered.map(async (id) => {
      const res = await apiFetch(`/api/chat?applicationId=${id}`);
      const data = await res.json();
      return [id, (data.messages ?? []) as ChatMessage[]] as const;
    })
  );
  return Object.fromEntries(entries);
}

/** Prefetch remaining threads when the browser is idle. */
export function prefetchChatMessagesIdle(
  applicationIds: string[],
  onComplete: (cache: Record<string, ChatMessage[]>) => void
): void {
  if (!applicationIds.length) return;

  const run = () => {
    void prefetchChatMessages(applicationIds).then(onComplete);
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 5000 });
  } else {
    setTimeout(run, 2000);
  }
}
