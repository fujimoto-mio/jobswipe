"use client";

import { useEffect, useRef } from "react";
import { CHAT_BROADCAST_EVENT, chatChannelName } from "@/lib/chat/constants";
import { serializeTimestamp } from "@/lib/datetime";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";

function rowToChatMessage(row: {
  id: string;
  application_id: string;
  sender: string;
  content: string;
  created_at: string;
}): ChatMessage {
  return {
    id: row.id,
    applicationId: row.application_id,
    sender: row.sender as ChatMessage["sender"],
    content: row.content,
    createdAt: serializeTimestamp(row.created_at),
  };
}

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

    const deliver = (message: ChatMessage | null) => {
      if (message) onMessageRef.current(message);
    };

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      })
      .on("broadcast", { event: CHAT_BROADCAST_EVENT }, ({ payload }) => {
        deliver(payloadToChatMessage(payload));
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          deliver(rowToChatMessage(payload.new as Parameters<typeof rowToChatMessage>[0]));
        }
      )
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
