"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { User, LogOut, Pencil, Briefcase } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage, AppBadge, AppCard } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import {
  AREAS,
  JOB_CATEGORIES,
  GENDERS,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  APPLICATION_STATUS_LABELS,
} from "@/lib/constants";
import { getProfile, saveProfile, clearProfile, isProfileComplete } from "@/lib/profile";
import { apiFetch } from "@/lib/api-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FormSelect, FormTextInput } from "@/components/form/FormFields";
import { profileSchema } from "@/lib/validation/schemas";
import type { Application, Job, UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [saveCount, setSaveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      let p = getProfile();
      if (!isProfileComplete(p)) {
        const res = await apiFetch("/api/profile");
        const data = await res.json();
        if (cancelled) return;
        p = data.profile ?? null;
        if (!isProfileComplete(p)) {
          router.replace("/explore");
          return;
        }
        saveProfile(p);
      }

      if (!isProfileComplete(p)) return;

      setProfile(p);

      const [appsRes, jobsRes, savesRes] = await Promise.all([
        apiFetch("/api/applications"),
        apiFetch("/api/jobs"),
        apiFetch("/api/saves"),
      ]);
      if (cancelled) return;

      const appsData = await appsRes.json();
      const jobsData = await jobsRes.json();
      const savesData = await savesRes.json();
      setApplications(appsData.applications);
      const map: Record<string, Job> = {};
      jobsData.jobs.forEach((j: Job) => {
        map[j.id] = j;
      });
      setJobs(map);
      setSaveCount(savesData.count);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    clearProfile();
    router.replace("/");
  };

  if (loading || !profile) {
    return (
      <AppPage>
        <AppHeader title="プロフィール" />
        <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[60vh]" />
        <BottomNav saveCount={0} />
      </AppPage>
    );
  }

  const profileFormValues = {
    name: profile.name,
    gender: profile.gender,
    age: profile.age,
    area: profile.area,
    desiredJobType: profile.desiredJobType,
    experience: profile.experience,
    employmentType: profile.employmentType,
    email: profile.email,
  };

  return (
    <AppPage>
      <AppHeader
        title="プロフィール"
        action={
          !editing ? (
            <button onClick={() => setEditing(true)} className="btn-ghost text-blue-600">
              <Pencil className="h-4 w-4" />
              編集
            </button>
          ) : undefined
        }
      />

      <main className="page-main page-container py-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
          <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            求職者
          </span>
        </div>

        <AppCard className="mb-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">登録情報</h3>
          {editing ? (
            <Formik
              initialValues={profileFormValues}
              validationSchema={profileSchema}
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
                <Form className="space-y-3">
                  <FormTextInput name="name" label="氏名" />
                  <FormSelect name="gender" label="性別" options={GENDERS} />
                  <FormTextInput name="age" label="年齢" type="number" />
                  <FormSelect name="area" label="エリア" options={AREAS} />
                  <FormSelect name="desiredJobType" label="希望職種" options={JOB_CATEGORIES} />
                  <FormSelect name="experience" label="経験歴" options={EXPERIENCE_LEVELS} />
                  <FormSelect name="employmentType" label="雇用形態" options={EMPLOYMENT_TYPES} />
                  <FormTextInput name="email" label="メール" type="email" />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
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
            <dl className="divide-y divide-slate-100">
              <Row label="アカウント種別" value="求職者" />
              <Row label="性別" value={profile.gender} />
              <Row label="年齢" value={`${profile.age}歳`} />
              <Row label="エリア" value={profile.area} />
              <Row label="希望職種" value={profile.desiredJobType} />
              <Row label="経験歴" value={profile.experience} />
              <Row label="雇用形態" value={profile.employmentType} />
            </dl>
          )}
        </AppCard>

        <section className="mb-6">
          <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">応募履歴</h3>
          {applications.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="応募履歴はありません"
              description="気になる求人に応募すると表示されます"
              action={<Link href="/explore" className="btn-primary rounded-full px-6">求人を探す</Link>}
            />
          ) : (
            <div className="space-y-2.5">
              {applications.map((app) => (
                <AppCard key={app.id}>
                  <p className="font-semibold text-slate-900">{jobs[app.jobId]?.title ?? app.jobId}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{jobs[app.jobId]?.company}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <AppBadge>{APPLICATION_STATUS_LABELS[app.status]}</AppBadge>
                    <Link href="/chat" className="text-xs font-semibold text-blue-600 hover:underline">
                      チャット →
                    </Link>
                  </div>
                </AppCard>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </main>

      <BottomNav saveCount={saveCount} chatCount={applications.length} />
    </AppPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 text-sm first:pt-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
