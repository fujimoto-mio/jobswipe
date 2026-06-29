ALTER TABLE "companies" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

UPDATE "companies"
SET "status" = CASE
  WHEN "suspended" = true THEN 'suspended'
  ELSE 'active'
END;

ALTER TABLE "companies" DROP COLUMN "suspended";
