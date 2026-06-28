"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { Building2, Pencil, Shield } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { FormTextInput } from "@/components/form/FormFields";
import { useStaffPanel } from "@/components/staff/StaffPanelContext";
import { apiFetch } from "@/lib/api-client";
import { staffProfileSchema } from "@/lib/validation/schemas";

type StaffProfile = {
  role: "admin" | "company";
  email: string;
  name: string | null;
  companyId: string | null;
  companyName: string | null;
};

const ROLE_LABELS = {
  admin: "システム管理者",
  company: "企業担当者",
} as const;

export default function StaffProfilePage() {
  const router = useRouter();
  const { role, loginPath } = useStaffPanel();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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
  const RoleIcon = role === "admin" ? Shield : Building2;

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">プロフィール</h1>
          <p className="mt-1 text-sm text-slate-500">{ROLE_LABELS[role]}アカウント</p>
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
            <div
              className={`mb-3 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ${
                role === "admin"
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/25"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/25"
              }`}
            >
              <RoleIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
            <span className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {ROLE_LABELS[role]}
            </span>
          </div>

          {editing ? (
            <Formik
              initialValues={{ name: profile.name ?? "" }}
              validationSchema={staffProfileSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                const res = await apiFetch("/api/admin/me", {
                  method: "PATCH",
                  body: JSON.stringify(values),
                });
                if (res.ok) {
                  const data = await res.json();
                  setProfile(data);
                  setEditing(false);
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, submitForm }) => (
                <Form className="space-y-4">
                  <FormTextInput name="name" label="担当者名" placeholder="採用 太郎" autoComplete="name" />
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1 py-2.5 text-sm">
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
            <dl className="divide-y divide-slate-100">
              <ProfileRow label="担当者名" value={profile.name ?? "—"} />
              <ProfileRow label="メールアドレス" value={profile.email} />
              <ProfileRow label="アカウント種別" value={ROLE_LABELS[role]} />
              {role === "company" && profile.companyName && (
                <ProfileRow label="所属企業" value={profile.companyName} />
              )}
            </dl>
          )}
        </div>

        {role === "admin" && (
          <div className="card mb-5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">管理者について</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              求人の審査・プラットフォーム全体の応募モニタリングなど、システム運用機能にアクセスできます。
            </p>
          </div>
        )}

        {role === "company" && (
          <div className="card mb-5 p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">企業アカウントについて</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              求人の投稿・応募管理・求職者とのチャットが利用できます。投稿した求人は管理者承認後に公開されます。
            </p>
          </div>
        )}

      </div>
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
