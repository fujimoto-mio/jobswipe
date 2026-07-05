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
  type RegistrationTrendPoint,
  type RegistrationTrendRange,
} from "@/lib/admin-registration-trend";

const RANGE_LABELS: Record<RegistrationTrendRange, string> = {
  7: "7日",
  30: "30日",
  90: "90日",
  365: "1年",
};

type TrendResponse = {
  days: RegistrationTrendRange;
  points: RegistrationTrendPoint[];
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

export default function AdminRegistrationChart() {
  const [range, setRange] = useState<RegistrationTrendRange>(30);
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/admin/stats/registrations?days=${range}`)
      .then((response) => response.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  const chartData =
    data?.points.map((point) => ({
      label: point.label,
      企業: point.companies,
      求職者: point.seekers,
    })) ?? [];

  const totalCompanies = data?.points.reduce((sum, point) => sum + point.companies, 0) ?? 0;
  const totalSeekers = data?.points.reduce((sum, point) => sum + point.seekers, 0) ?? 0;

  return (
    <section className="company-profile-section">
      <div className="company-profile-section-header company-dashboard-section-header-row">
        <h2 className="company-profile-section-title">登録推移</h2>
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
            企業 <span className="font-semibold tabular-nums text-slate-900">{totalCompanies.toLocaleString()}</span>
            <span className="text-slate-400"> / {RANGE_LABELS[range]}</span>
          </p>
          <p>
            求職者 <span className="font-semibold tabular-nums text-slate-900">{totalSeekers.toLocaleString()}</span>
            <span className="text-slate-400"> / {RANGE_LABELS[range]}</span>
          </p>
        </div>

        {loading ? (
          <PageLoading message="グラフを読み込み中..." minHeight="min-h-[280px]" staff />
        ) : chartData.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            この期間の登録データはありません
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
                  dataKey="企業"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#2563EB", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="求職者"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
