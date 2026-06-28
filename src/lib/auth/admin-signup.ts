import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { AuthRole } from "@/lib/auth/roles";

type CreateAuthUserInput = {
  email: string;
  password: string;
  role: AuthRole;
  name: string;
};

type CreateAuthUserResult =
  | { ok: true; userId: string }
  | { ok: false; code: "already_registered" | "config" | "unknown"; message: string };

/** Create a Supabase auth user with email already confirmed (no confirmation email). */
export async function createConfirmedAuthUser(
  input: CreateAuthUserInput
): Promise<CreateAuthUserResult> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return { ok: false, code: "config", message: "Supabase service role is not configured" };
  }

  const email = input.email.trim();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    app_metadata: { role: input.role },
    user_metadata: { name: input.name, role: input.role },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return {
        ok: false,
        code: "already_registered",
        message: "このメールアドレスは既に登録されています。ログインしてください",
      };
    }
    return { ok: false, code: "unknown", message: error.message };
  }

  if (!data.user?.id) {
    return { ok: false, code: "unknown", message: "ユーザー作成に失敗しました" };
  }

  return { ok: true, userId: data.user.id };
}

/** Roll back auth user when profile/company setup fails after createUser. */
export async function deleteAuthUser(userId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) return;
  await supabase.auth.admin.deleteUser(userId);
}
