"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Briefcase,
  FileText,
  Eye,
  ShieldCheck,
  ArrowRight,
  Users,
} from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api-client";

type AdminStats = {
  companyCount: number;
  totalJobs: number;
  approvedJobs: number;
  pendingJobs: number;
  applicationCount: number;
  pendingApplications: number;
  videoViews: number;
  activeChatCount: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理者ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">プラットフォーム全体の運用状況</p>
        </div>
        <PageLoading message="データを読み込み中..." minHeight="min-h-[360px]" />
      </>
    );
  }

  const cards = [
    { label: "登録企業数", value: stats?.companyCount ?? 0, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "公開中求人", value: stats?.approvedJobs ?? 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "審査待ち求人", value: stats?.pendingJobs ?? 0, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "総応募数", value: stats?.applicationCount ?? 0, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "動画再生数", value: stats?.videoViews ?? 0, icon: Eye, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "アクティブチャット", value: stats?.activeChatCount ?? 0, icon: Users, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理者ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">求人審査・企業管理・プラットフォームKPI</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/jobs"
          className="group card flex items-center justify-between p-6 transition hover:border-amber-200 hover:shadow-md"
        >
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">求人審査</h2>
            <p className="mt-1 text-sm text-slate-500">
              審査待ち {stats?.pendingJobs ?? 0}件 — 承認・却下
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-amber-500" />
        </Link>

        <Link
          href="/admin/applications"
          className="group card flex items-center justify-between p-6 transition hover:border-emerald-200 hover:shadow-md"
        >
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">応募モニタリング</h2>
            <p className="mt-1 text-sm text-slate-500">
              全企業の応募状況を確認（未対応 {stats?.pendingApplications ?? 0}件）
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-600" />
        </Link>
      </div>
    </>
  );
}
