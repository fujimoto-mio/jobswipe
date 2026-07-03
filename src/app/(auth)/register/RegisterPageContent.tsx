"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Formik } from "formik";
import { Building2, Check, ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react";
import LpAuthShell from "@/components/auth/LpAuthShell";
import SeekerAuthShell from "@/components/auth/SeekerAuthShell";
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

function RegisterError({ message }: { message: string }) {
  return <p className="seeker-auth-alert seeker-auth-alert--error">{message}</p>;
}

function SeekerRegisterSteps({ current }: { current: 1 | 2 }) {
  return (
    <nav className="seeker-auth-steps" aria-label="登録ステップ">
      <div
        className={`seeker-auth-step-item ${current === 1 ? "is-current" : "is-done"}`}
        aria-current={current === 1 ? "step" : undefined}
      >
        <span className="seeker-auth-step__badge" aria-hidden>
          {current > 1 ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : "1"}
        </span>
        <span className="seeker-auth-step__label">アカウント</span>
      </div>

      <div className="seeker-auth-step__track" aria-hidden>
        <span className={`seeker-auth-step__track-fill ${current > 1 ? "is-complete" : ""}`} />
      </div>

      <div
        className={`seeker-auth-step-item ${current === 2 ? "is-current" : "is-upcoming"}`}
        aria-current={current === 2 ? "step" : undefined}
      >
        <span className="seeker-auth-step__badge" aria-hidden>
          2
        </span>
        <span className="seeker-auth-step__label">プロフィール</span>
      </div>
    </nav>
  );
}

export default function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") ?? "";
  const presetType = searchParams.get("type");

  const [step, setStep] = useState<RegisterStep>(() => resolveInitialStep(presetEmail, presetType));

  const [account, setAccount] = useState<SeekerAccountValues | null>(
    presetEmail ? { email: presetEmail, password: "", confirmPassword: "" } : null
  );
  const [error, setError] = useState("");

  const next = searchParams.get("next") || "/explore?started=1";
  const loginHref = `/login${
    next !== "/explore?started=1" && next !== "/explore" ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  const selectAccountType = (type: AccountType) => {
    setError("");
    setStep(type === "seeker" ? "seeker-1" : "company");
  };

  const seekerSubtitle =
    step === "type"
      ? "求職者か企業担当者かを選択してください"
      : step === "seeker-1"
        ? "メールアドレスとパスワードを設定してください"
        : "プロフィールを入力して登録を完了しましょう";

  if (step === "company") {
    return (
      <LpAuthShell
        title="企業アカウント登録"
        subtitle="企業アカウントを作成し、求人の掲載・応募管理ができます"
        footer={
          <>
            すでにアカウントをお持ちの方は{" "}
            <Link href={loginHref} className="lp-auth-link">
              ログイン
            </Link>
          </>
        }
      >
        {error && (
          <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

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
      </LpAuthShell>
    );
  }

  return (
    <SeekerAuthShell
      title="新規登録"
      subtitle={seekerSubtitle}
      footer={
        <>
          すでにアカウントをお持ちの方は{" "}
          <Link href={loginHref} className="seeker-auth-link">
            ログイン
          </Link>
        </>
      }
    >
      {step.startsWith("seeker") && (
        <SeekerRegisterSteps current={step === "seeker-1" ? 1 : 2} />
      )}

      {error && <RegisterError message={error} />}

      {step === "type" && (
        <div className="seeker-auth-choices">
          <button type="button" onClick={() => selectAccountType("seeker")} className="seeker-auth-choice">
            <div className="seeker-auth-choice__icon">
              <Users className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="seeker-auth-choice__title">求職者として登録</p>
              <p className="seeker-auth-choice__desc">
                求人動画の閲覧・応募・企業とのチャットができます
              </p>
            </div>
            <ChevronRight className="seeker-auth-choice__chevron" />
          </button>

          <button type="button" onClick={() => selectAccountType("company")} className="seeker-auth-choice">
            <div className="seeker-auth-choice__icon seeker-auth-choice__icon--company">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="seeker-auth-choice__title">企業として登録</p>
              <p className="seeker-auth-choice__desc">
                求人の掲載・応募管理・求職者とのチャットができます
              </p>
            </div>
            <ChevronRight className="seeker-auth-choice__chevron" />
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
          <Form className="seeker-auth-form">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("type");
              }}
              className="seeker-auth-back"
            >
              <ChevronLeft className="h-4 w-4" />
              登録タイプを選び直す
            </button>

            <FormTextInput name="email" label="メールアドレス" type="email" placeholder="you@example.com" autoComplete="email" />
            <FormPassword name="password" label="パスワード" autoComplete="new-password" hint="8文字以上・英数字の組み合わせを推奨" />
            <FormPassword name="confirmPassword" label="パスワード（確認）" autoComplete="new-password" />

            <button type="submit" className="btn-primary seeker-auth-submit flex w-full items-center justify-center gap-2">
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
            <Form className="seeker-auth-form seeker-auth-form--profile">
              {!presetEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("seeker-1");
                  }}
                  className="seeker-auth-back"
                >
                  <ChevronLeft className="h-4 w-4" />
                  アカウント情報に戻る
                </button>
              )}

              <SeekerProfileFormFields stackedLayout />

              <input type="hidden" name="email" value={account.email} readOnly />

              <p className="seeker-auth-note">
                登録情報は応募フォームに自動入力されます。送信前にいつでも編集できます。
              </p>

              <LegalAgreementField name="acceptLegal" links={SEEKER_LEGAL_LINKS} />

              <button type="submit" disabled={isSubmitting} className="btn-primary seeker-auth-submit flex w-full items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "登録中..." : "登録して始める"}
              </button>
            </Form>
          )}
        </Formik>
      )}
    </SeekerAuthShell>
  );
}
