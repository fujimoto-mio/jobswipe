-- Improve company ↔ job ↔ account lookups (one company, many jobs)
CREATE INDEX IF NOT EXISTS "jobs_company_id_idx" ON "jobs"("company_id");
CREATE INDEX IF NOT EXISTS "accounts_company_id_idx" ON "accounts"("company_id");
