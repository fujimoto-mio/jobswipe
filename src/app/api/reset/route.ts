import { NextResponse } from "next/server";
import { resetDemo } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth/admin";

export async function POST() {
  const admin = await requireAdminUser();
  if (admin instanceof NextResponse) return admin;

  await resetDemo();

  return NextResponse.json({ success: true, message: "データをリセットしました" });
}
