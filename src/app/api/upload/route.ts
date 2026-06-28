import { handleUploadRequest } from "@/lib/upload/handle-upload";

export async function POST(request: Request) {
  return handleUploadRequest(request);
}
