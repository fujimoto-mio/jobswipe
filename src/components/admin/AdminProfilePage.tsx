"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { Pencil, Shield, Upload, X } from "lucide-react";
import StaffAvatar from "@/components/chat/StaffAvatar";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { FormTextInput } from "@/components/form/FormFields";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-client";
import { staffProfileSchema } from "@/lib/validation/schemas";

type AdminProfile = {
  role: "admin";
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

const ROLE_LABEL = "システム管理者";

const DEFAULT_ADMIN_BANNER =
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=80";

function adminBannerStyle(): CSSProperties {
  return {
    backgroundImage: `linear-gradient(135deg, rgb(67 56 202 / 0.72), rgb(37 99 235 / 0.45)), url("${DEFAULT_ADMIN_BANNER}")`,
  };
}

function ProfileInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="company-profile-info-row">
      <div className="company-profile-info-label">{label}</div>
      <div className="company-profile-info-value">{value}</div>
    </div>
  );
}

export default function AdminProfilePage() {
  const router = useRouter();
  const { loginPath } = useStaffPanel();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data) => {
        if (data.role !== "admin") throw new Error("not admin");
        setProfile(data);
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

  const startEditing = () => {
    clearAvatarSelection();
    setSaveError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    clearAvatarSelection();
    setSaveError("");
    setEditing(false);
  };

  if (loading || !profile) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">プロフィール</h1>
          <p className="mt-1 text-sm text-slate-500">管理者アカウント情報</p>
        </div>
        <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[320px]" />
      </>
    );
  }

  const displayName = profile.name?.trim() || profile.email.split("@")[0];

  return (
    <div className="company-profile-page staff-ui">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">プロフィール</h1>
        <p className="mt-1 text-sm text-slate-500">
          {editing ? "管理者アカウントの編集" : "管理者アカウント情報"}
        </p>
      </div>

      {saveError && (
        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
          {saveError}
        </p>
      )}

      {editing ? (
        <Formik
          initialValues={{ name: profile.name ?? "" }}
          validationSchema={staffProfileSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            setSaveError("");
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
                setProfile(data);
                clearAvatarSelection();
                setEditing(false);
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
          {({ values, isSubmitting, submitForm }) => (
            <Form>
              <div className="company-profile-edit-layout">
                <main className="space-y-4">
                  <section className="company-profile-hero company-profile-section">
                    <div className="company-profile-hero-banner" style={adminBannerStyle()} aria-hidden />
                    <div className="company-profile-hero-body">
                      <div className="company-profile-hero-logo-wrap">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt=""
                            className="company-profile-hero-logo rounded-full object-cover"
                          />
                        ) : (
                          <StaffAvatar
                            name={values.name || displayName}
                            avatarUrl={profile.avatarUrl}
                            size="xl"
                            className="company-profile-hero-logo !h-20 !w-20 rounded-full"
                          />
                        )}
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            写真を変更
                          </button>
                          {(avatarPreview || profile.avatarUrl) && (
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
                        {avatarUploadError && (
                          <p className="mt-2 text-center text-xs text-red-600">{avatarUploadError}</p>
                        )}
                      </div>
                      <div className="company-profile-hero-meta company-profile-hero-meta--edit">
                        <FormTextInput name="name" label="担当者名" placeholder="管理 太郎" autoComplete="name" />
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-medium text-slate-700">メールアドレス</span>
                          <input
                            type="email"
                            value={profile.email}
                            readOnly
                            className="input-field bg-slate-50 text-sm text-slate-500"
                          />
                        </label>
                      </div>
                    </div>
                  </section>

                  <section className="company-profile-section company-profile-edit-section">
                    <div className="company-profile-section-header">
                      <h2 className="company-profile-section-title">アカウント情報</h2>
                    </div>
                    <div className="company-profile-section-body">
                      <div className="company-profile-info-table">
                        <ProfileInfoRow label="アカウント種別" value={ROLE_LABEL} />
                      </div>
                    </div>
                  </section>
                </main>

                <aside className="company-profile-sidebar">
                  <div className="company-profile-side-card company-profile-edit-actions">
                    <button
                      type="button"
                      onClick={() => submitForm()}
                      disabled={isSubmitting}
                      className="btn-primary w-full py-2.5 text-sm"
                    >
                      {isSubmitting ? "保存中..." : "保存する"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="btn-secondary mt-2 w-full py-2.5 text-sm"
                    >
                      キャンセル
                    </button>
                  </div>
                </aside>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <>
          <section className="company-profile-hero" aria-label="管理者ヘッダー">
            <div className="company-profile-hero-banner" style={adminBannerStyle()} aria-hidden />
            <div className="company-profile-hero-body">
              <StaffAvatar
                name={displayName}
                avatarUrl={profile.avatarUrl}
                size="xl"
                className="company-profile-hero-logo !h-20 !w-20 shrink-0 rounded-full border-4 border-white shadow-md"
              />
              <div className="company-profile-hero-meta">
                <h2 className="company-profile-hero-title">{displayName}</h2>
                <p className="text-sm text-slate-500">{profile.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <Shield className="h-3.5 w-3.5" />
                  {ROLE_LABEL}
                </span>
              </div>
              <div className="company-profile-hero-actions">
                <button type="button" onClick={startEditing} className="btn-ghost shrink-0 text-blue-600">
                  <Pencil className="h-4 w-4" />
                  編集
                </button>
              </div>
            </div>
          </section>

          <div className="company-profile-layout">
            <main>
              <section className="company-profile-section">
                <div className="company-profile-section-header">
                  <h2 className="company-profile-section-title">担当者情報</h2>
                </div>
                <div className="company-profile-section-body">
                  <div className="company-profile-info-table">
                    <ProfileInfoRow label="担当者名" value={profile.name?.trim() || "未設定"} />
                    <ProfileInfoRow label="メールアドレス" value={profile.email} />
                    <ProfileInfoRow label="アカウント種別" value={ROLE_LABEL} />
                  </div>
                </div>
              </section>

              <section className="company-profile-section">
                <div className="company-profile-section-header">
                  <h2 className="company-profile-section-title">管理者について</h2>
                </div>
                <div className="company-profile-section-body">
                  <p className="company-profile-text">
                    求人の審査、企業・求職者の管理、プラットフォームKPIの確認など、システム運用機能にアクセスできます。
                  </p>
                </div>
              </section>
            </main>

            <aside className="company-profile-sidebar">
              <div className="company-profile-side-card">
                <h3 className="company-profile-side-card-title">プロフィール</h3>
                <div className="company-profile-staff-row">
                  <StaffAvatar name={displayName} avatarUrl={profile.avatarUrl} size="lg" />
                  <div className="company-profile-staff-meta">
                    <p className="company-profile-staff-name">{displayName}</p>
                    <p className="company-profile-staff-note">{ROLE_LABEL}</p>
                  </div>
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">メール</dt>
                    <dd className="mt-0.5 break-all font-medium text-slate-800">{profile.email}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
