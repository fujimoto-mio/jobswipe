-- Staff profile avatar + per-message sender display for company HR chat
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "sender_name" TEXT;
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "sender_avatar_url" TEXT;
