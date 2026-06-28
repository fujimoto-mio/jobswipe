-- Store all timestamps as timestamptz (UTC internally, JST at app layer)
-- Existing timestamp(3) values are interpreted as UTC.

ALTER TABLE "companies"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "jobs"
  ALTER COLUMN "posted_at" TYPE TIMESTAMPTZ(3) USING "posted_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "accounts"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "seeker_profiles"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "saved_jobs"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "applications"
  ALTER COLUMN "interview_booked_at" TYPE TIMESTAMPTZ(3) USING "interview_booked_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "match_email_sent_at" TYPE TIMESTAMPTZ(3) USING "match_email_sent_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "seeker_read_at" TYPE TIMESTAMPTZ(3) USING "seeker_read_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "company_read_at" TYPE TIMESTAMPTZ(3) USING "company_read_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

ALTER TABLE "chat_messages"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC';
