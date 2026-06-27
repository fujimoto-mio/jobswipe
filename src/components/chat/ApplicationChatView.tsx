"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Form, Formik, useField } from "formik";
import { Send } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FormError } from "@/components/form/FormFields";
import { apiFetch } from "@/lib/api-client";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import { formatTimeJST } from "@/lib/datetime";
import { chatMessageSchema } from "@/lib/validation/schemas";
import type { ChatMessage } from "@/lib/types";

type ApplicationChatViewProps = {
  applicationId: string;
  sender: "seeker" | "company";
  emptyHint?: string;
  className?: string;
};

function ChatInputField() {
  const [field, meta] = useField("content");

  return (
    <div className="min-w-0 flex-1">
      <input
        {...field}
        placeholder="メッセージを入力..."
        className={`input-field w-full rounded-full ${meta.touched && meta.error ? "ring-1 ring-red-300" : ""}`}
      />
      <FormError name="content" />
    </div>
  );
}

export default function ApplicationChatView({
  applicationId,
  sender,
  emptyHint = "メッセージを送信して会話を始めましょう",
  className = "",
}: ApplicationChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<string>());

  const loadMessages = useCallback(() => {
    setLoading(true);
    seenIds.current.clear();
    apiFetch(`/api/chat?applicationId=${applicationId}`)
      .then((r) => r.json())
      .then((d) => {
        const msgs = (d.messages ?? []) as ChatMessage[];
        msgs.forEach((m) => seenIds.current.add(m.id));
        setMessages(msgs);
      })
      .finally(() => setLoading(false));
  }, [applicationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const onRealtimeMessage = useCallback((message: ChatMessage) => {
    if (seenIds.current.has(message.id)) return;
    seenIds.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  }, []);

  useChatRealtime(applicationId, onRealtimeMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isOwn = (msg: ChatMessage) => msg.sender === sender;

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
        {loading ? (
          <LoadingSpinner message="メッセージを読み込み中..." className="py-12" />
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">{emptyHint}</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-3 flex ${isOwn(msg) ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isOwn(msg)
                    ? "rounded-br-md bg-blue-600 text-white"
                    : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
                }`}
              >
                {msg.content}
                <p className={`mt-1 text-[10px] ${isOwn(msg) ? "text-blue-200" : "text-slate-400"}`}>
                  {formatTimeJST(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <Formik
          initialValues={{ content: "" }}
          validationSchema={chatMessageSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setSubmitting(true);
            try {
              const res = await apiFetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ applicationId, content: values.content, sender }),
              });
              if (res.ok) {
                resetForm();
                const data = await res.json();
                if (!seenIds.current.has(data.message.id)) {
                  seenIds.current.add(data.message.id);
                  setMessages((prev) => [...prev, data.message]);
                }
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, submitForm }) => (
            <Form className="flex flex-col gap-1">
              <div
                className="flex gap-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitForm();
                  }
                }}
              >
                <ChatInputField />
                <button
                  type="submit"
                  disabled={isSubmitting || !values.content.trim()}
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition active:scale-95 disabled:opacity-50"
                  aria-label="送信"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
