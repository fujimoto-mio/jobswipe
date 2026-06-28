import { clearSeekerId, invalidateApiCache } from "@/lib/api-client";
import { clearClientSessionCache } from "@/lib/auth/client-session";
import { clearProfile } from "@/lib/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function seekerLogout(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (supabase) await supabase.auth.signOut();
  clearProfile();
  clearSeekerId();
  clearClientSessionCache();
  invalidateApiCache();
  window.location.href = "/login";
}
