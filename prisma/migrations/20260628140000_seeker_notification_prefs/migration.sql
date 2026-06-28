ALTER TABLE "seeker_profiles"
  ADD COLUMN "notify_hired_email" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notify_chat_email" BOOLEAN NOT NULL DEFAULT true;
