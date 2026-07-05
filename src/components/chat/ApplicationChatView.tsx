"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle } from "lucide-react";
import LoadingSpinner, { ButtonSpinner } from "@/components/ui/LoadingSpinner";
import { apiFetch, invalidateApiCache } from "@/lib/api-client";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import { formatDateTimeFullJST } from "@/lib/datetime";
import { resolveSeekerAvatarUrl, resolveStaffAvatarUrl } from "@/lib/job-image";
import type { ChatMessage } from "@/lib/types";

type ApplicationChatViewProps = {
  applicationId: string;
  sender: "seeker" | "company";
  seekerName: string;
  seekerAvatarUrl?: string | null;
  companyName: string;
  companyStaffName?: string | null;
  companyStaffAvatarUrl?: string | null;
  emptyHint?: string;
  className?: string;
  /** Staff panel (company/admin) teal theme for bubbles and composer */
  staffStyle?: boolean;
  /** When set, skips fetch and uses parent cache (instant thread switch). */
  messages?: ChatMessage[];
  loading?: boolean;
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onSent?: () => void;
  onIncomingMessage?: (message: ChatMessage) => void;
};

function ChatAvatar({
  name,
  imageUrl,
  variant,
}: {
  name: string;
  imageUrl?: string | null;
  variant: "seeker" | "company" | "company-hr";
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        width={32}
        height={32}
        loading="lazy"
        decoding="async"
        className="chat-message-avatar chat-message-avatar--image"
      />
    );
  }

  const initial = name.trim().charAt(0) || "?";
  return (
    <span className={`chat-message-avatar chat-message-avatar--${variant}`} aria-hidden>
      {initial}
    </span>
  );
}

function getMessageParticipant(
  msg: ChatMessage,
  {
    seekerName,
    seekerAvatarUrl,
    companyName,
    companyStaffName,
    companyStaffAvatarUrl,
  }: {
    seekerName: string;
    seekerAvatarUrl?: string | null;
    companyName: string;
    companyStaffName?: string | null;
    companyStaffAvatarUrl?: string | null;
  }
) {
  if (msg.sender === "seeker") {
    const avatarUrl = msg.senderAvatarUrl?.trim() || seekerAvatarUrl?.trim() || null;
    const hasCustomAvatar = Boolean(avatarUrl && !avatarUrl.includes("ui-avatars.com"));
    return {
      name: seekerName,
      imageUrl: hasCustomAvatar ? resolveSeekerAvatarUrl(seekerName, avatarUrl) : null,
      variant: "seeker" as const,
    };
  }

  const staffName = msg.senderName?.trim() || companyStaffName?.trim() || companyName;
  const staffAvatarUrl = msg.senderAvatarUrl?.trim() || companyStaffAvatarUrl || null;

  return {
    name: staffName,
    imageUrl: resolveStaffAvatarUrl(staffName, staffAvatarUrl),
    variant: "company-hr" as const,
  };
}

