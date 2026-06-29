CREATE TYPE "SeekerStatus" AS ENUM ('Active', 'Suspended');

ALTER TABLE "seeker_profiles" ADD COLUMN "status" "SeekerStatus" NOT NULL DEFAULT 'Active';

UPDATE "seeker_profiles"
SET "status" = CASE
  WHEN "suspended" = true THEN 'Suspended'::"SeekerStatus"
  ELSE 'Active'::"SeekerStatus"
END;

ALTER TABLE "seeker_profiles" DROP COLUMN "suspended";
