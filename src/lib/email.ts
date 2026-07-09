import { getAppUrl } from "@/lib/app-url";
import { escapeHtml, sendSmtpEmail } from "@/lib/email-smtp";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput): Promise<boolean> {
  return sendSmtpEmail({
    to,
    subject,
    html,
    text: text ?? subject,
    replyTo,
  });
}

export async function sendMatchNotificationEmail(
  to: string,
  name: string,
  jobTitle: string,
  company: string
): Promise<boolean> {
  const chatUrl = `${await getAppUrl()}/chat`;
  const subject = `【JobSwipe】採用が決定しました — ${company}`;
  const text = [
    `${name} 様`,
    "",
    `おめでとうございます。${company} の「${jobTitle}」への応募が採用決定となりました。`,
    "アプリのチャット画面から企業担当者と今後の手続きについてご連絡ください。",
    "",
    `チャットを開く: ${chatUrl}`,
    "",
    "— JobSwipe",
  ].join("\n");

  const html = `
    <p>${escapeHtml(name)} 様</p>
    <p>おめでとうございます。<strong>${escapeHtml(company)}</strong> の「${escapeHtml(jobTitle)}」への応募が採用決定となりました。</p>
    <p>アプリのチャット画面から企業担当者と今後の手続きについてご連絡ください。</p>
    <p><a href="${escapeHtml(chatUrl)}">チャットを開く</a></p>
    <p>— JobSwipe</p>
  `;

  return sendEmail({ to, subject, html, text });
}
