"use client";

import { useEffect } from "react";
import { serializeTimestamp } from "@/lib/datetime";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";

export function useChatRealtime(
  applicationId: string | null,
  onMessage: (message: ChatMessage) => void
) {
  useEffect(() => {
    if (!applicationId) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat:${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            application_id: string;
            sender: string;
            content: string;
            created_at: string;
          };
          onMessage({
            id: row.id,
            applicationId: row.application_id,
            sender: row.sender as ChatMessage["sender"],
            content: row.content,
            createdAt: serializeTimestamp(row.created_at),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId, onMessage]);
}
