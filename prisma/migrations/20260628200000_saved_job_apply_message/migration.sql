-- Store seeker apply message on saved_jobs (interest + application message)
ALTER TABLE "saved_jobs" ADD COLUMN "message" TEXT;

-- Backfill message on existing saved rows from applications
UPDATE "saved_jobs" sj
SET "message" = a."message"
FROM "applications" a
WHERE a."seeker_id" = sj."seeker_id"
  AND a."job_id" = sj."job_id"
  AND a."message" IS NOT NULL
  AND btrim(a."message") <> '';

-- Create saved_jobs rows for applications that never created a save entry
INSERT INTO "saved_jobs" ("id", "seeker_id", "job_id", "message", "created_at")
SELECT gen_random_uuid(), a."seeker_id", a."job_id", a."message", a."created_at"
FROM "applications" a
WHERE NOT EXISTS (
  SELECT 1
  FROM "saved_jobs" sj
  WHERE sj."seeker_id" = a."seeker_id"
    AND sj."job_id" = a."job_id"
);
