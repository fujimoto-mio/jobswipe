"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Ban, Briefcase, Check, ExternalLink, RotateCcw, Users, X } from "lucide-react";
import CompanyLogo from "@/components/chat/CompanyLogo";
import CompanyStatusConfirmModal, {
  COMPANY_STATUS_ACTION_TARGET,
  type CompanyStatusAction,
} from "@/components/admin/CompanyStatusConfirmModal";
import JobThumbnail from "@/components/JobThumbnail";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import {
  COMPANY_STATUS_BADGE_CLASS,
  COMPANY_STATUS_LABELS,
  JOB_APPROVAL_BADGE_CLASS,
  JOB_APPROVAL_LABELS,
  type CompanyStatus,
} from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import { companyLinkFormValues } from "@/lib/company-links";
import type { AdminCompanyDetail } from "@/lib/db/admin-companies";

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

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<CompanyStatusAction | null>(null);

  const loadDetail = useCallback(async () => {
    const res = await apiFetch(`/api/admin/companies/${encodeURIComponent(companyId)}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    return (data.company ?? null) as AdminCompanyDetail | null;
  }, [companyId]);

  useEffect(() => {
    loadDetail()
      .then(setCompany)
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [loadDetail]);

  const updateStatus = async (status: CompanyStatus) => {
    const res = await apiFetch(`/api/admin/companies/${encodeURIComponent(companyId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("update failed");
    const data = await res.json();
    setCompany(data.company ?? null);
  };

  if (loading) {
    return <PageLoading message="企業情報を読み込み中..." minHeight="min-h-[320px]" />;
  }

  if (!company) {
    return (
      <div className="company-dashboard-page">
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          企業が見つかりませんでした
        </p>
        <Link href="/admin/companies" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          企業一覧に戻る
        </Link>
      </div>
    );
  }

  const links = companyLinkFormValues(company.links);
  const linkRows = [
    { label: "採用ページ", value: links.careersPage },
    { label: "Twitter / X", value: links.twitter },
    { label: "Instagram", value: links.instagram },
    { label: "LinkedIn", value: links.linkedin },
  ].filter((row) => row.value);

  return (
    <div className="company-dashboard-page">
      <div className="mb-6">
        <Link href="/admin/companies" className="btn-ghost mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          企業一覧
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <CompanyLogo company={company.name} logoUrl={company.logoUrl} size="lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{company.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                登録日 {company.createdAt} · 求人 {company.jobCount}件 · 応募 {company.applicationCount}件
              </p>
              <div className="mt-3">
                <span className={`badge ${COMPANY_STATUS_BADGE_CLASS[company.status]}`}>
                  {COMPANY_STATUS_LABELS[company.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {company.status === "Pending" && (
              <>
                <button
                  type="button"
                  onClick={() => setPendingAction("approve")}
                  className="staff-ui btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Check className="h-4 w-4" />
                  承認
                </button>
                <button
                  type="button"
                  onClick={() => setPendingAction("reject")}
                  className="staff-ui inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                  却下
                </button>
              </>
            )}
            {company.status === "Active" && (
              <button
                type="button"
                onClick={() => setPendingAction("suspend")}
                className="staff-ui inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Ban className="h-4 w-4" />
                停止
              </button>
            )}
            {company.status === "Suspended" && (
              <button
                type="button"
                onClick={() => setPendingAction("resume")}
                className="staff-ui btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                再開
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="company-dashboard-sections">
        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">企業概要</h2>
          </div>
          <div className="company-profile-section-body">
            <p className="company-profile-text">
              {company.description?.trim() || "企業概要が未設定です"}
            </p>
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">会社情報</h2>
          </div>
          <div className="company-profile-section-body">
            <div className="company-profile-info-table">
              <div className="company-profile-info-row">
                <div className="company-profile-info-label">ステータス</div>
                <div className="company-profile-info-value">
                  <span className={`badge ${COMPANY_STATUS_BADGE_CLASS[company.status]}`}>
                    {COMPANY_STATUS_LABELS[company.status]}
                  </span>
                </div>
              </div>
              <InfoRow label="コーポレートサイト" value={company.website} />
              <InfoRow label="郵便番号" value={company.postalCode} />
              <InfoRow label="所在地" value={company.address} />
              {linkRows.map((row) => (
                <div key={row.label} className="company-profile-info-row">
                  <div className="company-profile-info-label">{row.label}</div>
                  <div className="company-profile-info-value">
                    <a
                      href={row.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all font-medium text-blue-600 hover:underline"
                    >
                      {row.value}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header">
            <h2 className="company-profile-section-title">担当者アカウント</h2>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            {company.accounts.length === 0 ? (
              <p className="company-profile-text company-profile-text--muted px-4 py-6 text-center">
                担当者アカウントがありません
              </p>
            ) : (
              <ul className="company-dashboard-action-list">
                {company.accounts.map((account) => (
                  <li key={account.id} className="company-dashboard-action-row">
                    <div className="company-dashboard-action-icon">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="company-dashboard-action-title">{account.name || "未設定"}</p>
                      <p className="company-dashboard-action-desc">{account.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="company-profile-section">
          <div className="company-profile-section-header company-dashboard-section-header-row">
            <h2 className="company-profile-section-title">求人</h2>
            <Link href="/admin/jobs" className="company-dashboard-link">
              求人審査へ
              <Briefcase className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="company-profile-section-body company-profile-section-body--flush">
            {company.recentJobs.length === 0 ? (
              <p className="company-profile-text company-profile-text--muted px-4 py-6 text-center">
                求人がありません
              </p>
            ) : (
              <ul className="company-dashboard-action-list">
                {company.recentJobs.map((job) => (
                  <li key={job.id}>
                    <Link href={`/admin/jobs/${job.id}/view`} className="company-dashboard-action-row">
                      <JobThumbnail job={job} className="h-11 w-11 shrink-0 rounded-lg object-cover" showLogoBadge={false} />
                      <div className="min-w-0 flex-1">
                        <p className="company-dashboard-action-title">{job.title}</p>
                        <p className="company-dashboard-action-desc">
                          {job.category} · {JOB_APPROVAL_LABELS[job.approvalStatus]}
                        </p>
                      </div>
                      <span className={`badge shrink-0 ${JOB_APPROVAL_BADGE_CLASS[job.approvalStatus]}`}>
                        {JOB_APPROVAL_LABELS[job.approvalStatus]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </div>

      <AnimatePresence>
        {pendingAction && (
          <CompanyStatusConfirmModal
            key={pendingAction}
            company={{ id: company.id, name: company.name }}
            action={pendingAction}
            onClose={() => setPendingAction(null)}
            onConfirm={() => updateStatus(COMPANY_STATUS_ACTION_TARGET[pendingAction])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
