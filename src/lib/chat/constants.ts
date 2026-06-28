export const CHAT_BROADCAST_EVENT = "new_message";

export function chatChannelName(applicationId: string) {
  return `chat:${applicationId}`;
}
