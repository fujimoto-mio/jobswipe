-- Application interview booking + match email tracking (matches prisma schema)
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "interview_slot" TEXT;
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "interview_booked_at" TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "match_email_sent_at" TIMESTAMP(3);
