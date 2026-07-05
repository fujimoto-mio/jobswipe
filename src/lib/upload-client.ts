import { apiFetch } from "@/lib/api-client";
import { mapUserFacingError } from "@/lib/auth/errors";
import type { UploadKind } from "@/lib/storage";
import { getUploadValidationError } from "@/lib/upload/validation";

export type { UploadKind };

export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const validationError = getUploadValidationError(file, kind);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const res = await apiFetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? mapUserFacingError(data.error) : "アップロードに失敗しました"
    );
  }

  return data.url as string;
}