function ChatComposer({
  applicationId,
  sender,
  onSent,
  onMessageSent,
}: {
  applicationId: string;
  sender: "seeker" | "company";
  onSent?: () => void;
  onMessageSent: (message: ChatMessage) => void;
}) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = Boolean(content.trim()) && !isSubmitting;

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [content, resize]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ applicationId, content: trimmed, sender }),
      });
      if (res.ok) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
        const data = await res.json();
        onMessageSent(data.message as ChatMessage);
        invalidateApiCache("/api/chat");
        onSent?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="chat-composer">
      <div className="chat-composer-field">
        <textarea
          ref={textareaRef}
          rows={2}
          value={content}
          placeholder="メッセージを入力..."
          onChange={(e) => {
            setContent(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSubmit) void handleSubmit();
            }
          }}
          className="input-field chat-composer-input scrollbar-none max-h-[120px] w-full resize-none overflow-y-auto leading-snug"
        />
      </div>
      <div className="chat-composer-send">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="btn-send"
          aria-label="送信"
        >
          {isSubmitting ? <ButtonSpinner /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ApplicationChatView({
  applicationId,
  sender,
  seekerName,
  seekerAvatarUrl,
  companyName,
  companyStaffName,
  companyStaffAvatarUrl,
  emptyHint = "メッセージを送信して会話を始めましょう",
  className = "",
  staffStyle = false,
  messages: controlledMessages,
  loading: controlledLoading,
  onMessagesChange,
  onSent,
  onIncomingMessage,
}: ApplicationChatViewProps) {
  const isControlled = controlledMessages !== undefined;
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([]);
  const [internalLoading, setInternalLoading] = useState(!isControlled);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<string>());

  const messages = isControlled ? controlledMessages : internalMessages;
  const loading = isControlled ? (controlledLoading ?? false) : internalLoading;

  const setMessages = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      if (isControlled && onMessagesChange) {
        const next = typeof updater === "function" ? updater(controlledMessages ?? []) : updater;
        onMessagesChange(next);
      } else {
        setInternalMessages(updater);
      }
    },
    [isControlled, onMessagesChange, controlledMessages]
  );

  const loadMessages = useCallback(() => {
    if (isControlled) return;
    setInternalLoading(true);
    seenIds.current.clear();
    apiFetch(`/api/chat?applicationId=${applicationId}`)
      .then((r) => r.json())
      .then((d) => {
        const msgs = (d.messages ?? []) as ChatMessage[];
        msgs.forEach((m) => seenIds.current.add(m.id));
        setInternalMessages(msgs);
      })
      .finally(() => setInternalLoading(false));
  }, [applicationId, isControlled]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    seenIds.current.clear();
    messages.forEach((m) => seenIds.current.add(m.id));
  }, [applicationId, messages]);

  const onRealtimeMessage = useCallback(
    (message: ChatMessage) => {
      if (seenIds.current.has(message.id)) return;
      seenIds.current.add(message.id);
      setMessages((prev) => [...prev, message]);
      onIncomingMessage?.(message);
    },
    [setMessages, onIncomingMessage]
  );

  useChatRealtime(applicationId, onRealtimeMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, applicationId]);

  const isOwn = (msg: ChatMessage) => msg.sender === sender;

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div
        className={`company-chat-messages flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 ${
          staffStyle ? "company-chat-messages--staff" : "bg-slate-50"
        }`}
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner message="メッセージを読み込み中..." staff={staffStyle} />
          </div>
        ) : messages.length === 0 ? (
          staffStyle ? (
            <div className="company-chat-empty">
              <MessageCircle className="company-chat-empty-icon" strokeWidth={1.75} aria-hidden />
              <p>{emptyHint}</p>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-2">
              <p className="text-center text-sm text-slate-400 md:whitespace-nowrap">{emptyHint}</p>
            </div>
          )
        ) : (
          <>
            {messages.map((msg) => {
              const own = isOwn(msg);
              const participant = getMessageParticipant(msg, {
                seekerName,
                seekerAvatarUrl,
                companyName,
                companyStaffName,
                companyStaffAvatarUrl,
              });
              return (
                <div
                  key={msg.id}
                  className={`chat-message-row ${own ? "chat-message-row--own" : "chat-message-row--other"}`}
                >
                  <ChatAvatar
                    name={participant.name}
                    imageUrl={participant.imageUrl}
                    variant={participant.variant}
                  />
                  <div className="chat-message-stack">
                    <p className="chat-message-sender">{participant.name}</p>
                    <div
                      className={`chat-message-bubble ${
                        own ? "chat-message-bubble--own" : "chat-message-bubble--other"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className="chat-message-time">{formatDateTimeFullJST(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className={`chat-composer-footer border-t bg-white px-4 py-3 ${staffStyle ? "chat-composer-footer--staff" : "border-slate-200"}`}>
        <ChatComposer
          applicationId={applicationId}
          sender={sender}
          onSent={onSent}
          onMessageSent={(message) => {
            if (!seenIds.current.has(message.id)) {
              seenIds.current.add(message.id);
              setMessages((prev) => [...prev, message]);
            }
          }}
        />
      </div>
    </div>
  );
}
