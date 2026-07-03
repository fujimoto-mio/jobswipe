"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import { LogIn } from "lucide-react";
import SeekerAuthShell from "@/components/auth/SeekerAuthShell";
import { FormPassword, FormTextInput } from "@/components/form/FormFields";
import { apiFetch, invalidateApiCache } from "@/lib/api-client";
import { clearClientSessionCache } from "@/lib/auth/client-session";
import { mapAuthError } from "@/lib/auth/errors";
import { invalidateSeekerMeCache, syncSeekerProfileFromMe } from "@/lib/seeker-user";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/schemas";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/explore?started=1";
  const registered = searchParams.get("registered") === "1";
  const authRequired = searchParams.get("reason") === "required";

  const seekerRegisterHref = (() => {
    const params = new URLSearchParams({ type: "seeker" });
    if (next !== "/explore?started=1" && next !== "/explore") params.set("next", next);
    return `/register?${params.toString()}`;
  })();

  return (
    <SeekerAuthShell
      title="ログイン"
      subtitle="登録済みのアカウントで、求人動画の閲覧・応募・チャットができます"
      footer={
        <>
          アカウントをお持ちでない方は{" "}
          <Link href={seekerRegisterHref} className="seeker-auth-link">
            新規登録
          </Link>
        </>
      }
    >
      {authRequired && (
        <p className="seeker-auth-alert seeker-auth-alert--info">
          この機能を利用するにはログインが必要です
        </p>
      )}

      {registered && (
        <p className="seeker-auth-alert seeker-auth-alert--success">
          登録が完了しました。ログインしてください。
        </p>
      )}

      {error && (
        <p className="seeker-auth-alert seeker-auth-alert--error">{error}</p>
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

            const res = await apiFetch("/api/me");
            const data = await res.json();

            if (data.profile) {
              clearClientSessionCache();
              invalidateApiCache();
              invalidateSeekerMeCache();
              syncSeekerProfileFromMe(data);
              router.replace(next);
              router.refresh();
              return;
            }

            router.replace(
              `/register?type=seeker&next=${encodeURIComponent(next)}&email=${encodeURIComponent(values.email)}`
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="seeker-auth-form">
            <FormTextInput
              name="email"
              label="メールアドレス"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormPassword label="パスワード" name="password" autoComplete="current-password" />
            <button type="submit" disabled={isSubmitting} className="btn-primary seeker-auth-submit flex w-full items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </button>
          </Form>
        )}
      </Formik>
    </SeekerAuthShell>
  );
}
