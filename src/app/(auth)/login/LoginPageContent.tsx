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
import { getApiErrorMessage } from "@/lib/auth/errors";
import { invalidateSeekerMeCache, fetchSeekerMe, syncSeekerProfileFromMe } from "@/lib/seeker-user";
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
            const loginRes = await apiFetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...values, role: "seeker" }),
            });
            const loginData = await loginRes.json();
            if (!loginRes.ok) {
              setError(getApiErrorMessage(loginData, "ログインに失敗しました"));
              return;
            }

            clearClientSessionCache();
            invalidateApiCache();
            invalidateSeekerMeCache();

            const meData = await fetchSeekerMe({ force: true });
            if (meData?.profile) {
              syncSeekerProfileFromMe(meData);
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
