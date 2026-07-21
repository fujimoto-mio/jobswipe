export const CHAT_BROADCAST_EVENT = "new_message";

export function chatChannelName(applicationId: string) {
  return `chat:${applicationId}`;
}

/** Seeker-wide inbox channel for nav badge / unread updates. */
export function seekerChatInboxChannelName(seekerId: string) {
  return `seeker-chat-inbox:${seekerId}`;
}

/** Company-wide inbox channel for nav badge / unread updates. */
export function companyChatInboxChannelName(companyId: string) {
  return `company-chat-inbox:${companyId}`;
}
