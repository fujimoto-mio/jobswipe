import { NextResponse } from "next/server";
import type { AuthRole } from "@/lib/auth/roles";
import { API_ERRORS } from "@/lib/api-errors";
import { loginWithPassword } from "@/lib/auth/login";
import { clearAuthSessionCookie, setAuthSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
  role?: AuthRole;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json({ error: API_ERRORS.loginFieldsRequired }, { status: 400 });
  }

  try {
    const result = await loginWithPassword(email, password, body.role);
    if (!result.ok) {
      const status =
        result.code === "suspended" ? 403 : result.code === "wrong_role" ? 403 : 401;
      return NextResponse.json({ error: result.message, code: result.code }, { status });
    }

    const response = NextResponse.json({
      success: true,
      role: result.session.role,
      seekerId: result.session.seekerId ?? null,
    });
    await setAuthSessionCookie(response, result.session);
    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("AUTH_JWT_SECRET")) {
      return NextResponse.json({ error: API_ERRORS.jwtNotConfigured }, { status: 500 });
    }
    return NextResponse.json(
      { error: "ログイン処理中にエラーが発生しました。しばらくしてから再度お試しください" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAuthSessionCookie(response);
  return response;
}
