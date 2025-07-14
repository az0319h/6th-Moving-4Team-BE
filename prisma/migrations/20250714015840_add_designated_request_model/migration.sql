/*
  Warnings:

  - You are about to drop the column `estimateId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `isDesignated` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `moverId` on the `Request` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Estimate_clientId_idx";

-- DropIndex
DROP INDEX "Request_estimateId_key";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "estimateId",
DROP COLUMN "isDesignated",
DROP COLUMN "moverId";

-- CreateTable
CREATE TABLE "DesignatedRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "moverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignatedRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignatedRequest_requestId_moverId_key" ON "DesignatedRequest"("requestId", "moverId");

-- AddForeignKey
ALTER TABLE "DesignatedRequest" ADD CONSTRAINT "DesignatedRequest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignatedRequest" ADD CONSTRAINT "DesignatedRequest_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
