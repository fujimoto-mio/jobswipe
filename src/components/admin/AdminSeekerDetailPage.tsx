"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Ban, Briefcase, FileText, Heart, RotateCcw } from "lucide-react";
import { AdminSeekerProfileView } from "@/components/admin/AdminSeekerProfileView";
import SeekerSuspendConfirmModal from "@/components/admin/SeekerSuspendConfirmModal";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { APPLICATION_STATUS_LABELS, SEEKER_STATUS_BADGE_CLASS, SEEKER_STATUS_LABELS, type SeekerStatus } from "@/lib/constants";
import { formatBirthdayDisplay } from "@/lib/birthday";
import { formatDateJST } from "@/lib/datetime";
import { apiFetch } from "@/lib/api-client";
import type { ApplicationStatus, UserProfile } from "@/lib/types";

type SeekerDetail = {
  profile: UserProfile & { id: string };
  status: SeekerStatus;
  createdAt: string;
  applicationCount: number;
  savedCount: number;
  recentApplications: {
    id: string;
    status: string;
    createdAt: string;
    jobTitle: string;
    companyName: string;
    jobId: string;
  }[];
};

const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: "badge-amber",
  scheduling: "badge-blue",
  interview_done: "bg-violet-100 text-violet-700",
  hired: "badge-green",
  rejected: "badge-red",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="company-profile-info-row">
      <div className="company-profile-info-label">{label}</div>
      <div className="company-profile-info-value">
        {value?.trim() ? value : <span className="text-slate-400">未設定</span>}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof FileText;
}) {
  return (
    <div className="company-dashboard-metric">
      <div className="company-dashboard-metric-icon">
        <Icon className="h-4 w-4" />
      </div>
      <p className="company-dashboard-metric-value">{value}</p>
      <p className="company-dashboard-metric-label">{label}</p>
    </div>
  );
}

export default function AdminSeekerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seekerId = params.id as string;
  const [detail, setDetail] = useState<SeekerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<"suspend" | "restore" | null>(null);

  const loadDetail = useCallback(async () => {
    const res = await apiFetch(`/api/admin/seekers/${encodeURIComponent(seekerId)}`);
    if (!res.ok) throw new Error("not found");
    return res.json() as Promise<SeekerDetail>;
  }, [seekerId]);

  useEffect(() => {
    loadDetail()
      .then(setDetail)
      .catch(() => router.replace("/admin/seekers"))
      .finally(() => setLoading(false));
  }, [loadDetail, router]);

  const updateStatus = async (status: SeekerStatus) => {
    const res = await apiFetch(`/api/admin/seekers/${encodeURIComponent(seekerId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("update failed");
    const data = await res.json();
    setDetail(data);
  };

  if (loading || !detail) {
    return (
      <div className="company-dashboard-page">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">求職者詳細</h1>
        </div>
        <PageLoading message="プロフィールを読み込み中..." minHeight="min-h-[320px]" />
      </div>
    );
  }

  const { profile } = detail;
  const displayName = profile.name?.trim() || profile.email.split("@")[0];

  return (
    <div className="company-dashboard-page">
      <div className="mb-6">
        <Link
          href="/admin/seekers"
          className="btn-ghost mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          求職者一覧
        </Link>

        <section className="company-profile-section application-seeker-hero">
          <div className="company-profile-section-body flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            <div className="application-seeker-avatar shrink-0">{displayName.charAt(0) || "?"}</div>
            <div className="mt-4 min-w-0 flex-1 sm:mt-0 sm:ml-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="application-seeker-name mt-0 text-xl sm:text-2xl">{displayName}</h1>
                  <p className="application-seeker-email max-w-none text-sm text-slate-500">
                    {profile.email}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {profile.area || "—"} · {profile.desiredJobType || "—"}
                  </p>
                  <div className="application-seeker-meta mt-3 justify-center sm:justify-start">
                    <span className={`badge ${SEEKER_STATUS_BADGE_CLASS[detail.status]}`}>
                      {SEEKER_STATUS_LABELS[detail.status]}
                    </span>
                    <span className="application-seeker-applied-date">
                      登録日: {formatDateJST(detail.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 justify-center sm:justify-end">
                  {detail.status === "Suspended" ? (
                    <button
                      type="button"
                      onClick={() => setPendingAction("restore")}
                      className="staff-ui btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      復元
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingAction("suspend")}
                      className="staff-ui inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Ban className="h-4 w-4" />
                      停止
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="company-dashboard-sections">
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">アクティビティ</h2>
          </div>
          <div className="company-profile-section-body">
            <div className="company-dashboard-metric-grid">
              <MetricCard label="応募数" value={detail.applicationCount} icon={FileText} />
              <MetricCard label="保存数" value={detail.savedCount} icon={Heart} />
            </div>
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">登録情報</h2>
          </div>
          <div className="company-profile-section-body">
            <div className="company-profile-info-table">
              <div className="company-profile-info-row">
                <div className="company-profile-info-label">アカウント</div>
                <div className="company-profile-info-value">
                  <span className={`badge ${SEEKER_STATUS_BADGE_CLASS[detail.status]}`}>
                    {SEEKER_STATUS_LABELS[detail.status]}
                  </span>
                </div>
              </div>
              <InfoRow label="性別" value={profile.gender} />
              <InfoRow label="生年月日" value={formatBirthdayDisplay(profile.birthday)} />
              <InfoRow label="最終学歴" value={profile.education} />
              <div className="company-profile-info-row">
                <div className="company-profile-info-label">メール</div>
                <div className="company-profile-info-value break-all">{profile.email}</div>
              </div>
            </div>
          </div>
        </section>

        <AdminSeekerProfileView profile={profile} />

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">応募履歴</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            {detail.recentApplications.length === 0 ? (
              <p className="company-profile-text company-profile-text--muted px-4 py-6 text-center">
                応募履歴がありません
              </p>
            ) : (
              <ul className="company-dashboard-action-list">
                {detail.recentApplications.map((app) => {
                  const status = app.status as ApplicationStatus;
                  const statusLabel =
                    APPLICATION_STATUS_LABELS[status] ?? app.status;
                  return (
                    <li key={app.id}>
                      <div className="company-dashboard-action-row">
                        <div className="company-dashboard-action-icon">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="company-dashboard-action-title">{app.jobTitle}</p>
                          <p className="company-dashboard-action-desc">
                            {app.companyName} · {formatDateJST(app.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`badge shrink-0 text-[10px] ${APPLICATION_STATUS_BADGE[status] ?? "badge-amber"}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {pendingAction && (
          <SeekerSuspendConfirmModal
            key={pendingAction}
            seeker={{
              id: profile.id,
              name: profile.name,
              email: profile.email,
              area: profile.area,
              desiredJobType: profile.desiredJobType,
              applicationCount: detail.applicationCount,
              status: detail.status,
              createdAt: detail.createdAt,
            }}
            action={pendingAction}
            onClose={() => setPendingAction(null)}
            onConfirm={() =>
              updateStatus(pendingAction === "suspend" ? "Suspended" : "Active")
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
