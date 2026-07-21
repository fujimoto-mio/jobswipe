"use client";

import { useEffect, useRef } from "react";
import { CHAT_BROADCAST_EVENT, companyChatInboxChannelName } from "@/lib/chat/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type CompanyChatInboxMessage = ChatMessage & { jobId?: string };

function payloadToMessage(payload: unknown): CompanyChatInboxMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const message = payload as Partial<CompanyChatInboxMessage>;
  if (
    typeof message.id !== "string" ||
    typeof message.applicationId !== "string" ||
    typeof message.sender !== "string" ||
    typeof message.content !== "string" ||
    typeof message.createdAt !== "string"
  ) {
    return null;
  }
  return message as CompanyChatInboxMessage;
}

type InboxListener = (message: CompanyChatInboxMessage) => void;

let sharedCompanyId: string | null = null;
let sharedChannel: RealtimeChannel | null = null;
let sharedClient: SupabaseClient | null = null;
const listeners = new Set<InboxListener>();

function notify(message: CompanyChatInboxMessage) {
  for (const listener of listeners) {
    try {
      listener(message);
    } catch (error) {
      console.error("[companyChatInbox]", error);
    }
  }
}

function teardownSharedChannel() {
  if (sharedClient && sharedChannel) {
    void sharedClient.removeChannel(sharedChannel);
  }
  sharedChannel = null;
  sharedClient = null;
  sharedCompanyId = null;
}

function ensureSharedChannel(companyId: string) {
  if (sharedCompanyId === companyId && sharedChannel) return;

  teardownSharedChannel();

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  sharedCompanyId = companyId;
  sharedClient = supabase;

  const channelName = companyChatInboxChannelName(companyId);
  sharedChannel = supabase
    .channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    })
    .on("broadcast", { event: CHAT_BROADCAST_EVENT }, ({ payload }) => {
      const message = payloadToMessage(payload);
      if (message) notify(message);
    })
    .subscribe((status) => {
      if (process.env.NODE_ENV === "development" && status === "CHANNEL_ERROR") {
        console.warn("[useCompanyChatInbox] channel error", channelName);
      }
    });
}

function subscribeCompanyChatInbox(companyId: string, listener: InboxListener) {
  listeners.add(listener);
  ensureSharedChannel(companyId);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      teardownSharedChannel();
    }
  };
}

/** Subscribe to company-wide chat inbox (all seeker messages for this company). */
export function useCompanyChatInbox(
  companyId: string | null | undefined,
  onMessage: (message: CompanyChatInboxMessage) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!companyId) return;

    return subscribeCompanyChatInbox(companyId, (message) => {
      onMessageRef.current(message);
    });
  }, [companyId]);
}
