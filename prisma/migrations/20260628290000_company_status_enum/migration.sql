CREATE TYPE "CompanyStatus" AS ENUM ('Active', 'Pending', 'Suspended');

ALTER TABLE "companies" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "companies"
ALTER COLUMN "status" TYPE "CompanyStatus"
USING (
  CASE lower("status")
    WHEN 'active' THEN 'Active'::"CompanyStatus"
    WHEN 'pending' THEN 'Pending'::"CompanyStatus"
    WHEN 'suspended' THEN 'Suspended'::"CompanyStatus"
    ELSE 'Active'::"CompanyStatus"
  END
);

ALTER TABLE "companies" ALTER COLUMN "status" SET DEFAULT 'Active'::"CompanyStatus";
