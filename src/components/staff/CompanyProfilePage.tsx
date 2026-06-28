"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { Building2, Pencil } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { FormTextInput, FormTextarea } from "@/components/form/FormFields";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { companyProfileSchema } from "@/lib/validation/schemas";

type CompanyProfile = {
  role: "company";
  email: string;
  name: string | null;
  companyId: string | null;
  companyName: string | null;
  companyLogoUrl: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
};

export default function CompanyProfilePage() {
  const router = useRouter();
  const { loginPath } = useStaffPanel();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/me")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(setProfile)
      .catch(() => router.replace(loginPath))
      .finally(() => setLoading(false));
  }, [router, loginPath]);

  if (loading || !profile) {
    return <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[320px]" />;
  }

  const displayName = profile.name?.trim() || profile.email.split("@")[0];

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">プロフィール</h1>
          <p className="mt-1 text-sm text-slate-500">企業担当者アカウント</p>
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="btn-ghost shrink-0 text-blue-600">
            <Pencil className="h-4 w-4" />
            編集
          </button>
        )}
      </div>

      <div className="mx-auto max-w-lg">
        <div className="card mb-5 p-6">
          <div className="mb-6 flex flex-col items-center text-center">
            {profile.companyLogoUrl ? (
              <img
                src={profile.companyLogoUrl}
                alt=""
                className="mb-3 h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-white"
              />
            ) : (
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/25">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-900">{profile.companyName ?? displayName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
            <span className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              企業担当者
            </span>
          </div>

          {saveError && (
            <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {saveError}
            </p>
          )}

          {editing ? (
            <Formik
              initialValues={{
                name: profile.name ?? "",
                companyName: profile.companyName ?? "",
                website: profile.companyWebsite ?? "",
                description: profile.companyDescription ?? "",
              }}
              validationSchema={companyProfileSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                setSaveError("");
                const res = await apiFetch("/api/admin/me", {
                  method: "PATCH",
                  body: JSON.stringify(values),
                });
                const data = await res.json();
                if (res.ok) {
                  setProfile(data);
                  setEditing(false);
                } else {
                  setSaveError(typeof data.error === "string" ? data.error : "保存に失敗しました");
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, submitForm }) => (
                <Form className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">担当者情報</h3>
                  <FormTextInput name="name" label="担当者名" placeholder="採用 太郎" autoComplete="name" />
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">メールアドレス</span>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="input-field bg-slate-50 text-slate-500"
                    />
                  </label>

                  <h3 className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">企業情報</h3>
                  <FormTextInput name="companyName" label="会社名" placeholder="株式会社サンプル" />
                  <FormTextInput name="website" label="企業HP URL" placeholder="https://example.com" />
                  <FormTextarea
                    name="description"
                    label="企業紹介"
                    rows={4}
                    placeholder="事業内容や採用方針など"
                  />

                  <p className="text-xs text-slate-500">
                    メールアドレスの変更はアカウント設定から行ってください。
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSaveError("");
                        setEditing(false);
                      }}
                      className="btn-secondary flex-1 py-2.5 text-sm"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={() => submitForm()}
                      disabled={isSubmitting}
                      className="btn-primary flex-1 py-2.5 text-sm"
                    >
                      {isSubmitting ? "保存中..." : "保存する"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">担当者情報</h3>
              <dl className="mb-6 divide-y divide-slate-100">
                <ProfileRow label="担当者名" value={profile.name ?? "—"} />
                <ProfileRow label="メールアドレス" value={profile.email} />
                <ProfileRow label="アカウント種別" value="企業担当者" />
              </dl>

              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">企業情報</h3>
              <dl className="divide-y divide-slate-100">
                <ProfileRow label="会社名" value={profile.companyName ?? "—"} />
                <ProfileRow label="企業HP" value={profile.companyWebsite ?? "—"} />
                <ProfileRow label="企業紹介" value={profile.companyDescription?.trim() || "—"} multiline />
              </dl>
            </>
          )}
        </div>

        <div className="card mb-5 p-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">企業アカウントについて</h3>
          <p className="text-sm leading-relaxed text-slate-500">
            求人の投稿・応募管理・求職者とのチャットが利用できます。投稿した求人は管理者承認後に公開されます。
          </p>
        </div>

      </div>
    </>
  );
}

function ProfileRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className={`text-right font-medium text-slate-800 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
