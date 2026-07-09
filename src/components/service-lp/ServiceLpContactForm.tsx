"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const SUCCESS_MESSAGE = "お問い合わせを送信しました。担当者よりご連絡いたします。";

export default function ServiceLpContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <form
        className="jslp-contact-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setToast(null);
          setSubmitting(true);

          const form = e.currentTarget;
          const company = (form.elements.namedItem("company") as HTMLInputElement).value.trim();
          const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
          const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
          const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

          try {
            const res = await apiFetch("/api/contact", {
              method: "POST",
              body: JSON.stringify({
                company: company || undefined,
                name,
                email,
                message,
              }),
            });

            const data = (await res.json()) as { error?: string };

            if (!res.ok) {
              setError(data.error ?? "送信に失敗しました。しばらくしてから再度お試しください。");
              return;
            }

            setToast(SUCCESS_MESSAGE);
            form.reset();
          } catch {
            setError("送信に失敗しました。しばらくしてから再度お試しください。");
          } finally {
            setSubmitting(false);
          }
        }}
    >
      <div className="jslp-form-field">
        <label htmlFor="lp-company">会社名（任意）</label>
        <input id="lp-company" name="company" type="text" placeholder="株式会社サンプル" autoComplete="organization" />
      </div>
      <div className="jslp-form-field">
        <label htmlFor="lp-name">お名前</label>
        <input id="lp-name" name="name" type="text" required placeholder="採用 太郎" autoComplete="name" />
      </div>
      <div className="jslp-form-field">
        <label htmlFor="lp-email">メールアドレス</label>
        <input id="lp-email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="jslp-form-field">
        <label htmlFor="lp-message">お問い合わせ内容</label>
        <textarea
          id="lp-message"
          name="message"
          required
          placeholder="ご質問・ご要望をご記入ください"
          rows={6}
        />
      </div>
      <div className="jslp-contact-form__actions">
        <label className="jslp-form-checkbox">
          <input type="checkbox" required />
          <span>
            <Link href="/privacy" target="_blank">
              プライバシーポリシー
            </Link>
            に同意の上送信します
          </span>
        </label>
        {error ? <p className="jslp-contact-form__message jslp-contact-form__message--error">{error}</p> : null}
        <button type="submit" className="jslp-cta__btn jslp-contact-form__submit" disabled={submitting}>
          <Send className="jslp-contact-form__submit-icon" aria-hidden />
          {submitting ? "送信中..." : "送信する"}
        </button>
      </div>
    </form>

      {toast ? (
        <div className="jslp-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
