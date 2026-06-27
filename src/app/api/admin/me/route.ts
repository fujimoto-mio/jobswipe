import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const account = await prisma.account.findUnique({
    where: { id: staff.id },
    include: { company: true },
  });

  return NextResponse.json({
    role: staff.role,
    companyId: staff.companyId,
    companyName: account?.company?.name ?? null,
    email: staff.email,
    name: account?.name ?? staff.name,
  });
}

export async function PATCH(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const { name } = (await request.json()) as { name?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "担当者名を入力してください" }, { status: 400 });
    }

    const account = await prisma.account.update({
      where: { id: staff.id },
      data: { name: name.trim() },
      include: { company: true },
    });

    return NextResponse.json({
      success: true,
      role: account.role,
      companyId: account.companyId,
      companyName: account.company?.name ?? null,
      email: account.email,
      name: account.name,
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
