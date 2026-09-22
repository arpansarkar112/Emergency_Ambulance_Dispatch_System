/*
  Warnings:

  - The primary key for the `Ambulance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `currentLat` on the `Ambulance` table. All the data in the column will be lost.
  - You are about to drop the column `currentLng` on the `Ambulance` table. All the data in the column will be lost.
  - The primary key for the `AuditLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Dispatch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EmergencyRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `destinationLat` on the `EmergencyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `destinationLng` on the `EmergencyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLat` on the `EmergencyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLng` on the `EmergencyRequest` table. All the data in the column will be lost.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `pickupAddress` to the `EmergencyRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ambulance" DROP CONSTRAINT "Ambulance_driverId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_ambulanceId_fkey";

-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_requestId_fkey";

-- DropForeignKey
ALTER TABLE "EmergencyRequest" DROP CONSTRAINT "EmergencyRequest_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "Ambulance" DROP CONSTRAINT "Ambulance_pkey",
DROP COLUMN "currentLat",
DROP COLUMN "currentLng",
ADD COLUMN     "currentAddress" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "driverId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Ambulance_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ambulance_id_seq";

-- AlterTable
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "entityId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AuditLog_id_seq";

-- AlterTable
ALTER TABLE "Dispatch" DROP CONSTRAINT "Dispatch_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "requestId" SET DATA TYPE TEXT,
ALTER COLUMN "ambulanceId" SET DATA TYPE TEXT,
ALTER COLUMN "driverId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Dispatch_id_seq";

-- AlterTable
ALTER TABLE "EmergencyRequest" DROP CONSTRAINT "EmergencyRequest_pkey",
DROP COLUMN "destinationLat",
DROP COLUMN "destinationLng",
DROP COLUMN "pickupLat",
DROP COLUMN "pickupLng",
ADD COLUMN     "destinationAddress" TEXT,
ADD COLUMN     "pickupAddress" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "patientId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EmergencyRequest_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EmergencyRequest_id_seq";

-- AlterTable
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "requestId" SET DATA TYPE TEXT,
ALTER COLUMN "patientId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Payment_id_seq";

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Profile_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Profile_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Ambulance" ADD CONSTRAINT "Ambulance_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EmergencyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "Ambulance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyRequest" ADD CONSTRAINT "EmergencyRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "EmergencyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
