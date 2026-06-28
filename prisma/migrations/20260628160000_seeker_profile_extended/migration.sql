ALTER TABLE "seeker_profiles"
  ADD COLUMN "desired_salary" TEXT,
  ADD COLUMN "job_search_intent" TEXT,
  ADD COLUMN "future_goals" TEXT,
  ADD COLUMN "education" TEXT,
  ADD COLUMN "portfolio_url" TEXT,
  ADD COLUMN "skills" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "work_history" JSONB NOT NULL DEFAULT '[]';
