-- AlterTable
ALTER TABLE "User" ALTER COLUMN "credentialId" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
