import { clearSeekerId, invalidateApiCache } from "@/lib/api-client";
import { clearClientSessionCache } from "@/lib/auth/client-session";
import { clearProfile } from "@/lib/profile";
import { invalidateSeekerMeCache } from "@/lib/seeker-user";
import { apiFetch } from "@/lib/api-client";

export async function seekerLogout(): Promise<void> {
  await apiFetch("/api/auth/login", { method: "DELETE" });
  clearProfile();
  clearSeekerId();
  clearClientSessionCache();
  invalidateSeekerMeCache();
  invalidateApiCache();
  window.location.href = "/login";
}
