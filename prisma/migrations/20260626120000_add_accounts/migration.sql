-- CreateTable accounts (admin / company staff)
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "accounts_email_key" ON "accounts"("email");
CREATE INDEX IF NOT EXISTS "accounts_role_idx" ON "accounts"("role");

ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_company_id_fkey";
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
