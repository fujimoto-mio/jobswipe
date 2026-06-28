import { CHAT_BROADCAST_EVENT, chatChannelName } from "@/lib/chat/constants";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/types";

export async function broadcastChatMessage(applicationId: string, message: ChatMessage) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const channel = supabase.channel(chatChannelName(applicationId));

  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      void supabase.removeChannel(channel);
      resolve(false);
    }, 5000);

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        await channel.send({
          type: "broadcast",
          event: CHAT_BROADCAST_EVENT,
          payload: message,
        });
        await supabase.removeChannel(channel);
        resolve(true);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        clearTimeout(timeout);
        void supabase.removeChannel(channel);
        resolve(false);
      }
    });
  });
}
