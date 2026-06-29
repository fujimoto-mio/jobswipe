import { prisma } from "@/lib/prisma";
import { formatDateISOJST } from "@/lib/datetime";
import type { RegistrationTrendPoint, RegistrationTrendRange } from "@/lib/admin-registration-trend";
import { bucketLabel, buildTrendBucketKeys } from "@/lib/db/admin-stats-trend-utils";

type CountRow = { bucket: Date; count: bigint };

async function fetchBucketCounts(
  table: "companies" | "seeker_profiles",
  from: Date,
  granularity: "day" | "week"
): Promise<Map<string, number>> {
  const trunc = granularity;
  const rows =
    table === "companies"
      ? await prisma.$queryRaw<CountRow[]>`
          SELECT date_trunc(${trunc}, created_at AT TIME ZONE 'Asia/Tokyo')::date AS bucket,
                 COUNT(*)::bigint AS count
          FROM companies
          WHERE created_at >= ${from}
          GROUP BY 1
          ORDER BY 1
        `
      : await prisma.$queryRaw<CountRow[]>`
          SELECT date_trunc(${trunc}, created_at AT TIME ZONE 'Asia/Tokyo')::date AS bucket,
                 COUNT(*)::bigint AS count
          FROM seeker_profiles
          WHERE created_at >= ${from}
          GROUP BY 1
          ORDER BY 1
        `;

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(formatDateISOJST(row.bucket), Number(row.count));
  }
  return map;
}

export async function getAdminRegistrationTrend(
  days: RegistrationTrendRange
): Promise<RegistrationTrendPoint[]> {
  const { from, granularity, keys } = buildTrendBucketKeys(days);

  const [companyCounts, seekerCounts] = await Promise.all([
    fetchBucketCounts("companies", from, granularity),
    fetchBucketCounts("seeker_profiles", from, granularity),
  ]);

  return keys.map((key) => ({
    key,
    label: bucketLabel(key, granularity),
    companies: companyCounts.get(key) ?? 0,
    seekers: seekerCounts.get(key) ?? 0,
  }));
}
