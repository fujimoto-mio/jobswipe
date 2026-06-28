-- Replace age with birthday on seeker profiles
ALTER TABLE "seeker_profiles" ADD COLUMN "birthday" DATE;

UPDATE "seeker_profiles"
SET "birthday" = make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int - "age", 1, 1)
WHERE "age" IS NOT NULL;

UPDATE "seeker_profiles"
SET "birthday" = make_date(2000, 1, 1)
WHERE "birthday" IS NULL;

ALTER TABLE "seeker_profiles" DROP COLUMN "age";
ALTER TABLE "seeker_profiles" ALTER COLUMN "birthday" SET NOT NULL;

-- Replace applicant_age with applicant_birthday on applications
ALTER TABLE "applications" ADD COLUMN "applicant_birthday" DATE;

UPDATE "applications"
SET "applicant_birthday" = make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int - "applicant_age", 1, 1)
WHERE "applicant_age" IS NOT NULL;

ALTER TABLE "applications" DROP COLUMN "applicant_age";
