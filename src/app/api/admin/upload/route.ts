import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { uploadJobVideo, uploadThumbnail } from "@/lib/storage";

export async function POST(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as string) ?? "video";

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url =
      type === "thumbnail"
        ? await uploadThumbnail(buffer, file.name, file.type)
        : await uploadJobVideo(buffer, file.name, file.type);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
