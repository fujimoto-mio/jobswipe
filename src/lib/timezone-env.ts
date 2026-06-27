const DEFAULT_TIME_ZONE = "Asia/Tokyo";

/** App timezone from .env (`TIME_ZONE`). Node still uses `TZ` internally — call `applyTimeZoneEnv()` at startup. */
export function getTimeZone(): string {
  return process.env.TIME_ZONE?.trim() || DEFAULT_TIME_ZONE;
}

/** Map `TIME_ZONE` → Node's `TZ` so native Date operations use the configured zone. */
export function applyTimeZoneEnv(): void {
  process.env.TZ = getTimeZone();
}
