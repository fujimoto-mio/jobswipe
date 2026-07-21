-- Removes the 'Arbeit' (アルバイト) member, which duplicated 'PartTime'
-- (パート・アルバイト) and would have silently split the part-time inventory.
-- PostgreSQL cannot drop an enum label, so the type is recreated and swapped.

-- Refuse to run if anything actually uses 'Arbeit'.
DO $$
DECLARE
  bad text;
BEGIN
  SELECT string_agg(format('%s=%s', src, n), ', ')
  INTO bad
  FROM (
    SELECT 'jobs' AS src, COUNT(*) AS n FROM "jobs" WHERE "employment_type" = 'Arbeit' HAVING COUNT(*) > 0
    UNION ALL
    SELECT 'job_submissions', COUNT(*) FROM "job_submissions" WHERE "employment_type" = 'Arbeit' HAVING COUNT(*) > 0
    UNION ALL
    SELECT 'seeker_profiles', COUNT(*) FROM "seeker_profiles" WHERE "employment_type" = 'Arbeit' HAVING COUNT(*) > 0
  ) AS t;

  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'rows still use EmploymentType.Arbeit (%); migrate them to PartTime first', bad;
  END IF;
END
$$;

ALTER TYPE "EmploymentType" RENAME TO "EmploymentType_old";

CREATE TYPE "EmploymentType" AS ENUM (
  'FullTime',
  'Contract',
  'Dispatch',
  'PartTime',
  'Outsourcing',
  'Internship'
);

ALTER TABLE "jobs"
ALTER COLUMN "employment_type" TYPE "EmploymentType"
USING ("employment_type"::text::"EmploymentType");

ALTER TABLE "job_submissions"
ALTER COLUMN "employment_type" TYPE "EmploymentType"
USING ("employment_type"::text::"EmploymentType");

ALTER TABLE "seeker_profiles"
ALTER COLUMN "employment_type" TYPE "EmploymentType"
USING ("employment_type"::text::"EmploymentType");

DROP TYPE "EmploymentType_old";
