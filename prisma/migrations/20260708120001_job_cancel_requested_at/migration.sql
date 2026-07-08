-- Track pending company cancellation requests awaiting admin approval

ALTER TABLE "jobs" ADD COLUMN "cancel_requested_at" TIMESTAMPTZ(3);
