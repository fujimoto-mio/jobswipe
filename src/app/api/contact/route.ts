import { NextResponse } from "next/server";
import { ValidationError } from "yup";
import { sendContactInquiryEmail, isSmtpConfigured } from "@/lib/email-smtp";
import { contactInquirySchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { error: "メール送信の設定が完了していません。しばらくしてからお試しください。" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const validated = await contactInquirySchema.validate(body, { abortEarly: false, stripUnknown: true });

    const sent = await sendContactInquiryEmail({
      company: validated.company,
      name: validated.name,
      email: validated.email,
      message: validated.message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "送信に失敗しました。しばらくしてから再度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors[0] ?? "入力内容を確認してください";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("[api/contact] failed:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
