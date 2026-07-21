"use client";

import { useEffect, useRef } from "react";
import { CHAT_BROADCAST_EVENT, seekerChatInboxChannelName } from "@/lib/chat/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

function payloadToChatMessage(payload: unknown): ChatMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const message = payload as Partial<ChatMessage>;
  if (
    typeof message.id !== "string" ||
    typeof message.applicationId !== "string" ||
    typeof message.sender !== "string" ||
    typeof message.content !== "string" ||
    typeof message.createdAt !== "string"
  ) {
    return null;
  }
  return message as ChatMessage;
}

type InboxListener = (message: ChatMessage) => void;

let sharedSeekerId: string | null = null;
let sharedChannel: RealtimeChannel | null = null;
let sharedClient: SupabaseClient | null = null;
const listeners = new Set<InboxListener>();

function notify(message: ChatMessage) {
  for (const listener of listeners) {
    try {
      listener(message);
    } catch (error) {
      console.error("[seekerChatInbox]", error);
    }
  }
}

function teardownSharedChannel() {
  if (sharedClient && sharedChannel) {
    void sharedClient.removeChannel(sharedChannel);
  }
  sharedChannel = null;
  sharedClient = null;
  sharedSeekerId = null;
}

function ensureSharedChannel(seekerId: string) {
  if (sharedSeekerId === seekerId && sharedChannel) return;

  teardownSharedChannel();

  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  sharedSeekerId = seekerId;
  sharedClient = supabase;

  const channelName = seekerChatInboxChannelName(seekerId);
  sharedChannel = supabase
    .channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    })
    .on("broadcast", { event: CHAT_BROADCAST_EVENT }, ({ payload }) => {
      const message = payloadToChatMessage(payload);
      if (message) notify(message);
    })
    .subscribe((status) => {
      if (process.env.NODE_ENV === "development" && status === "CHANNEL_ERROR") {
        console.warn("[useSeekerChatInbox] channel error", channelName);
      }
    });
}

function subscribeSeekerChatInbox(seekerId: string, listener: InboxListener) {
  listeners.add(listener);
  ensureSharedChannel(seekerId);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      teardownSharedChannel();
    }
  };
}

/** Subscribe to seeker-wide chat inbox (all company messages for this seeker). */
export function useSeekerChatInbox(
  seekerId: string | null | undefined,
  onMessage: (message: ChatMessage) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!seekerId) return;

    return subscribeSeekerChatInbox(seekerId, (message) => {
      onMessageRef.current(message);
    });
  }, [seekerId]);
}
