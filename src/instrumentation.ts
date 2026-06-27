import { applyTimeZoneEnv } from "@/lib/timezone-env";

/** Apply TIME_ZONE from .env to Node's TZ at server startup */
export async function register() {
  applyTimeZoneEnv();
}
