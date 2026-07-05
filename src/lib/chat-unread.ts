import { apiFetch, apiFetchCached, invalidateApiCache } from "@/lib/api-client";

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

export async function prefetchChatMessages(
  applicationIds: string[]
): Promise<Record<string, import("@/lib/types").ChatMessage[]>> {
  const entries = await Promise.all(
    applicationIds.map(async (id) => {
      const res = await apiFetch(`/api/chat?applicationId=${id}`);
      const data = await res.json();
      return [id, (data.messages ?? []) as import("@/lib/types").ChatMessage[]] as const;
    })
  );
  return Object.fromEntries(entries);
}
