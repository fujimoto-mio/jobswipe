import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import { companyLinkFormValues, companyLinksFromForm } from "@/lib/company-links";
import { prisma } from "@/lib/prisma";
import { getCompanyLogoUrl, isGeneratedCompanyLogo } from "@/lib/job-image";
import { API_ERRORS } from "@/lib/api-errors";

import { resolveStaffMediaFields } from "@/lib/storage/resolve-media";

async function staffProfileResponse(account: {
  role: string;
  companyId: string | null;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    website: string | null;
    postalCode: string | null;
    address: string | null;
    links: unknown;
  } | null;
}) {
  const linkFields = companyLinkFormValues(account.company?.links);
  return resolveStaffMediaFields({
    role: account.role,
    companyId: account.companyId,
    companyName: account.company?.name ?? null,
    companyLogoUrl: account.company?.logoUrl ?? null,
    companyBannerUrl: account.company?.bannerUrl ?? null,
    companyDescription: account.company?.description ?? null,
    companyWebsite: account.company?.website ?? null,
    companyPostalCode: account.company?.postalCode ?? null,
    companyAddress: account.company?.address ?? null,
    companyCareersPage: linkFields.careersPage || null,
    companyTwitter: linkFields.twitter || null,
    companyInstagram: linkFields.instagram || null,
    companyLinkedin: linkFields.linkedin || null,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatarUrl,
  });
}

export async function GET() {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const account = await prisma.account.findUnique({
    where: { id: staff.id },
    include: { company: true },
  });

  if (!account) {
    return NextResponse.json({ error: API_ERRORS.accountNotFound }, { status: 404 });
  }

  return NextResponse.json(await staffProfileResponse(account));
}

type StaffProfilePatchBody = {
  name?: string;
  companyName?: string;
  website?: string;
  description?: string;
  postalCode?: string;
  address?: string;
  careersPage?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  companyLogoUrl?: string | null;
  companyBannerUrl?: string | null;
  avatarUrl?: string | null;
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
      const rawPostal = body.postalCode?.trim();
      let formattedPostalCode: string | null = null;
      if (rawPostal) {
        const digits = rawPostal.replace(/\D/g, "");
        formattedPostalCode =
          digits.length === 7 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : rawPostal;
      }
      const address = body.address?.trim() || null;
      const logoFromBody = body.companyLogoUrl === undefined ? undefined : body.companyLogoUrl?.trim() || null;
      const bannerFromBody =
        body.companyBannerUrl === undefined ? undefined : body.companyBannerUrl?.trim() || null;
      const avatarFromBody = body.avatarUrl === undefined ? undefined : body.avatarUrl?.trim() || null;

      if (companyName !== existingCompany.name) {
        const conflict = await prisma.company.findUnique({ where: { name: companyName } });
        if (conflict && conflict.id !== existingCompany.id) {
          return NextResponse.json({ error: "この会社名は既に登録されています" }, { status: 409 });
        }
      }

      const companyData: {
        name: string;
        website: string | null;
        description: string | null;
        postalCode: string | null;
        address: string | null;
        links: ReturnType<typeof companyLinksFromForm>;
        logoUrl?: string | null;
        bannerUrl?: string | null;
      } = {
        name: companyName,
        website,
        description,
        postalCode: formattedPostalCode,
        address,
        links: companyLinksFromForm(body),
      };

      if (logoFromBody !== undefined) {
        companyData.logoUrl = logoFromBody;
      } else if (companyName !== existingCompany.name && isGeneratedCompanyLogo(existingCompany.logoUrl)) {
        companyData.logoUrl = getCompanyLogoUrl(companyName);
      }

      if (bannerFromBody !== undefined) {
        companyData.bannerUrl = bannerFromBody;
      }

      await prisma.$transaction([
        prisma.company.update({
          where: { id: existingCompany.id },
          data: companyData,
        }),
        prisma.account.update({
          where: { id: staff.id },
          data: {
            name,
            ...(avatarFromBody !== undefined ? { avatarUrl: avatarFromBody } : {}),
          },
        }),
      ]);

      const account = await prisma.account.findUnique({
        where: { id: staff.id },
        include: { company: true },
      });

      if (!account) {
        return NextResponse.json({ error: API_ERRORS.accountNotFound }, { status: 404 });
      }

      return NextResponse.json({ success: true, ...(await staffProfileResponse(account)) });
    }

    const account = await prisma.account.update({
      where: { id: staff.id },
      data: {
        name,
        ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl?.trim() || null } : {}),
      },
      include: { company: true },
    });

    return NextResponse.json({ success: true, ...(await staffProfileResponse(account)) });
  } catch (error) {
    console.error("[PATCH /api/admin/me]", error);
    const message = error instanceof Error ? error.message : API_ERRORS.invalidJson;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
