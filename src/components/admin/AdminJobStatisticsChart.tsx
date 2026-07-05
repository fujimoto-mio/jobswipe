"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { apiFetch } from "@/lib/api-client";
import {
  REGISTRATION_TREND_RANGES,
  type JobTrendPoint,
  type RegistrationTrendRange,
} from "@/lib/admin-job-trend";
import { JOB_APPROVAL_LABELS } from "@/lib/constants";

const RANGE_LABELS: Record<RegistrationTrendRange, string> = {
  7: "7日",
  30: "30日",
  90: "90日",
  365: "1年",
};

const JOB_LINE_COLORS = {
  pending: "#F59E0B",
  active: "#2563EB",
  cancelled: "#EF4444",
} as const;

type TrendResponse = {
  days: RegistrationTrendRange;
  points: JobTrendPoint[];
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-slate-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-slate-600">
          <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function AdminJobStatisticsChart() {
  const [range, setRange] = useState<RegistrationTrendRange>(30);
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/admin/stats/jobs?days=${range}`)
      .then((response) => response.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  const chartData =
    data?.points.map((point) => ({
      label: point.label,
      [JOB_APPROVAL_LABELS.Pending]: point.pending,
      [JOB_APPROVAL_LABELS.Active]: point.active,
      [JOB_APPROVAL_LABELS.Cancelled]: point.cancelled,
    })) ?? [];

  const totalPending = data?.points.reduce((sum, point) => sum + point.pending, 0) ?? 0;
  const totalActive = data?.points.reduce((sum, point) => sum + point.active, 0) ?? 0;
  const totalCancelled = data?.points.reduce((sum, point) => sum + point.cancelled, 0) ?? 0;
  const totalJobs = totalPending + totalActive + totalCancelled;

  return (
    <section className="company-profile-section">
      <div className="company-profile-section-header company-dashboard-section-header-row">
        <h2 className="company-profile-section-title">求人統計</h2>
        <div className="flex flex-wrap gap-2">
          {REGISTRATION_TREND_RANGES.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                range === days
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {RANGE_LABELS[days]}
            </button>
          ))}
        </div>
      </div>

      <div className="company-profile-section-body">
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <p>
            新規掲載{" "}
            <span className="font-semibold tabular-nums text-slate-900">{totalJobs.toLocaleString()}</span>
            <span className="text-slate-400"> / {RANGE_LABELS[range]}</span>
          </p>
          <p>
            {JOB_APPROVAL_LABELS.Pending}{" "}
            <span className="font-semibold tabular-nums text-slate-900">{totalPending.toLocaleString()}</span>
          </p>
          <p>
            {JOB_APPROVAL_LABELS.Active}{" "}
            <span className="font-semibold tabular-nums text-slate-900">{totalActive.toLocaleString()}</span>
          </p>
          <p>
            {JOB_APPROVAL_LABELS.Cancelled}{" "}
            <span className="font-semibold tabular-nums text-slate-900">{totalCancelled.toLocaleString()}</span>
          </p>
        </div>

        {loading ? (
          <PageLoading message="グラフを読み込み中..." minHeight="min-h-[280px]" staff />
        ) : chartData.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            この期間の求人データはありません
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  interval={range === 365 ? 3 : range === 90 ? 1 : 0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 13 }}
                />
                <Line
                  type="monotone"
                  dataKey={JOB_APPROVAL_LABELS.Pending}
                  stroke={JOB_LINE_COLORS.pending}
                  strokeWidth={2}
                  dot={{ r: 3, fill: JOB_LINE_COLORS.pending, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: JOB_LINE_COLORS.pending, stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey={JOB_APPROVAL_LABELS.Active}
                  stroke={JOB_LINE_COLORS.active}
                  strokeWidth={2}
                  dot={{ r: 3, fill: JOB_LINE_COLORS.active, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: JOB_LINE_COLORS.active, stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey={JOB_APPROVAL_LABELS.Cancelled}
                  stroke={JOB_LINE_COLORS.cancelled}
                  strokeWidth={2}
                  dot={{ r: 3, fill: JOB_LINE_COLORS.cancelled, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: JOB_LINE_COLORS.cancelled, stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
