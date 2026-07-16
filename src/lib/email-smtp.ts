import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { APP_NAME } from "@/lib/brand";

export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL?.trim() ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ?? "";
}

function getEmailFrom(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;

  const user = process.env.SMTP_USER?.trim();
  if (user) return `${APP_NAME} <${user}>`;

  return null;
}

function parseSmtpPort(): number {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return Number.isFinite(port) ? port : 465;
}

function isSmtpSecure(port: number): boolean {
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  if (secureEnv === "true") return true;
  if (secureEnv === "false") return false;
  return port === 465;
}

function getSmtpTransportOptions(): SMTPTransport.Options | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  const port = parseSmtpPort();
  const secure = isSmtpSecure(port);

  return {
    host,
    port,
    secure,
    requireTLS: !secure,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
    auth: { user, pass },
  };
}

export function isSmtpConfigured(): boolean {
  return Boolean(getSmtpTransportOptions() && getSupportEmail() && getEmailFrom());
}

type SendSmtpEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendSmtpEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendSmtpEmailInput): Promise<boolean> {
  const options = getSmtpTransportOptions();
  const from = getEmailFrom();
  const supportEmail = getSupportEmail();

  if (!options) {
    console.warn("[email-smtp] SMTP_HOST, SMTP_USER, or SMTP_PASS not set — skipping:", subject, "→", to);
    return false;
  }

  if (!from) {
    console.warn("[email-smtp] EMAIL_FROM / SMTP_USER not set — skipping:", subject, "→", to);
    return false;
  }

  if (!supportEmail) {
    console.warn("[email-smtp] SUPPORT_EMAIL not set — skipping:", subject, "→", to);
    return false;
  }

  const transporter = nodemailer.createTransport(options);

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("[email-smtp] failed:", error);
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type ContactInquiryInput = {
  company?: string;
  name: string;
  email: string;
  message: string;
};

export async function sendContactInquiryEmail(input: ContactInquiryInput): Promise<boolean> {
  const supportEmail = getSupportEmail();
  if (!supportEmail) return false;
  const subjectLabel = input.company?.trim() || input.name;
  const subject = `【${APP_NAME}】お問い合わせ（${subjectLabel}）`;

  const companyLine = input.company?.trim() ? `会社名: ${input.company.trim()}\n` : "";
  const text = `${companyLine}お名前: ${input.name}\nメール: ${input.email}\n\n${input.message}`;

  const companyHtml = input.company?.trim()
    ? `<tr><th align="left">会社名</th><td>${escapeHtml(input.company.trim())}</td></tr>`
    : "";

  const html = `
    <p>${escapeHtml(APP_NAME)} お問い合わせフォームより送信されました。</p>
    <table cellpadding="6" cellspacing="0" border="0">
      ${companyHtml}
      <tr><th align="left">お名前</th><td>${escapeHtml(input.name)}</td></tr>
      <tr><th align="left">メール</th><td>${escapeHtml(input.email)}</td></tr>
    </table>
    <p><strong>お問い合わせ内容</strong></p>
    <p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>
  `;

  return sendSmtpEmail({
    to: supportEmail,
    subject,
    html,
    text,
    replyTo: input.email,
  });
}
