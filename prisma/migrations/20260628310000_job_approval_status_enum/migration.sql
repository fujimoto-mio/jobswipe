CREATE TYPE "JobApprovalStatus" AS ENUM ('Pending', 'Active', 'Cancelled');

ALTER TABLE "jobs" ALTER COLUMN "approval_status" DROP DEFAULT;

ALTER TABLE "jobs"
ALTER COLUMN "approval_status" TYPE "JobApprovalStatus"
USING (
  CASE lower("approval_status")
    WHEN 'pending' THEN 'Pending'::"JobApprovalStatus"
    WHEN 'approved' THEN 'Active'::"JobApprovalStatus"
    WHEN 'rejected' THEN 'Cancelled'::"JobApprovalStatus"
    ELSE 'Pending'::"JobApprovalStatus"
  END
);

ALTER TABLE "jobs" ALTER COLUMN "approval_status" SET DEFAULT 'Pending'::"JobApprovalStatus";
