import { Prisma } from "@prisma/client";
import { applyTimeZoneEnv, getTimeZone } from "@/lib/timezone-env";

/** Apply TIME_ZONE from .env to Node's TZ and Postgres session at server startup */
export async function register() {
  applyTimeZoneEnv();

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const tz = getTimeZone();
      await prisma.$executeRaw(Prisma.sql`SELECT set_config('timezone', ${tz}, false)`);
    } catch {
      // Non-fatal — display layer still converts to JST
    }
  }
}
