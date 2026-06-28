"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { Briefcase, ChevronRight, Pencil, Search, Settings } from "lucide-react";
import LoadingSpinner, { PageLoading, ButtonSpinner } from "@/components/ui/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { getProfile, saveProfile, isProfileComplete } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";
import SeekerProfileFormFields from "@/components/form/SeekerProfileFormFields";
import { SeekerProfileCareerView } from "@/components/seeker/SeekerProfileSections";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { calcProfileCompletion, normalizeSeekerProfileFields } from "@/lib/profile-fields";
import { formatDateJST } from "@/lib/datetime";
import { profileEditSchema } from "@/lib/validation/schemas";
import type { Application, UserProfile } from "@/lib/types";

function ProfileAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-500/25 ring-4 ring-white">
      {name.trim().charAt(0) || "?"}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  scheduling: "bg-blue-50 text-blue-700",
  interview_done: "bg-violet-50 text-violet-700",
  hired: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
};

function normalizeProfile(p: UserProfile | null): UserProfile | null {
  if (!p) return null;
  return {
    ...p,
    ...normalizeSeekerProfileFields(p),
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [saveCount, setSaveCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = getProfile();
      const cachedComplete = isProfileComplete(cached);

      if (cachedComplete) {
        setProfile(normalizeProfile(cached));
        setLoading(false);
      }

      const tasks: Promise<void>[] = [
        apiFetch("/api/profile")
          .then((r) => r.json())
          .then((data) => {
            if (cancelled) return;
            const fresh = normalizeProfile(data.profile ?? null);
            if (!isProfileComplete(fresh)) {
              if (!cachedComplete) router.replace("/explore");
              return;
            }
            saveProfile(fresh!);
            setProfile(fresh);
            setLoading(false);
          }),
        apiFetch("/api/applications")
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled) setApplications(data.applications ?? []);
          })
          .finally(() => {
            if (!cancelled) setApplicationsLoading(false);
          }),
        apiFetch("/api/saves")
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled) setSaveCount(data.count ?? 0);
          }),
        fetchSeekerUnreadTotal().then((count) => {
          if (!cancelled) setUnreadChatCount(count);
        }),
      ];

      await Promise.all(tasks);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !profile) {
    return (
      <AppPage>
        <AppHeader title="プロフィール" onBack={() => router.push("/explore")} />
        <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[60vh]" />
        <BottomNav saveCount={0} chatCount={0} />
      </AppPage>
    );
  }

  const profileFormValues = {
    ...profile,
  };

  const profileCompletion = calcProfileCompletion(profile);

  const registrationFields: { label: string; value: string; span?: 2 }[] = [
    { label: "性別", value: profile.gender },
    { label: "生年月日", value: formatBirthdayDisplay(profile.birthday) },
    { label: "最終学歴", value: profile.education || "未設定" },
    { label: "メール", value: profile.email, span: 2 },
  ];

  return (
    <AppPage>
      <AppHeader title="プロフィール" onBack={() => router.push("/explore")} />

      <main className="profile-page min-h-0 flex-1 overflow-y-auto pb-[4.5rem]">
        <div className="flex items-center justify-end bg-white px-4 py-2.5">
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost text-xs text-slate-500"
            >
              キャンセル
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-ghost flex items-center gap-1.5 text-xs font-semibold text-slate-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              編集
            </button>
          )}
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center bg-white px-4 pb-5 pt-6">
          <ProfileAvatar name={profile.name} />
          <h2 className="mt-4 text-lg font-bold text-slate-900">{profile.name}</h2>
          <p className="mt-0.5 max-w-[260px] truncate text-sm text-slate-500">{profile.email}</p>
          {!editing && (
            <div className="mt-4 w-full max-w-xs">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>プロフィール完成度</span>
                <span className="font-semibold text-slate-700">{profileCompletion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#fe2c55] transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 border-y border-slate-100 bg-white py-4">
          <StatItem label="保存" value={saveCount} />
          <StatItem label="応募" value={applications.length} />
          <StatItem label="未読" value={unreadChatCount} />
        </div>

        {!editing && <SeekerProfileCareerView profile={profile} />}

        {/* Profile info / edit */}
        <section className="profile-section">
          <div className="profile-section-header">
            <p className="profile-section-title">登録情報</p>
          </div>

          {editing ? (
            <div className="profile-section-content">
              <Formik
                initialValues={profileFormValues}
                validationSchema={profileEditSchema}
                enableReinitialize
                onSubmit={async (values, { setSubmitting }) => {
                  const payload = {
                    ...values,
                    workHistory: values.workHistory.filter(
                      (entry) => entry.company.trim() || entry.role.trim()
                    ),
                    skills: values.skills.filter((skill) => skill.name.trim()),
                  };
                  const res = await apiFetch("/api/profile", {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    saveProfile(data.profile);
                    setProfile(data.profile);
                    setEditing(false);
                  }
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, submitForm, resetForm }) => (
                  <Form className="profile-form">
                    <SeekerProfileFormFields showEmail showCareerProfile emailReadOnly />
                    <p className="profile-form-note text-xs text-slate-500">
                      メールアドレスの変更はアカウント設定から行ってください。
                    </p>
                    <div className="profile-form-actions">
                      <button
                        type="button"
                        onClick={() => submitForm()}
                        disabled={isSubmitting}
                        className="profile-form-submit btn-primary flex w-full items-center justify-center gap-2"
                      >
                        {isSubmitting && <ButtonSpinner />}
                        {isSubmitting ? "保存中..." : "保存する"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setEditing(false);
                        }}
                        disabled={isSubmitting}
                        className="profile-form-submit btn-secondary flex w-full items-center justify-center"
                      >
                        キャンセル
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <div className="profile-section-content profile-section-content--flush">
              <div className="profile-info-list">
              {registrationFields.map(({ label, value, span }) =>
                span === 2 ? (
                  <div key={label} className="px-4 pb-4 pt-2">
                    <p className="profile-field-label">{label}</p>
                    <p className="profile-field-value truncate">{value}</p>
                  </div>
                ) : (
                  <div key={label} className="profile-info-row">
                    <p className="profile-field-label">{label}</p>
                    <p className="profile-info-value truncate">{value || "未設定"}</p>
                  </div>
                )
              )}
              </div>
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="profile-section">
          <ul className="divide-y divide-slate-100">
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  <Settings className="h-4 w-4 text-slate-600" />
                </div>
                <span className="flex-1 text-sm font-semibold text-slate-900">設定</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            </li>
          </ul>
        </section>

        {/* Applications */}
        <section className="profile-section">
          <div className="profile-section-header">
            <p className="profile-section-title">応募履歴</p>
          </div>

          {applicationsLoading ? (
            <div className="profile-section-content flex justify-center py-6">
              <LoadingSpinner size="md" message="読み込み中..." />
            </div>
          ) : applications.length === 0 ? (
            <div className="profile-section-content py-4">
              <EmptyState
                icon={Briefcase}
                title="応募履歴はありません"
                description="気になる求人に応募すると表示されます"
                action={
                  <Link href="/explore" className="btn-primary flex items-center gap-2 px-8">
                    <Search className="h-4 w-4" />
                    求人を探す
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="profile-section-content profile-section-content--flush">
            <ul className="divide-y divide-slate-100">
              {applications.map((app) => {
                const company = app.companyName ?? "企業";
                const statusClass = STATUS_COLORS[app.status] ?? "bg-slate-100 text-slate-600";

                return (
                  <li key={app.id}>
                    <Link
                      href={`/chat?applicationId=${app.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition active:bg-slate-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
                        {company.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {app.jobTitle ?? "求人"}
                        </p>
                        <p className="truncate text-xs text-slate-500">{company}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                            {APPLICATION_STATUS_LABELS[app.status]}
                          </span>
                          {app.createdAt && (
                            <span className="text-[10px] text-slate-400">
                              {formatDateJST(app.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            </div>
          )}
        </section>
      </main>

      <BottomNav saveCount={saveCount} chatCount={unreadChatCount} />
    </AppPage>
  );
}
