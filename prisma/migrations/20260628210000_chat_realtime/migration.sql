-- Supabase Realtime: deliver chat_messages INSERT events to authenticated participants
ALTER TABLE "chat_messages" REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "chat_messages";
  END IF;
END $$;

ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seekers_read_own_chat_messages" ON "chat_messages";
DROP POLICY IF EXISTS "company_read_chat_messages" ON "chat_messages";
DROP POLICY IF EXISTS "admin_read_chat_messages" ON "chat_messages";

CREATE POLICY "seekers_read_own_chat_messages"
ON "chat_messages"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "applications" a
    INNER JOIN "seeker_profiles" sp ON sp.id = a.seeker_id
    WHERE a.id = "chat_messages".application_id
      AND sp.supabase_user_id = auth.uid()::text
  )
);

CREATE POLICY "company_read_chat_messages"
ON "chat_messages"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "applications" a
    INNER JOIN "jobs" j ON j.id = a.job_id
    INNER JOIN "accounts" acc ON acc.company_id = j.company_id
    WHERE a.id = "chat_messages".application_id
      AND acc.id = auth.uid()::text
      AND acc.role = 'company'
  )
);

CREATE POLICY "admin_read_chat_messages"
ON "chat_messages"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "accounts" acc
    WHERE acc.id = auth.uid()::text
      AND acc.role = 'admin'
  )
);
