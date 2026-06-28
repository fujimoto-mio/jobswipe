import { prisma } from "@/lib/prisma";

export async function fetchSavedApplyMessages(
  pairs: Array<{ seekerId: string; jobId: string }>
): Promise<Map<string, string | undefined>> {
  if (pairs.length === 0) return new Map();

  const unique = [...new Map(pairs.map((pair) => [`${pair.seekerId}:${pair.jobId}`, pair])).values()];
  const savedRows = await prisma.savedJob.findMany({
    where: {
      OR: unique.map((pair) => ({ seekerId: pair.seekerId, jobId: pair.jobId })),
    },
    select: { seekerId: true, jobId: true, message: true },
  });

  return new Map(
    savedRows.map((row) => [`${row.seekerId}:${row.jobId}`, row.message?.trim() || undefined])
  );
}

export function resolveApplicationMessage(
  seekerId: string,
  jobId: string,
  applicationMessage: string | null | undefined,
  savedMessages: Map<string, string | undefined>
): string | undefined {
  const fromApplication = applicationMessage?.trim();
  if (fromApplication) return fromApplication;
  return savedMessages.get(`${seekerId}:${jobId}`);
}
