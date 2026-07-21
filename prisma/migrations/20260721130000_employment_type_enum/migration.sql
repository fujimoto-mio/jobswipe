CREATE TYPE "EmploymentType" AS ENUM (
  'FullTime',
  'Contract',
  'Dispatch',
  'PartTime',
  'Arbeit',
  'Outsourcing',
  'Internship'
);

-- Fail loudly with the offending values instead of letting the cast below
-- silently produce NULLs and abort on a confusing not-null violation.
DO $$
DECLARE
  bad text;
BEGIN
  SELECT string_agg(DISTINCT format('%s=%L', src, employment_type), ', ')
  INTO bad
  FROM (
    SELECT 'jobs' AS src, employment_type FROM "jobs"
    UNION ALL SELECT 'job_submissions', employment_type FROM "job_submissions"
    UNION ALL SELECT 'seeker_profiles', employment_type FROM "seeker_profiles"
  ) AS t
  WHERE employment_type NOT IN (
    '正社員', '契約社員', '派遣', 'パート・アルバイト', 'アルバイト', '業務委託', 'インターン'
  );

  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'employment_type values outside the EmploymentType enum: %', bad;
  END IF;
END
$$;

ALTER TABLE "jobs"
ALTER COLUMN "employment_type" TYPE "EmploymentType"
USING (
  CASE "employment_type"
    WHEN '正社員' THEN 'FullTime'
    WHEN '契約社員' THEN 'Contract'
    WHEN '派遣' THEN 'Dispatch'
    WHEN 'パート・アルバイト' THEN 'PartTime'
    WHEN 'アルバイト' THEN 'Arbeit'
    WHEN '業務委託' THEN 'Outsourcing'
    WHEN 'インターン' THEN 'Internship'
  END::"EmploymentType"
);

ALTER TABLE "job_submissions"
ALTER COLUMN "employment_type" TYPE "EmploymentType"
USING (
  CASE "employment_type"
    WHEN '正社員' THEN 'FullTime'
    WHEN '契約社員' THEN 'Contract'
    WHEN '派遣' THEN 'Dispatch'
    WHEN 'パート・アルバイト' THEN 'PartTime'
    WHEN 'アルバイト' THEN 'Arbeit'
    WHEN '業務委託' THEN 'Outsourcing'
    WHEN 'インターン' THEN 'Internship'
  END::"EmploymentType"
);

ALTER TABLE "seeker_profiles"
ALTER COLUMN "employment_type" TYPE "EmploymentType"
USING (
  CASE "employment_type"
    WHEN '正社員' THEN 'FullTime'
    WHEN '契約社員' THEN 'Contract'
    WHEN '派遣' THEN 'Dispatch'
    WHEN 'パート・アルバイト' THEN 'PartTime'
    WHEN 'アルバイト' THEN 'Arbeit'
    WHEN '業務委託' THEN 'Outsourcing'
    WHEN 'インターン' THEN 'Internship'
  END::"EmploymentType"
);
