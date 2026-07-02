"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import { Building2, ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react";
import LpAuthShell from "@/components/auth/LpAuthShell";
import { FormPassword, FormTextInput } from "@/components/form/FormFields";
import SeekerProfileFormFields from "@/components/form/SeekerProfileFormFields";
import {
  COMPANY_LEGAL_LINKS,
  LegalAgreementField,
  SEEKER_LEGAL_LINKS,
} from "@/components/form/LegalAgreementField";
import { saveProfile } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { mapAuthError } from "@/lib/auth/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  companyRegisterFormSchema,
  seekerAccountSchema,
  seekerRegisterFormSchema,
  type SeekerAccountValues,
} from "@/lib/validation/schemas";

type AccountType = "seeker" | "company";
type RegisterStep = "type" | "seeker-1" | "seeker-2" | "company";

function resolveInitialStep(presetEmail: string, presetType: string | null): RegisterStep {
  if (presetEmail) return "seeker-2";
  if (presetType === "seeker") return "seeker-1";
  if (presetType === "company") return "company";
  return "type";
}

export default function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") ?? "";
  const presetType = searchParams.get("type");

  const [step, setStep] = useState<RegisterStep>(() => resolveInitialStep(presetEmail, presetType));
  const [accountType, setAccountType] = useState<AccountType | null>(() => {
    if (presetEmail || presetType === "seeker") return "seeker";
    if (presetType === "company") return "company";
    return null;
  });

  const [account, setAccount] = useState<SeekerAccountValues | null>(
    presetEmail ? { email: presetEmail, password: "", confirmPassword: "" } : null
  );
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/explore";
  const loginHref = `/login${next !== "/explore" ? `?next=${encodeURIComponent(next)}` : ""}`;

  const selectAccountType = (type: AccountType) => {
    setError("");
    setAccountType(type);
    setStep(type === "seeker" ? "seeker-1" : "company");
  };

  const shellSubtitle =
    step === "type"
      ? "求職者か企業担当者かを選択してください"
      : accountType === "company"
        ? "企業アカウントを作成し、求人の掲載・応募管理ができます"
        : "1分で登録完了。応募時にプロフィールが自動入力されます";

  return (
    <LpAuthShell
      title="新規登録"
      subtitle={shellSubtitle}
      footer={
        <>
          すでにアカウントをお持ちの方は{" "}
          <Link href={loginHref} className="lp-auth-link">
            ログイン
          </Link>
        </>
      }
    >
      {step.startsWith("seeker") && (
        <div className="mb-6 flex items-center gap-2">
          {[1, 2].map((n) => {
            const seekerStep = step === "seeker-1" ? 1 : 2;
            return (
              <div key={n} className="flex flex-1 items-center gap-2">
                <div className={`lp-auth-step ${seekerStep >= n ? "is-active" : "is-inactive"}`}>{n}</div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    seekerStep >= n ? "text-[var(--lp-text)]" : "text-[var(--lp-muted)]"
                  }`}
                >
                  {n === 1 ? "アカウント" : "プロフィール"}
                </span>
                {n === 1 && <div className={`lp-auth-step-line ${seekerStep > 1 ? "is-active" : ""}`} />}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {step === "type" && (
        <div className="space-y-3">
          <button type="button" onClick={() => selectAccountType("seeker")} className="lp-auth-choice">
            <div className="lp-auth-choice__icon">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--lp-text)]">求職者として登録</p>
              <p className="mt-1 text-sm text-[var(--lp-muted)]">
                求人動画の閲覧・応募・企業とのチャットができます
              </p>
            </div>
            <ChevronRight className="ml-auto mt-3 h-5 w-5 shrink-0 text-[var(--lp-muted)]" />
          </button>

          <button type="button" onClick={() => selectAccountType("company")} className="lp-auth-choice">
            <div className="lp-auth-choice__icon lp-auth-choice__icon--company">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--lp-text)]">企業として登録</p>
              <p className="mt-1 text-sm text-[var(--lp-muted)]">
                求人の掲載・応募管理・求職者とのチャットができます
              </p>
            </div>
            <ChevronRight className="ml-auto mt-3 h-5 w-5 shrink-0 text-[var(--lp-muted)]" />
          </button>
        </div>
      )}

      {step === "seeker-1" && (
        <Formik
          initialValues={{ email: account?.email ?? "", password: "", confirmPassword: "" }}
          validationSchema={seekerAccountSchema}
          onSubmit={(values) => {
            setError("");
            setAccount(values);
            setStep("seeker-2");
          }}
        >
          <Form className="space-y-5">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("type");
              }}
              className="lp-auth-back"
            >
              <ChevronLeft className="h-4 w-4" />
              登録タイプを選び直す
            </button>

            <FormTextInput name="email" label="メールアドレス" type="email" placeholder="you@example.com" autoComplete="email" />
            <FormPassword name="password" label="パスワード" autoComplete="new-password" hint="8文字以上・英数字の組み合わせを推奨" />
            <FormPassword name="confirmPassword" label="パスワード（確認）" autoComplete="new-password" />

            <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2 py-3">
              次へ：プロフィール入力
              <ChevronRight className="h-4 w-4" />
            </button>
          </Form>
        </Formik>
      )}

      {step === "seeker-2" && account && (
        <Formik
          initialValues={{
            name: "",
            gender: "",
            birthday: "",
            area: "",
            desiredJobType: "",
            experience: "",
            employmentType: "",
            phone: "",
            address: "",
            email: account.email,
            acceptLegal: false,
          }}
          validationSchema={seekerRegisterFormSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            setSubmitting(true);
            try {
              const { acceptLegal: _acceptLegal, ...profileValues } = values;
              const supabase = createSupabaseBrowserClient();
              if (!supabase) {
                setError("認証サービスが設定されていません。管理者にお問い合わせください。");
                return;
              }

              const res = await apiFetch("/api/auth/register/seeker", {
                method: "POST",
                body: JSON.stringify({
                  ...profileValues,
                  email: account.email.trim(),
                  password: account.password,
                }),
              });

              if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "登録に失敗しました");
                if (res.status === 409) setStep("seeker-1");
                return;
              }

              const data = await res.json();

              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: account.email.trim(),
                password: account.password,
              });

              if (signInError) {
                setError(mapAuthError(signInError.message));
                return;
              }

              saveProfile(data.profile);
              router.replace(next);
              router.refresh();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {!presetEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("seeker-1");
                  }}
                  className="lp-auth-back"
                >
                  <ChevronLeft className="h-4 w-4" />
                  アカウント情報に戻る
                </button>
              )}

              <SeekerProfileFormFields />

              <input type="hidden" name="email" value={account.email} readOnly />

              <p className="lp-auth-note">
                登録情報は応募フォームに自動入力されます。送信前にいつでも編集できます。
              </p>

              <LegalAgreementField name="acceptLegal" links={SEEKER_LEGAL_LINKS} />

              <button type="submit" disabled={isSubmitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "登録中..." : "登録して始める"}
              </button>
            </Form>
          )}
        </Formik>
      )}

      {step === "company" && (
        <Formik
          initialValues={{
            companyName: "",
            contactName: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptLegal: false,
          }}
          validationSchema={companyRegisterFormSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setError("");
            setSubmitting(true);
            try {
              const { acceptLegal: _acceptLegal, ...registerValues } = values;
              const supabase = createSupabaseBrowserClient();
              if (!supabase) {
                setError("認証サービスが設定されていません。管理者にお問い合わせください。");
                return;
              }

              const res = await apiFetch("/api/auth/register/company", {
                method: "POST",
                body: JSON.stringify({
                  email: registerValues.email.trim(),
                  password: registerValues.password,
                  companyName: registerValues.companyName.trim(),
                  contactName: registerValues.contactName.trim(),
                }),
              });

              if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "企業アカウントの登録に失敗しました");
                return;
              }

              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: registerValues.email.trim(),
                password: registerValues.password,
              });

              if (signInError) {
                setError(mapAuthError(signInError.message));
                return;
              }

              router.replace("/company");
              router.refresh();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("type");
                }}
                className="lp-auth-back"
              >
                <ChevronLeft className="h-4 w-4" />
                登録タイプを選び直す
              </button>

              <FormTextInput name="companyName" label="会社名" placeholder="株式会社サンプル" />
              <FormTextInput name="contactName" label="担当者名" placeholder="採用 太郎" autoComplete="name" />
              <FormTextInput name="email" label="メールアドレス" type="email" placeholder="hr@company.com" autoComplete="email" />
              <FormPassword name="password" label="パスワード" autoComplete="new-password" hint="8文字以上・英数字の組み合わせを推奨" />
              <FormPassword name="confirmPassword" label="パスワード（確認）" autoComplete="new-password" />

              <p className="lp-auth-note">
                登録後、管理画面から求人の作成・応募管理ができます。求人は管理者承認後に公開されます。
              </p>

              <LegalAgreementField name="acceptLegal" links={COMPANY_LEGAL_LINKS} />

              <button type="submit" disabled={isSubmitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
                <Building2 className="h-4 w-4" />
                {isSubmitting ? "登録中..." : "企業アカウントを作成"}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </LpAuthShell>
  );
}
