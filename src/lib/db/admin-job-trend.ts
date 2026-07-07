import { prisma } from "@/lib/prisma";
import { formatDateISOJST } from "@/lib/datetime";
import type { JobTrendPoint } from "@/lib/admin-job-trend";
import type { RegistrationTrendRange } from "@/lib/admin-registration-trend";
import { bucketLabel, buildTrendBucketKeys } from "@/lib/db/admin-stats-trend-utils";

type JobTrendRow = { bucket: Date; approval_status: string; count: bigint };

export async function getAdminJobTrend(
  days: RegistrationTrendRange,
  companyId?: string | null
): Promise<JobTrendPoint[]> {
  const { from, granularity, keys } = buildTrendBucketKeys(days);
  const trunc = granularity;

  const rows = companyId
    ? await prisma.$queryRaw<JobTrendRow[]>`
        SELECT date_trunc(${trunc}, created_at AT TIME ZONE 'Asia/Tokyo')::date AS bucket,
               approval_status,
               COUNT(*)::bigint AS count
        FROM jobs
        WHERE created_at >= ${from}
          AND company_id = ${companyId}
        GROUP BY 1, 2
        ORDER BY 1, 2
      `
    : await prisma.$queryRaw<JobTrendRow[]>`
        SELECT date_trunc(${trunc}, created_at AT TIME ZONE 'Asia/Tokyo')::date AS bucket,
               approval_status,
               COUNT(*)::bigint AS count
        FROM jobs
        WHERE created_at >= ${from}
        GROUP BY 1, 2
        ORDER BY 1, 2
      `;

  const byBucket = new Map<string, { pending: number; active: number; cancelled: number }>();
  for (const key of keys) {
    byBucket.set(key, { pending: 0, active: 0, cancelled: 0 });
  }

  for (const row of rows) {
    const key = formatDateISOJST(row.bucket);
    const bucket = byBucket.get(key);
    if (!bucket) continue;

    const count = Number(row.count);
    if (row.approval_status === "Pending") bucket.pending = count;
    else if (row.approval_status === "Active") bucket.active = count;
    else if (row.approval_status === "Cancelled") bucket.cancelled = count;
  }

  return keys.map((key) => {
    const counts = byBucket.get(key) ?? { pending: 0, active: 0, cancelled: 0 };
    return {
      key,
      label: bucketLabel(key, granularity),
      pending: counts.pending,
      active: counts.active,
      cancelled: counts.cancelled,
    };
  });
}
