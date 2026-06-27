"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Pencil, Check, X, Briefcase } from "lucide-react";
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
import type { Application, Job, UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UserProfile | null>(null);
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
      setForm(p);

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

  const handleSave = () => {
    if (!form) return;
    apiFetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(form),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        saveProfile(data.profile);
        setProfile(data.profile);
        setForm(data.profile);
        setEditing(false);
      }
    });
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    clearProfile();
    router.replace("/");
  };

  if (loading || !profile || !form) {
    return (
      <AppPage>
        <AppHeader title="プロフィール" />
        <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[60vh]" />
        <BottomNav saveCount={0} />
      </AppPage>
    );
  }

  const update = (key: keyof UserProfile, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
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
          ) : (
            <div className="flex gap-1">
              <button onClick={() => { setForm(profile); setEditing(false); }} className="btn-ghost">
                <X className="h-4 w-4" />
              </button>
              <button onClick={handleSave} className="btn-ghost text-blue-600">
                <Check className="h-4 w-4" />
              </button>
            </div>
          )
        }
      />

      <main className="page-main page-container py-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{profile.email}</p>
        </div>

        <AppCard className="mb-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">登録情報</h3>
          {editing ? (
            <div className="space-y-3">
              <Field label="氏名" value={form.name} onChange={(v) => update("name", v)} />
              <Field label="性別" value={form.gender} onChange={(v) => update("gender", v)} options={[...GENDERS]} />
              <Field label="年齢" value={String(form.age)} onChange={(v) => update("age", Number(v))} type="number" />
              <Field label="エリア" value={form.area} onChange={(v) => update("area", v)} options={[...AREAS]} />
              <Field label="希望職種" value={form.desiredJobType} onChange={(v) => update("desiredJobType", v)} options={[...JOB_CATEGORIES]} />
              <Field label="経験歴" value={form.experience} onChange={(v) => update("experience", v)} options={[...EXPERIENCE_LEVELS]} />
              <Field label="雇用形態" value={form.employmentType} onChange={(v) => update("employmentType", v)} options={[...EMPLOYMENT_TYPES]} />
              <Field label="メール" value={form.email} onChange={(v) => update("email", v)} type="email" />
            </div>
          ) : (
            <dl className="divide-y divide-slate-100">
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

function Field({
  label,
  value,
  onChange,
  options,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {options ? (
        <select className="input-field" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input type={type} className="input-field" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
