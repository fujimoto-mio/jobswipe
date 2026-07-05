import { NextResponse } from "next/server";
import { CompanyStatus } from "@prisma/client";
import { createConfirmedAuthUser } from "@/lib/auth/admin-signup";
import { buildSessionForUserId } from "@/lib/auth/login";
import { setAuthSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCompanyLogoUrl } from "@/lib/job-image";
import { API_ERRORS } from "@/lib/api-errors";

type CompanyRegisterBody = {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
  website?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompanyRegisterBody;
    const email = body.email?.trim();
    const password = body.password;
    const companyName = body.companyName?.trim();
    const contactName = body.contactName?.trim();

    if (!email || !password || !companyName || !contactName) {
      return NextResponse.json(
        { error: API_ERRORS.companyRegisterFieldsRequired },
        { status: 400 }
      );
    }

    const auth = await createConfirmedAuthUser({
      email,
      password,
      role: "company",
      name: contactName,
    });

    if (!auth.ok) {
      const status = auth.code === "already_registered" ? 409 : 500;
      return NextResponse.json({ error: auth.message }, { status });
    }

    const company = await prisma.company.upsert({
      where: { name: companyName },
      create: {
        name: companyName,
        logoUrl: getCompanyLogoUrl(companyName),
        website: body.website?.trim() || undefined,
        status: CompanyStatus.Pending,
      },
      update: {
        website: body.website?.trim() || undefined,
      },
    });

    await prisma.account.upsert({
      where: { id: auth.userId },
      create: {
        id: auth.userId,
        email,
        name: contactName,
        role: "company",
        companyId: company.id,
      },
      update: {
        email,
        name: contactName,
        role: "company",
        companyId: company.id,
      },
    });

    const session = await buildSessionForUserId(auth.userId);
    const response = NextResponse.json({
      success: true,
      company: { id: company.id, name: company.name },
    });
    if (session) await setAuthSessionCookie(response, session);
    return response;
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
