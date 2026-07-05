import { randomUUID } from "crypto";
import { AuthCredentialRole, PrismaClient } from "@prisma/client";
import { applyTimeZoneEnv } from "../src/lib/timezone-env";
import { getCompanyLogoUrl } from "../src/lib/job-image";
import { hashPassword } from "../src/lib/auth/password";
import { seedDemoWorkflowData } from "./seed-demo-data";

applyTimeZoneEnv();

const prisma = new PrismaClient();

async function upsertCredential(
  email: string,
  password: string,
  role: AuthCredentialRole,
  preferredId?: string
) {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.authCredential.findUnique({ where: { email: normalized } });

  if (existing) {
    return existing.id;
  }

  const userId = preferredId ?? randomUUID();
  const row = await prisma.authCredential.create({
    data: {
      id: userId,
      email: normalized,
      passwordHash: await hashPassword(password),
      role,
    },
  });
  return row.id;
}

async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@jobswipe.app";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "JobSwipe2026!";
  const name = process.env.ADMIN_SEED_NAME ?? "システム管理者";
  const normalized = email.trim().toLowerCase();

  const existingAccount = await prisma.account.findUnique({ where: { email: normalized } });
  const existingCredential = await prisma.authCredential.findUnique({ where: { email: normalized } });

  if (existingCredential && existingAccount) {
    console.log(`Using existing admin account: ${email}`);
    return;
  }

  const userId = await upsertCredential(email, password, AuthCredentialRole.admin, existingAccount?.id);

  await prisma.account.upsert({
    where: { id: userId },
    create: { id: userId, email, name, role: "admin" },
    update: { email, name, role: "admin" },
  });
  console.log(`Synced admin credential + account: ${email}`);
}

async function seedCompany() {
  const email = process.env.COMPANY_SEED_EMAIL ?? "company@jobswipe.app";
  const password = process.env.COMPANY_SEED_PASSWORD ?? "JobSwipe2026!";
  const name = process.env.COMPANY_SEED_NAME ?? "採用担当者";
  const companyName = process.env.COMPANY_SEED_COMPANY_NAME ?? "テックスタート株式会社";
  const normalized = email.trim().toLowerCase();

  const company = await prisma.company.upsert({
    where: { name: companyName },
    create: { name: companyName, logoUrl: getCompanyLogoUrl(companyName) },
    update: {},
  });

  const existingAccount = await prisma.account.findUnique({ where: { email: normalized } });
  const existingCredential = await prisma.authCredential.findUnique({ where: { email: normalized } });

  if (existingCredential && existingAccount) {
    if (existingAccount.companyId !== company.id) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { companyId: company.id },
      });
    }
    console.log(`Using existing company account: ${email} → ${company.name}`);
    return;
  }

  const userId = await upsertCredential(email, password, AuthCredentialRole.company, existingAccount?.id);

  await prisma.account.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name,
      role: "company",
      companyId: company.id,
    },
    update: { email, name, role: "company", companyId: company.id },
  });
  console.log(`Synced company credential + account: ${email} → ${company.name}`);
}

async function linkSeekerProfiles() {
  const seekers = await prisma.seekerProfile.findMany({
    select: { id: true, email: true, supabaseUserId: true },
  });

  for (const seeker of seekers) {
    const credential = await prisma.authCredential.findUnique({
      where: { email: seeker.email.trim().toLowerCase() },
    });
    if (!credential || credential.role !== AuthCredentialRole.seeker) continue;
    if (seeker.supabaseUserId === credential.id) continue;

    await prisma.seekerProfile.update({
      where: { id: seeker.id },
      data: { supabaseUserId: credential.id },
    });
    console.log(`Linked seeker profile: ${seeker.email}`);
  }
}

async function main() {
  await seedAdmin();
  await seedCompany();
  await linkSeekerProfiles();
  await seedDemoWorkflowData(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
