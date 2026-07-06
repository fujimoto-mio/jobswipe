-- Job submissions for active-job revision workflow

CREATE TYPE "JobSubmissionStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE "job_submissions" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "salary_display" TEXT NOT NULL,
    "employment_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "links" JSONB NOT NULL DEFAULT '{}',
    "status" "JobSubmissionStatus" NOT NULL DEFAULT 'Pending',
    "submitted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "job_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_submissions_status_submitted_at_idx" ON "job_submissions"("status", "submitted_at" DESC);
CREATE INDEX "job_submissions_job_id_status_idx" ON "job_submissions"("job_id", "status");

ALTER TABLE "job_submissions" ADD CONSTRAINT "job_submissions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "jobs" ALTER COLUMN "approval_status" SET DEFAULT 'Draft'::"JobApprovalStatus";
