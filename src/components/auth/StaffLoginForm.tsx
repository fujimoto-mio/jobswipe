"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import { Building2, LogIn, Shield } from "lucide-react";
import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";
import { FormPassword, FormTextInput } from "@/components/form/FormFields";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api-client";
import { loginSchema } from "@/lib/validation/schemas";

type StaffLoginFormProps = {
  mode: "admin" | "company";
};

const CONFIG = {
  admin: {
    title: "管理者ログイン",
    subtitle: "システム管理者専用",
    icon: Shield,
    allowedRole: "admin" as const,
    wrongRoleMessage: "管理者アカウントでログインしてください。企業担当者の方は企業ログインをご利用ください。",
    wrongRoleLink: { href: "/company/login", label: "企業ログインへ" },
    emailPlaceholder: "admin@example.com",
  },
  company: {
    title: "企業ログイン",
    subtitle: "採用担当者・企業アカウント専用",
    icon: Building2,
    allowedRole: "company" as const,
    wrongRoleMessage: "企業担当者アカウントでログインしてください。",
    wrongRoleLink: { href: "/admin/login", label: "管理者ログインへ" },
    emailPlaceholder: "company@example.com",
  },
};

export default function StaffLoginForm({ mode }: StaffLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cfg = CONFIG[mode];
  const Icon = cfg.icon;

  const [error, setError] = useState("");

  const configError = searchParams.get("error") === "supabase";
  const staffOnlyError = searchParams.get("error") === "staff_only";

  return (
    <div className="min-h-[100dvh] bg-[var(--surface)]">
      <header className="page-header">
        <SeekerBrandHeader showMenu={false} logoHref="/" />
      </header>

      <main className="page-container flex justify-center py-10 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] shadow-lg shadow-blue-600/20">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{cfg.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{cfg.subtitle}</p>
          </div>

          <div className="staff-ui card-elevated p-6 sm:p-8">
            {staffOnlyError && mode === "company" && (
              <p className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                管理画面のご利用にはログインが必要です。求職者の方は
                <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
                  求職者ログイン
                </Link>
                をご利用ください。
              </p>
            )}

            {configError && (
              <p className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                Supabase の接続設定が必要です。
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

                const supabase = createSupabaseBrowserClient();
                if (!supabase) {
                  setError("Supabase が設定されていません。.env を確認してください。");
                  setSubmitting(false);
                  return;
                }

                const { data, error: signInError } = await supabase.auth.signInWithPassword(values);

                if (signInError || !data.user) {
                  setError("メールアドレスまたはパスワードが正しくありません");
                  setSubmitting(false);
                  return;
                }

                const role = (data.user.app_metadata?.role ?? data.user.user_metadata?.role) as string | undefined;

                if (role !== cfg.allowedRole) {
                  await supabase.auth.signOut();
                  setError(cfg.wrongRoleMessage);
                  setSubmitting(false);
                  return;
                }

                await apiFetch("/api/admin/auth/sync", { method: "POST" });

                const next = searchParams.get("next");
                const home = mode === "admin" ? "/admin" : "/company";
                const dest = next && next.startsWith(home) ? next : home;
                router.push(dest);
                router.refresh();
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  <FormTextInput
                    name="email"
                    label="メールアドレス"
                    type="email"
                    placeholder={cfg.emailPlaceholder}
                    autoComplete="email"
                  />
                  <FormPassword label="パスワード" name="password" autoComplete="current-password" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3"
                  >
                    <LogIn className="h-4 w-4" />
                    {isSubmitting ? "ログイン中..." : "ログイン"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            {mode === "company" ? (
              <>
                アカウントをお持ちでない方は{" "}
                <Link href="/register?type=company" className="font-semibold text-[var(--accent)] hover:underline">
                  企業新規登録
                </Link>
                {" · "}
                求職者の方は{" "}
                <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
                  求職者ログイン
                </Link>
                {" · "}
                <Link href="/admin/login" className="font-semibold text-[var(--accent)] hover:underline">
                  管理者ログイン
                </Link>
              </>
            ) : (
              <>
                <Link href="/company/login" className="font-semibold text-[var(--accent)] hover:underline">
                  企業ログイン
                </Link>
                {" · "}
                求職者は{" "}
                <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
                  こちら
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
