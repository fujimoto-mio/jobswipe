import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCompanyLogoUrl } from "@/lib/job-image";
import { getRoleFromUser } from "@/lib/auth/roles";

type CompanyRegisterBody = {
  companyName: string;
  contactName: string;
  website?: string;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized — sign up first" }, { status: 401 });
  }

  const role = getRoleFromUser(user);
  if (role === "admin") {
    return NextResponse.json({ error: "管理者アカウントでは利用できません" }, { status: 403 });
  }
  if (role === "seeker") {
    return NextResponse.json({ error: "求職者アカウントでは利用できません" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as CompanyRegisterBody;
    const companyName = body.companyName?.trim();
    const contactName = body.contactName?.trim();

    if (!companyName || !contactName) {
      return NextResponse.json({ error: "会社名と担当者名は必須です" }, { status: 400 });
    }

    const company = await prisma.company.upsert({
      where: { name: companyName },
      create: {
        name: companyName,
        logoUrl: getCompanyLogoUrl(companyName),
        website: body.website?.trim() || undefined,
      },
      update: {
        website: body.website?.trim() || undefined,
      },
    });

    await prisma.account.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name: contactName,
        role: "company",
        companyId: company.id,
      },
      update: {
        email: user.email,
        name: contactName,
        role: "company",
        companyId: company.id,
      },
    });

    return NextResponse.json({
      success: true,
      company: { id: company.id, name: company.name },
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
