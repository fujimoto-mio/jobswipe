import { getAppUrl } from "@/lib/app-url";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "JobSwipe <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping:", subject, "→", to);
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    console.error("[email] failed:", await res.text());
    return false;
  }

  return true;
}

export async function sendMatchNotificationEmail(
  to: string,
  name: string,
  jobTitle: string,
  company: string
): Promise<boolean> {
  const chatUrl = `${getAppUrl()}/chat`;

  return sendEmail({
    to,
    subject: `【JobSwipe】採用が決定しました — ${company}`,
    html: `
      <p>${name} 様</p>
      <p>おめでとうございます。<strong>${company}</strong> の「${jobTitle}」への応募が採用決定となりました。</p>
      <p>アプリのチャット画面から企業担当者と今後の手続きについてご連絡ください。</p>
      <p><a href="${chatUrl}">チャットを開く</a></p>
      <p>— JobSwipe</p>
    `,
  });
}
