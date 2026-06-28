"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Formik } from "formik";
import { User, Pencil, Briefcase } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import BottomNav from "@/components/BottomNav";
import { AppHeader, AppPage, AppBadge, AppCard } from "@/components/ui/AppShell";
import EmptyState from "@/components/ui/EmptyState";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { getProfile, saveProfile, isProfileComplete } from "@/lib/profile";
import { apiFetch, apiFetchCached } from "@/lib/api-client";
import { fetchSeekerUnreadTotal } from "@/lib/chat-unread";
import SeekerProfileFormFields from "@/components/form/SeekerProfileFormFields";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { profileEditSchema } from "@/lib/validation/schemas";
import type { Application, UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [saveCount, setSaveCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let p = getProfile();
      const cachedComplete = isProfileComplete(p);

      if (cachedComplete) {
        setProfile(p);
        setLoading(false);
      }

      const tasks: Promise<void>[] = [];

      if (!cachedComplete) {
        tasks.push(
          apiFetch("/api/profile")
            .then((r) => r.json())
            .then((data) => {
              if (cancelled) return;
              p = data.profile ?? null;
              if (!isProfileComplete(p)) {
                router.replace("/explore");
                return;
              }
              saveProfile(p);
              setProfile(p);
              setLoading(false);
            })
        );
      }

      tasks.push(
        apiFetch("/api/applications")
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled) setApplications(data.applications ?? []);
          }),
        apiFetch("/api/saves")
          .then((r) => r.json())
          .then((data) => {
            if (!cancelled) setSaveCount(data.count ?? 0);
          }),
        fetchSeekerUnreadTotal().then((count) => {
          if (!cancelled) setUnreadChatCount(count);
        })
      );

      await Promise.all(tasks);
      if (!cancelled && !cachedComplete && !isProfileComplete(p)) return;
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
    birthday: profile.birthday,
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
                <Form className="space-y-4">
                  <SeekerProfileFormFields showEmail emailReadOnly />
                  <p className="text-xs text-slate-500">
                    メールアドレスの変更はアカウント設定から行ってください。
                  </p>
                  <div className="flex gap-2 pt-1">
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
              <Row label="氏名" value={profile.name} />
              <Row label="メールアドレス" value={profile.email} />
              <Row label="性別" value={profile.gender} />
              <Row label="生年月日" value={formatBirthdayDisplay(profile.birthday)} />
              <Row label="希望エリア" value={profile.area} />
              <Row label="希望職種" value={profile.desiredJobType} />
              <Row label="社会人経験" value={profile.experience} />
              <Row label="希望雇用形態" value={profile.employmentType} />
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
                  <p className="font-semibold text-slate-900">{app.jobTitle ?? app.jobId}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{app.companyName ?? ""}</p>
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
      </main>

      <BottomNav saveCount={saveCount} chatCount={unreadChatCount} />
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
