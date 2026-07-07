"use client";

import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { PREFECTURES } from "@/components/service-lp/service-lp-data";

export default function ServiceLpContactForm() {
  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const company = (form.elements.namedItem("company") as HTMLInputElement).value;
        const prefecture = (form.elements.namedItem("prefecture") as HTMLSelectElement).value;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
        const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
        const subject = encodeURIComponent(`【MasKOFF】お問い合わせ（${company}）`);
        const text = encodeURIComponent(
          `企業名: ${company}\n都道府県: ${prefecture}\nお名前: ${name}\nメール: ${email}\n電話番号: ${phone}\n\n${message}`,
        );
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${text}`;
      }}
    >
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 1.7 }}>
        下記フォームへ必要事項をご記入の上、送信ください。
      </p>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="company">
            企業名<span className="form-required">必須</span>
          </label>
          <input id="company" name="company" type="text" className="form-input" required placeholder="株式会社〇〇" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="prefecture">
            都道府県<span className="form-required">必須</span>
          </label>
          <select id="prefecture" name="prefecture" className="form-select" required defaultValue="東京都">
            <option value="">選択してください</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            お名前<span className="form-required">必須</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            required
            placeholder="山田 太郎"
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            メールアドレス<span className="form-required">必須</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            required
            placeholder="example@email.com"
            autoComplete="email"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="phone">
          電話番号<span className="form-required">必須</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="form-input"
          required
          placeholder="0312345678（ハイフンなし）"
          autoComplete="tel"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="message">
          備考
        </label>
        <textarea
          id="message"
          name="message"
          className="form-textarea"
          placeholder="ご質問・ご要望などがあればご記入ください"
        />
      </div>
      <div className="form-agree">
        <input type="checkbox" id="agree" required />
        <label htmlFor="agree">
          当社規定の
          <Link href="/privacy" target="_blank">
            プライバシーポリシー
          </Link>
          へ同意する
        </label>
      </div>
      <button type="submit" className="btn-submit">
        送信する
      </button>
      <p className="form-note">営業・広告キーワード除外依頼等は本フォームの対象外です。</p>
    </form>
  );
}
