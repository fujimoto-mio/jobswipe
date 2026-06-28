-- Track last-read timestamps for chat unread counts
ALTER TABLE "applications" ADD COLUMN "seeker_read_at" TIMESTAMP(3);
ALTER TABLE "applications" ADD COLUMN "company_read_at" TIMESTAMP(3);
