-- CreateEnum
CREATE TYPE "AuthCredentialRole" AS ENUM ('seeker', 'company', 'admin');

-- AlterTable
ALTER TABLE "auth_credentials"
  ALTER COLUMN "role" TYPE "AuthCredentialRole" USING ("role"::"AuthCredentialRole");
