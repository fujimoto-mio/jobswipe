-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "approved_at" TIMESTAMPTZ(3);

-- Backfill approved jobs with updated_at as best-effort approval time
UPDATE "jobs"
SET "approved_at" = "updated_at"
WHERE "approval_status" = 'approved' AND "approved_at" IS NULL;
