import { UPLOAD_KIND_CONFIG, type UploadKind } from "@/lib/storage/constants";

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const SUPPORTED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export { SUPPORTED_IMAGE_MIMES };

export function resolveUploadContentType(filename: string, reportedType: string): string {
  const trimmed = reportedType.trim();
  if (trimmed && trimmed !== "application/octet-stream") return trimmed;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? trimmed;
}

/** Returns a user-facing error message, or null if the file is valid. */
export function getUploadValidationError(file: File, kind: UploadKind): string | null {
  const config = UPLOAD_KIND_CONFIG[kind];

  if (file.size <= 0) {
    return "ファイルが空です";
  }

  const contentType = resolveUploadContentType(file.name, file.type || "");
  const isImageKind = config.mimePrefix === "image/";

  if (isImageKind) {
    if (!contentType.startsWith("image/")) {
      return "ファイル形式が正しくありません";
    }
    if (!SUPPORTED_IMAGE_MIMES.has(contentType)) {
      return "対応していない画像形式です。JPEG、PNG、WebP、GIF をご利用ください";
    }
  } else if (Array.isArray(config.mimePrefix)) {
    if (!config.mimePrefix.includes(contentType)) {
      return "ファイル形式が正しくありません";
    }
  } else if (!contentType.startsWith(config.mimePrefix)) {
    return "ファイル形式が正しくありません";
  }

  if (file.size > config.maxBytes) {
    const maxMb = Math.round(config.maxBytes / (1024 * 1024));
    return `ファイルサイズが大きすぎます（最大 ${maxMb}MB）`;
  }

  return null;
}

function mimeMatches(contentType: string, rule: string | string[]): boolean {
  if (Array.isArray(rule)) return rule.includes(contentType);
  return contentType.startsWith(rule);
}

/** Server-side validation after content type has been resolved from filename. */
export function validateResolvedUpload(
  kind: UploadKind,
  contentType: string,
  size: number
): string | null {
  const config = UPLOAD_KIND_CONFIG[kind];

  if (size <= 0) return "ファイルが空です";

  if (!mimeMatches(contentType, config.mimePrefix)) {
    return "ファイル形式が正しくありません";
  }

  if (config.mimePrefix === "image/" && !SUPPORTED_IMAGE_MIMES.has(contentType)) {
    return "対応していない画像形式です。JPEG、PNG、WebP、GIF をご利用ください";
  }

  if (size > config.maxBytes) {
    const maxMb = Math.round(config.maxBytes / (1024 * 1024));
    return `ファイルサイズが大きすぎます（最大 ${maxMb}MB）`;
  }

  return null;
}
