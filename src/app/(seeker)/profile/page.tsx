"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { Briefcase, ChevronRight, ExternalLink, FileText, Pencil, Search, Settings } from "lucide-react";
import LoadingSpinner, { PageLoading, ButtonSpinner } from "@/components/ui/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { getProfile, saveProfile, isProfileComplete } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";
import SeekerProfileFormFields from "@/components/form/SeekerProfileFormFields";
import { formatBirthdayDisplay } from "@/lib/birthday";
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
    introSentence: p.introSentence ?? "",
    summary: p.summary ?? "",
    resumeUrl: p.resumeUrl ?? "",
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
    name: profile.name,
    gender: profile.gender,
    birthday: profile.birthday,
    area: profile.area,
    desiredJobType: profile.desiredJobType,
    experience: profile.experience,
    employmentType: profile.employmentType,
    email: profile.email,
    introSentence: profile.introSentence,
    summary: profile.summary,
    resumeUrl: profile.resumeUrl,
  };

  const profileFields: { label: string; value: string; span?: 2 }[] = [
    { label: "性別", value: profile.gender },
    { label: "生年月日", value: formatBirthdayDisplay(profile.birthday) },
    { label: "希望エリア", value: profile.area },
    { label: "希望職種", value: profile.desiredJobType },
    { label: "社会人経験", value: profile.experience },
    { label: "希望雇用形態", value: profile.employmentType },
    { label: "メール", value: profile.email, span: 2 },
  ];

  return (
    <AppPage>
      <AppHeader title="プロフィール" onBack={() => router.push("/explore")} />

      <main className="min-h-0 flex-1 overflow-y-auto pb-[4.5rem]">
        {/* Hero */}
        <div className="flex flex-col items-center bg-white px-4 pb-5 pt-6">
          <ProfileAvatar name={profile.name} />
          <h2 className="mt-4 text-lg font-bold text-slate-900">{profile.name}</h2>
          <p className="mt-0.5 max-w-[260px] truncate text-sm text-slate-500">{profile.email}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 border-y border-slate-100 bg-white py-4">
          <StatItem label="保存" value={saveCount} />
          <StatItem label="応募" value={applications.length} />
          <StatItem label="未読" value={unreadChatCount} />
        </div>

        {/* Career profile */}
        {!editing && (
          <section className="mt-2 bg-white">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">プロフィール</p>
            </div>
            <div className="space-y-4 px-4 py-4">
              <div>
                <p className="text-xs font-medium text-slate-500">一言紹介</p>
                <p
                  className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${
                    profile.introSentence.trim() ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {profile.introSentence.trim() || "未設定"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">サマリー</p>
                <p
                  className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${
                    profile.summary.trim() ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {profile.summary.trim() || "未設定"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">履歴書</p>
                {profile.resumeUrl.trim() ? (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 transition active:bg-slate-100"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
                      {profile.resumeUrl}
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">未設定</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Profile info / edit */}
        <section className="mt-2 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">登録情報</p>
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

          {editing ? (
            <div className="px-4 py-4">
              <Formik
                initialValues={profileFormValues}
                validationSchema={profileEditSchema}
                enableReinitialize
                onSubmit={async (values, { setSubmitting }) => {
                  const res = await apiFetch("/api/profile", {
                    method: "PATCH",
                    body: JSON.stringify(values),
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
                {({ isSubmitting, submitForm }) => (
                  <Form className="profile-form">
                    <SeekerProfileFormFields showEmail showCareerProfile emailReadOnly />
                    <p className="profile-form-note text-xs text-slate-500">
                      メールアドレスの変更はアカウント設定から行ってください。
                    </p>
                    <button
                      type="button"
                      onClick={() => submitForm()}
                      disabled={isSubmitting}
                      className="profile-form-submit btn-primary flex w-full items-center justify-center gap-2"
                    >
                      {isSubmitting && <ButtonSpinner />}
                      {isSubmitting ? "保存中..." : "保存する"}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <div className="profile-info-grid grid grid-cols-2 gap-px bg-slate-100">
              {profileFields.map(({ label, value, span }) => (
                <div
                  key={label}
                  className={`profile-info-cell bg-white px-4 py-3.5 ${span === 2 ? "col-span-2" : ""}`}
                >
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="mt-2 bg-white">
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
        <section className="mt-2 bg-white">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">応募履歴</p>
          </div>

          {applicationsLoading ? (
            <div className="flex justify-center px-4 py-10">
              <LoadingSpinner size="md" message="読み込み中..." />
            </div>
          ) : applications.length === 0 ? (
            <div className="px-4 py-8">
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
          )}
        </section>
      </main>

      <BottomNav saveCount={saveCount} chatCount={unreadChatCount} />
    </AppPage>
  );
}
