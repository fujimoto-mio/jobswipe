import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { applyTimeZoneEnv } from "../src/lib/timezone-env";
import { getCompanyLogoUrl } from "../src/lib/job-image";

applyTimeZoneEnv();

const prisma = new PrismaClient();

async function seedAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@jobswipe.app";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "JobSwipe2026!";
  const name = process.env.ADMIN_SEED_NAME ?? "システム管理者";

  if (!url || !serviceKey) {
    console.log("Skip admin seed: SUPABASE_SERVICE_ROLE_KEY not set");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);

  let userId = existing?.id;

  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { name },
    });
    if (error) throw error;
    userId = data.user?.id;
    console.log(`Created admin auth user: ${email}`);
  } else {
    await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { role: "admin" },
    });
    console.log(`Admin auth user already exists: ${email}`);
  }

  if (userId) {
    await prisma.account.upsert({
      where: { id: userId },
      create: { id: userId, email, name, role: "admin" },
      update: { email, name, role: "admin" },
    });
    console.log(`Synced accounts table for admin: ${email}`);
  }
}

async function seedCompany() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.COMPANY_SEED_EMAIL ?? "company@jobswipe.app";
  const password = process.env.COMPANY_SEED_PASSWORD ?? "JobSwipe2026!";
  const name = process.env.COMPANY_SEED_NAME ?? "採用担当者";
  const companyName = process.env.COMPANY_SEED_COMPANY_NAME ?? "テックスタート株式会社";

  if (!url || !serviceKey) {
    console.log("Skip company seed: SUPABASE_SERVICE_ROLE_KEY not set");
    return;
  }

  const company = await prisma.company.upsert({
    where: { name: companyName },
    create: { name: companyName, logoUrl: getCompanyLogoUrl(companyName) },
    update: {},
  });

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);

  let userId = existing?.id;

  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "company" },
      user_metadata: { name },
    });
    if (error) throw error;
    userId = data.user?.id;
    console.log(`Created company auth user: ${email}`);
  } else {
    await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { role: "company" },
    });
    console.log(`Company auth user already exists: ${email}`);
  }

  if (userId) {
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
    console.log(`Synced accounts table for company: ${email} → ${company.name}`);
  }
}

async function main() {
  console.log("Seeding JobSwipe (auth accounts only — jobs come from admin API)...");
  await seedAdmin();
  await seedCompany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
