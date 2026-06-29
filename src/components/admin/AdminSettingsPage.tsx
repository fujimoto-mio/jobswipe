"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  KeyRound,
  Shield,
  Upload,
  X,
} from "lucide-react";
import StaffAvatar from "@/components/chat/StaffAvatar";
import { FormPassword, FormTextInput } from "@/components/form/FormFields";
import SettingsFormModal from "@/components/seeker/SettingsFormModal";
import { PageLoading, ButtonSpinner } from "@/components/ui/LoadingSpinner";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { mapUserFacingError } from "@/lib/auth/errors";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/upload-client";
import { passwordChangeSchema, staffProfileSchema } from "@/lib/validation/schemas";

type AdminAccount = {
  role: "admin";
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

const ROLE_LABEL = "システム管理者";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="company-profile-info-row">
      <div className="company-profile-info-label">{label}</div>
      <div className="company-profile-info-value">{value}</div>
    </div>
  );
}

function SettingsLinkItem({
  href,
  label,
  description,
  external,
}: {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
}) {
  const className =
    "company-dashboard-action-row transition hover:bg-slate-50/80";

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="company-dashboard-action-title">{label}</p>
        {description && <p className="company-dashboard-action-desc">{description}</p>}
      </div>
      {external && <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />}
    </>
  );

  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} className={className}>
        {content}
      </Link>
    </li>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { loginPath, basePath } = useStaffPanel();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        if (data.role !== "admin") throw new Error("not admin");
        setAccount(data);
      })
      .catch(() => router.replace(loginPath))
      .finally(() => setLoading(false));
  }, [router, loginPath]);

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarUploadError("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarUploadError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarUploadError("画像ファイル（JPEG / PNG / WebP）を選択してください");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError("アバターは2MB以下にしてください");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (loading || !account) {
    return (
      <div className="company-dashboard-page">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">設定</h1>
          <p className="mt-1 text-sm text-slate-500">管理者アカウントとプラットフォーム設定</p>
        </div>
        <PageLoading message="設定を読み込み中..." minHeight="min-h-[320px]" />
      </div>
    );
  }

  const displayName = account.name?.trim() || account.email.split("@")[0];

  return (
    <div className="company-dashboard-page staff-ui">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">設定</h1>
        <p className="mt-1 text-sm text-slate-500">管理者アカウントとプラットフォーム設定</p>
      </div>

      <div className="company-dashboard-sections">
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">アカウント</h2>
          </div>
          <div className="company-profile-section-body">
            {(saveError || saveMessage) && (
              <p
                className={`mb-4 rounded-xl border px-3.5 py-2.5 text-sm ${
                  saveError
                    ? "border-red-100 bg-red-50 text-red-600"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {saveError || saveMessage}
              </p>
            )}

            <Formik
              initialValues={{ name: account.name ?? "" }}
              validationSchema={staffProfileSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                setSaveError("");
                setSaveMessage("");
                setAvatarUploadError("");
                try {
                  let avatarUrl: string | null | undefined;
                  if (avatarFile) {
                    avatarUrl = await uploadFile(avatarFile, "staff-avatar");
                  }

                  const payload: Record<string, string | null> = {
                    name: values.name,
                  };
                  if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl;

                  const res = await apiFetch("/api/admin/me", {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setAccount(data);
                    clearAvatarSelection();
                    setSaveMessage("アカウント情報を保存しました");
                  } else {
                    setSaveError(typeof data.error === "string" ? data.error : "保存に失敗しました");
                  }
                } catch (error) {
                  const message = error instanceof Error ? error.message : "アップロードに失敗しました";
                  setAvatarUploadError(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover shadow-md"
                      />
                    ) : (
                      <StaffAvatar
                        name={displayName}
                        avatarUrl={account.avatarUrl}
                        size="xl"
                        className="!h-20 !w-20 shrink-0 rounded-full border-4 border-white shadow-md"
                      />
                    )}
                    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        写真を変更
                      </button>
                      {(avatarPreview || account.avatarUrl) && (
                        <button
                          type="button"
                          onClick={clearAvatarSelection}
                          className="btn-ghost inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFile}
                    />
                  </div>
                  {avatarUploadError && (
                    <p className="text-center text-xs text-red-600 sm:text-left">{avatarUploadError}</p>
                  )}

                  <div className="max-w-lg space-y-4">
                    <FormTextInput name="name" label="担当者名" placeholder="管理 太郎" autoComplete="name" />
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">メールアドレス</span>
                      <input
                        type="email"
                        value={account.email}
                        readOnly
                        className="input-field bg-slate-50 text-sm text-slate-500"
                      />
                    </label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary px-5 py-2.5 text-sm">
                    {isSubmitting ? "保存中..." : "保存する"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">セキュリティ</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            <ul className="company-dashboard-action-list">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordError("");
                    setPasswordMessage("");
                    setPasswordOpen(true);
                  }}
                  className="company-dashboard-action-row w-full text-left transition hover:bg-slate-50/80"
                >
                  <div className="company-dashboard-action-icon">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="company-dashboard-action-title">パスワード</p>
                    <p className="company-dashboard-action-desc">ログインパスワードを変更</p>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">管理者情報</h2>
          </div>
          <div className="company-profile-section-body">
            <div className="company-profile-info-table">
              <InfoRow label="アカウント種別" value={ROLE_LABEL} />
              <InfoRow label="ログインID" value={account.email} />
            </div>
            <p className="company-profile-text mt-4">
              求人の審査、企業・求職者の管理、プラットフォームKPIの確認など、システム運用機能にアクセスできます。
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Shield className="h-3.5 w-3.5" />
              {ROLE_LABEL}
            </span>
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">サポート</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            <ul className="company-dashboard-action-list">
              <SettingsLinkItem
                href={`mailto:${SUPPORT_EMAIL}`}
                label="お問い合わせ"
                description={SUPPORT_EMAIL}
                external
              />
              <SettingsLinkItem href="/terms" label="利用規約" />
              <SettingsLinkItem href="/privacy" label="プライバシーポリシー" />
            </ul>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {passwordOpen && (
          <SettingsFormModal
            title="パスワードを変更"
            onClose={() => {
              setPasswordOpen(false);
              setPasswordError("");
              setPasswordMessage("");
            }}
          >
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={passwordChangeSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setPasswordError("");
                setPasswordMessage("");
                const supabase = createSupabaseBrowserClient();
                if (!supabase) {
                  setPasswordError("認証サービスが設定されていません");
                  setSubmitting(false);
                  return;
                }

                const { error } = await supabase.auth.updateUser({ password: values.password });
                if (error) {
                  setPasswordError(mapUserFacingError(error.message));
                  setSubmitting(false);
                  return;
                }

                resetForm();
                setPasswordMessage("パスワードを変更しました");
                setTimeout(() => setPasswordOpen(false), 1200);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <FormPassword name="password" label="新しいパスワード" autoComplete="new-password" />
                  <FormPassword
                    name="confirmPassword"
                    label="新しいパスワード（確認）"
                    autoComplete="new-password"
                  />
                  {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                  {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex w-full items-center justify-center gap-2"
                  >
                    {isSubmitting && <ButtonSpinner />}
                    {isSubmitting ? "保存中..." : "保存する"}
                  </button>
                </Form>
              )}
            </Formik>
          </SettingsFormModal>
        )}
      </AnimatePresence>
    </div>
  );
}
