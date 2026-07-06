-- Add Draft enum value (must be in its own migration before use)

ALTER TYPE "JobApprovalStatus" ADD VALUE IF NOT EXISTS 'Draft';
