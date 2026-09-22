/*
  Warnings:

  - Made the column `currentAddress` on table `Ambulance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `destinationAddress` on table `EmergencyRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ambulance" ALTER COLUMN "currentAddress" SET NOT NULL;

-- AlterTable
ALTER TABLE "EmergencyRequest" ALTER COLUMN "destinationAddress" SET NOT NULL;
