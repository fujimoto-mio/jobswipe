"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react";
import SeekerAuthShell from "@/components/auth/SeekerAuthShell";
import PasswordField from "@/components/auth/PasswordField";
import {
  AREAS,
  JOB_CATEGORIES,
  GENDERS,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
} from "@/lib/constants";
import { DEFAULT_PROFILE, saveProfile } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { mapAuthError } from "@/lib/auth/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

type AccountType = "seeker" | "company";
type RegisterStep = "type" | "seeker-1" | "seeker-2" | "company";

function resolveInitialStep(
  presetEmail: string,
  presetType: string | null
): RegisterStep {
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

  const [form, setForm] = useState<UserProfile>({
    ...DEFAULT_PROFILE,
    email: presetEmail,
  });
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get("next") || "/explore";
  const loginHref = `/login${next !== "/explore" ? `?next=${encodeURIComponent(next)}` : ""}`;

  const update = (key: keyof UserProfile, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validatePasswords = (email: string): boolean => {
    if (!email.trim()) {
      setError("メールアドレスを入力してください");
      return false;
    }
    if (!password || password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return false;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return false;
    }
    return true;
  };

  const selectAccountType = (type: AccountType) => {
    setError("");
    setAccountType(type);
    setStep(type === "seeker" ? "seeker-1" : "company");
  };

  const handleSeekerStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (validatePasswords(form.email)) setStep("seeker-2");
  };

  const handleSeekerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.gender || !form.area || !form.desiredJobType || !form.experience || !form.employmentType) {
      setError("必須項目をすべて入力してください");
      return;
    }
    if (form.age < 18 || form.age > 80) {
      setError("年齢は18〜80歳の範囲で入力してください");
      return;
    }
    if (!validatePasswords(form.email)) {
      setStep("seeker-1");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("認証サービスが設定されていません。管理者にお問い合わせください。");
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password,
        options: {
          data: { name: form.name, role: "seeker" },
        },
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        if (authError.message.toLowerCase().includes("already")) setStep("seeker-1");
        return;
      }

      const res = await apiFetch("/api/profile", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "プロフィールの保存に失敗しました");
        return;
      }

      const data = await res.json();
      saveProfile(data.profile);
      router.replace(next);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim()) {
      setError("会社名と担当者名を入力してください");
      return;
    }
    if (!validatePasswords(companyEmail)) return;

    setSubmitting(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("認証サービスが設定されていません。管理者にお問い合わせください。");
        return;
      }

      const { error: authError } = await supabase.auth.signUp({
        email: companyEmail.trim(),
        password,
        options: {
          data: { name: contactName, role: "company" },
        },
      });

      if (authError) {
        setError(mapAuthError(authError.message));
        return;
      }

      const res = await apiFetch("/api/company/register", {
        method: "POST",
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "企業アカウントの登録に失敗しました");
        return;
      }

      await apiFetch("/api/admin/auth/sync", { method: "POST" });
      router.replace("/company");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const shellSubtitle =
    step === "type"
      ? "求職者か企業担当者かを選択してください"
      : accountType === "company"
        ? "企業アカウントを作成し、求人の掲載・応募管理ができます"
        : "1分で登録完了。応募時にプロフィールが自動入力されます";

  return (
    <SeekerAuthShell
      title="新規登録"
      subtitle={shellSubtitle}
      footer={
        <>
          すでにアカウントをお持ちの方は{" "}
          <Link href={loginHref} className="font-semibold text-[var(--accent)] hover:underline">
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
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                    seekerStep >= n
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--border)]"
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    seekerStep >= n ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                >
                  {n === 1 ? "アカウント" : "プロフィール"}
                </span>
                {n === 1 && (
                  <div className={`h-px flex-1 ${seekerStep > 1 ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                )}
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
          <button
            type="button"
            onClick={() => selectAccountType("seeker")}
            className="flex w-full items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">求職者として登録</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                求人動画の閲覧・応募・企業とのチャットができます
              </p>
            </div>
            <ChevronRight className="ml-auto mt-3 h-5 w-5 shrink-0 text-[var(--muted)]" />
          </button>

          <button
            type="button"
            onClick={() => selectAccountType("company")}
            className="flex w-full items-start gap-4 rounded-xl border border-[var(--border)] bg-white p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">企業として登録</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                求人の掲載・応募管理・求職者とのチャットができます
              </p>
            </div>
            <ChevronRight className="ml-auto mt-3 h-5 w-5 shrink-0 text-[var(--muted)]" />
          </button>
        </div>
      )}

      {step === "seeker-1" && (
        <form onSubmit={handleSeekerStep1} className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep("type");
            }}
            className="flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
            登録タイプを選び直す
          </button>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">メールアドレス</span>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <PasswordField
            label="パスワード"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            hint="8文字以上・英数字の組み合わせを推奨"
          />

          <PasswordField
            label="パスワード（確認）"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
          />

          <button type="submit" className="btn-primary flex w-full items-center justify-center gap-2 py-3">
            次へ：プロフィール入力
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {step === "seeker-2" && (
        <form onSubmit={handleSeekerRegister} className="space-y-4">
          {!presetEmail && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("seeker-1");
              }}
              className="flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ChevronLeft className="h-4 w-4" />
              アカウント情報に戻る
            </button>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">氏名</span>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="山田 太郎"
              autoComplete="name"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">性別</span>
              <select className="input-field" value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
                <option value="">選択</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">年齢</span>
              <input
                type="number"
                className="input-field"
                value={form.age || ""}
                onChange={(e) => update("age", Number(e.target.value))}
                min={18}
                max={80}
                placeholder="25"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">希望エリア</span>
            <select className="input-field" value={form.area} onChange={(e) => update("area", e.target.value)} required>
              <option value="">選択</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">希望職種</span>
            <select className="input-field" value={form.desiredJobType} onChange={(e) => update("desiredJobType", e.target.value)} required>
              <option value="">選択</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">社会人経験</span>
              <select className="input-field" value={form.experience} onChange={(e) => update("experience", e.target.value)} required>
                <option value="">選択</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">希望雇用形態</span>
              <select className="input-field" value={form.employmentType} onChange={(e) => update("employmentType", e.target.value)} required>
                <option value="">選択</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>

          <p className="rounded-lg bg-[var(--surface)] px-3 py-2 text-xs leading-relaxed text-[var(--muted)]">
            登録情報は応募フォームに自動入力されます。送信前にいつでも編集できます。
          </p>

          <button type="submit" disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
            <UserPlus className="h-4 w-4" />
            {submitting ? "登録中..." : "登録して始める"}
          </button>
        </form>
      )}

      {step === "company" && (
        <form onSubmit={handleCompanyRegister} className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep("type");
            }}
            className="flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="h-4 w-4" />
            登録タイプを選び直す
          </button>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">会社名</span>
            <input
              className="input-field"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="株式会社サンプル"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">担当者名</span>
            <input
              className="input-field"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="採用 太郎"
              autoComplete="name"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">メールアドレス</span>
            <input
              type="email"
              className="input-field"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="hr@company.com"
              autoComplete="email"
              required
            />
          </label>

          <PasswordField
            label="パスワード"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            hint="8文字以上・英数字の組み合わせを推奨"
          />

          <PasswordField
            label="パスワード（確認）"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
          />

          <p className="rounded-lg bg-[var(--surface)] px-3 py-2 text-xs leading-relaxed text-[var(--muted)]">
            登録後、管理画面から求人の作成・応募管理ができます。求人は管理者承認後に公開されます。
          </p>

          <button type="submit" disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
            <Building2 className="h-4 w-4" />
            {submitting ? "登録中..." : "企業アカウントを作成"}
          </button>
        </form>
      )}
    </SeekerAuthShell>
  );
}
