import { headers } from "next/headers";

/** Server-only base URL for absolute links (e.g. email). Derived from the request or Vercel. */
export async function getAppUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const forwardedProto = h.get("x-forwarded-proto");
      const proto =
        forwardedProto ??
        (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // headers() is unavailable outside a request (e.g. scripts)
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}
