/*
  Warnings:

  - You are about to drop the column `verifyEmailToken` on the `VerifyEmail` table. All the data in the column will be lost.
  - Added the required column `tokenHash` to the `VerifyEmail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `VerifyEmail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerifyEmail" DROP COLUMN "verifyEmailToken",
ADD COLUMN     "tokenHash" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
