import { apiFetch } from "@/lib/api-client";
import type { UploadKind } from "@/lib/storage";

export type { UploadKind };

export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const res = await apiFetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "アップロードに失敗しました");
  }

  return data.url as string;
}
