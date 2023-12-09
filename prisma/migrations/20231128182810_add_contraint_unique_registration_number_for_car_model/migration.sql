/*
  Warnings:

  - A unique constraint covering the columns `[registrationNumber]` on the table `Car` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Car_registrationNumber_key" ON "Car"("registrationNumber");
