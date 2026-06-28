import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { getCompanyLogoUrl } from "@/lib/job-image";

function staffProfileResponse(account: {
  role: string;
  companyId: string | null;
  email: string;
  name: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    description: string | null;
    website: string | null;
  } | null;
}) {
  return {
    role: account.role,
    companyId: account.companyId,
    companyName: account.company?.name ?? null,
    companyLogoUrl: account.company?.logoUrl ?? null,
    companyDescription: account.company?.description ?? null,
    companyWebsite: account.company?.website ?? null,
    email: account.email,
    name: account.name,
  };
}

export async function GET() {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const account = await prisma.account.findUnique({
    where: { id: staff.id },
    include: { company: true },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(staffProfileResponse(account));
}

type StaffProfilePatchBody = {
  name?: string;
  companyName?: string;
  website?: string;
  description?: string;
};

export async function PATCH(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const body = (await request.json()) as StaffProfilePatchBody;
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "担当者名を入力してください" }, { status: 400 });
    }

    if (staff.role === "company") {
      const companyName = body.companyName?.trim();
      if (!companyName) {
        return NextResponse.json({ error: "会社名を入力してください" }, { status: 400 });
      }

      if (!staff.companyId) {
        return NextResponse.json({ error: "企業情報が見つかりません" }, { status: 404 });
      }

      const existingCompany = await prisma.company.findUnique({
        where: { id: staff.companyId },
      });

      if (!existingCompany) {
        return NextResponse.json({ error: "企業情報が見つかりません" }, { status: 404 });
      }

      const website = body.website?.trim() || null;
      const description = body.description?.trim() || null;

      if (companyName !== existingCompany.name) {
        const conflict = await prisma.company.findUnique({ where: { name: companyName } });
        if (conflict && conflict.id !== existingCompany.id) {
          return NextResponse.json({ error: "この会社名は既に登録されています" }, { status: 409 });
        }
      }

      await prisma.$transaction([
        prisma.company.update({
          where: { id: existingCompany.id },
          data: {
            name: companyName,
            website,
            description,
            ...(companyName !== existingCompany.name
              ? { logoUrl: getCompanyLogoUrl(companyName) }
              : {}),
          },
        }),
        prisma.account.update({
          where: { id: staff.id },
          data: { name },
        }),
      ]);

      const account = await prisma.account.findUnique({
        where: { id: staff.id },
        include: { company: true },
      });

      if (!account) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, ...staffProfileResponse(account) });
    }

    const account = await prisma.account.update({
      where: { id: staff.id },
      data: { name },
      include: { company: true },
    });

    return NextResponse.json({ success: true, ...staffProfileResponse(account) });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
