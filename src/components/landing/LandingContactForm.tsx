"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/brand";
import { SUPPORT_EMAIL } from "@/lib/constants";

export default function LandingContactForm() {
  return (
    <form
      className="lp-contact-box"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const company = (form.elements.namedItem("company") as HTMLInputElement).value;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const body = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
        const subject = encodeURIComponent(`【${APP_NAME}】お問い合わせ（${company}）`);
        const text = encodeURIComponent(`会社名: ${company}\nお名前: ${name}\nメール: ${email}\n\n${body}`);
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${text}`;
      }}
    >
      <div className="lp-form-field">
        <label htmlFor="company">
          会社名<span>必須</span>
        </label>
        <input id="company" name="company" type="text" required placeholder="株式会社サンプル" />
      </div>
      <div className="lp-form-field">
        <label htmlFor="name">
          お名前<span>必須</span>
        </label>
        <input id="name" name="name" type="text" required placeholder="採用 太郎" autoComplete="name" />
      </div>
      <div className="lp-form-field">
        <label htmlFor="email">
          メールアドレス<span>必須</span>
        </label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
      </div>
      <div className="lp-form-field">
        <label htmlFor="message">備考</label>
        <textarea id="message" name="message" placeholder="ご質問・ご要望をご記入ください" />
      </div>
      <label className="lp-checkbox">
        <input type="checkbox" required />
        <span>
          <Link href="/privacy" target="_blank">
            プライバシーポリシー
          </Link>
          に同意の上送信します
        </span>
      </label>
      <button type="submit" className="lp-submit-btn">
        送信する
        <span className="lp-header-btn__arrow" />
      </button>
    </form>
  );
}
