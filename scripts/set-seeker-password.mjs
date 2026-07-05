import { AuthCredentialRole, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/set-seeker-password.mjs <email> <password>");
  process.exit(1);
}

const prisma = new PrismaClient();
const normalized = email.trim().toLowerCase();

try {
  const seeker = await prisma.seekerProfile.findUnique({ where: { email: normalized } });
  if (!seeker) {
    console.error("Seeker not found:", normalized);
    process.exit(1);
  }

  console.log("Seeker:", seeker.id, seeker.name, "authId:", seeker.supabaseUserId);

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = seeker.supabaseUserId;

  const cred = await prisma.authCredential.upsert({
    where: { email: normalized },
    create: { id: userId, email: normalized, passwordHash, role: AuthCredentialRole.seeker },
    update: { passwordHash, role: AuthCredentialRole.seeker },
  });

  if (seeker.supabaseUserId !== cred.id) {
    await prisma.seekerProfile.update({
      where: { id: seeker.id },
      data: { supabaseUserId: cred.id },
    });
    console.log("Linked seeker profile to credential:", cred.id);
  }

  console.log("Password updated for", normalized);
} finally {
  await prisma.$disconnect();
}
