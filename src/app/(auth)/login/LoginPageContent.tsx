"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import { LogIn } from "lucide-react";
import SeekerAuthShell from "@/components/auth/SeekerAuthShell";
import { FormPassword, FormTextInput } from "@/components/form/FormFields";
import { apiFetch } from "@/lib/api-client";
import { mapAuthError } from "@/lib/auth/errors";
import { saveProfile } from "@/lib/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/schemas";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/explore";
  const registered = searchParams.get("registered") === "1";
  const authRequired = searchParams.get("reason") === "required";

  return (
    <SeekerAuthShell
      title="ログイン"
      subtitle="登録済みのアカウントで、求人動画の閲覧・応募・チャットができます"
      footer={
        <>
          アカウントをお持ちでない方は{" "}
          <Link href={`/register${next !== "/explore" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-[var(--accent)] hover:underline">
            新規登録
          </Link>
        </>
      }
    >
      {authRequired && (
        <p className="mb-5 rounded-xl border border-[var(--accent-light)] bg-[var(--accent-light)] px-3.5 py-2.5 text-sm text-[var(--accent)]">
          この機能を利用するにはログインが必要です
        </p>
      )}

      {registered && (
        <p className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
          登録が完了しました。ログインしてください。
        </p>
      )}

      {error && (
        <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setError("");
          try {
            const supabase = createSupabaseBrowserClient();
            if (!supabase) {
              setError("認証サービスが設定されていません。管理者にお問い合わせください。");
              return;
            }

            const { error: authError } = await supabase.auth.signInWithPassword(values);
            if (authError) {
              setError(mapAuthError(authError.message));
              return;
            }

            const res = await apiFetch("/api/profile");
            const data = await res.json();

            if (data.profile) {
              saveProfile(data.profile);
              router.replace(next);
              router.refresh();
              return;
            }

            router.replace(`/register?next=${encodeURIComponent(next)}&email=${encodeURIComponent(values.email)}`);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <FormTextInput
              name="email"
              label="メールアドレス"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormPassword label="パスワード" name="password" autoComplete="current-password" />
            <button type="submit" disabled={isSubmitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </button>
          </Form>
        )}
      </Formik>
    </SeekerAuthShell>
  );
}
