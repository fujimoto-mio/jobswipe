import { NextResponse } from "next/server";
import { getStaffUser } from "@/lib/auth/admin";
import { getSupabaseUserFromRequest } from "@/lib/auth/supabase-user";
import { uploadByKind, resolveUploadContentType, type UploadKind } from "@/lib/storage";

const STAFF_KINDS = new Set<UploadKind>(["video", "thumbnail", "image", "company-logo", "company-banner", "staff-avatar"]);
const SEEKER_KINDS = new Set<UploadKind>(["image", "resume", "seeker-avatar", "seeker-banner"]);

function parseKind(raw: string | null): UploadKind | null {
  if (
    raw === "video" ||
    raw === "thumbnail" ||
    raw === "image" ||
    raw === "resume" ||
    raw === "company-logo" ||
    raw === "company-banner" ||
    raw === "staff-avatar" ||
    raw === "seeker-avatar" ||
    raw === "seeker-banner"
  ) {
    return raw;
  }
  return null;
}

function uploadErrorStatus(message: string): number {
  if (
    message.includes("ファイル形式") ||
    message.includes("ファイルサイズ") ||
    message.includes("ファイルが空") ||
    message.includes("対応していない画像") ||
    message === "file is required" ||
    message === "kind is required" ||
    message === "Invalid kind"
  ) {
    return 400;
  }
  if (message === "Unauthorized") return 401;
  return 500;
}

function mapUploadErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("mime type") && lower.includes("not supported")) {
    return "対応していない画像形式です。JPEG、PNG、WebP、GIF をご利用ください";
  }
  if (lower.includes("payload too large") || lower.includes("maximum allowed size")) {
    return "ファイルサイズが大きすぎます";
  }
  if (lower.includes("bucket not found") || lower.includes("nosuchbucket")) {
    return "ストレージの設定が完了していません";
  }
  if (lower.includes("cloudflare r2 is not configured")) {
    return "ストレージの設定が完了していません（.env の R2 設定を確認してください）";
  }
  return message;
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
    const contentType = resolveUploadContentType(file.name, file.type || "");
    const url = await uploadByKind(kind, buffer, file.name, contentType, {
      userId: staff?.id ?? user?.id,
    });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Upload failed";
    const message = mapUploadErrorMessage(raw);
    console.error("[POST /api/upload]", { message: raw, error });
    return NextResponse.json({ error: message }, { status: uploadErrorStatus(message) });
  }
}
