-- Require supabase_user_id on every seeker profile (linked to Supabase Auth)
DELETE FROM "seeker_profiles" WHERE "supabase_user_id" IS NULL;

ALTER TABLE "seeker_profiles" ALTER COLUMN "supabase_user_id" SET NOT NULL;
