"use client";

import { useEffect, useRef } from "react";
import { CHAT_BROADCAST_EVENT, chatChannelName } from "@/lib/chat/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";

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

export function useChatRealtime(
  applicationId: string | null,
  onMessage: (message: ChatMessage) => void
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!applicationId) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channelName = chatChannelName(applicationId);

    for (const existing of supabase.getChannels()) {
      if (existing.topic === `realtime:${channelName}`) {
        void supabase.removeChannel(existing);
      }
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      })
      .on("broadcast", { event: CHAT_BROADCAST_EVENT }, ({ payload }) => {
        const message = payloadToChatMessage(payload);
        if (message) onMessageRef.current(message);
      })
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development" && status === "CHANNEL_ERROR") {
          console.warn("[useChatRealtime] channel error", channelName);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [applicationId]);
}
