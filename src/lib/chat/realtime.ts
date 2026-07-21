import { CHAT_BROADCAST_EVENT, chatChannelName, companyChatInboxChannelName, seekerChatInboxChannelName } from "@/lib/chat/constants";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/types";

export type ChatInboxPayload = ChatMessage & { jobId?: string };

async function broadcastOnChannel(channelName: string, message: ChatInboxPayload): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return false;

  const channel = supabase.channel(channelName);

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

export async function broadcastChatMessage(applicationId: string, message: ChatMessage) {
  return broadcastOnChannel(chatChannelName(applicationId), message);
}

export async function broadcastSeekerChatInbox(seekerId: string, message: ChatMessage) {
  return broadcastOnChannel(seekerChatInboxChannelName(seekerId), message);
}

export async function broadcastCompanyChatInbox(companyId: string, message: ChatInboxPayload) {
  return broadcastOnChannel(companyChatInboxChannelName(companyId), message);
}
