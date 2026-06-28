import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/auth/admin";
import { getSupabaseUserFromRequest } from "@/lib/auth/supabase-user";
import { uploadByKind, type UploadKind } from "@/lib/storage";

const STAFF_KINDS = new Set<UploadKind>(["video", "thumbnail", "image", "company-logo", "company-banner", "staff-avatar"]);
const SEEKER_KINDS = new Set<UploadKind>(["image", "resume"]);

function parseKind(raw: string | null): UploadKind | null {
  if (
    raw === "video" ||
    raw === "thumbnail" ||
    raw === "image" ||
    raw === "resume" ||
    raw === "company-logo" ||
    raw === "company-banner" ||
    raw === "staff-avatar"
  ) {
    return raw;
  }
  return null;
}

export async function handleUploadRequest(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const kind = parseKind((form.get("kind") as string | null) ?? (form.get("type") as string | null));

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!kind) {
      return NextResponse.json({ error: "kind is required" }, { status: 400 });
    }

    const [staff, user] = await Promise.all([getStaffUser(), getSupabaseUserFromRequest(request)]);

    if (STAFF_KINDS.has(kind)) {
      if (!staff) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (SEEKER_KINDS.has(kind)) {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadByKind(kind, buffer, file.name, file.type || "application/octet-stream", {
      userId: user?.id,
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
