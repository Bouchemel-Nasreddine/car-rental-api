-- CreateEnum
CREATE TYPE "GearType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('DISC', 'DRUM', 'HYDRAULIC', 'ANTILOCK', 'MECHANICAL', 'REGENERATIVE');

-- CreateEnum
CREATE TYPE "CarType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'MINIVAN', 'JEEP', 'OTHER');

-- CreateTable
CREATE TABLE "GearBoxType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "remark" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GearBoxType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "carType" "CarType" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "fuelCapacity" DOUBLE PRECISION NOT NULL,
    "fuelEfficiency" INTEGER NOT NULL,
    "gearType" "GearType" NOT NULL,
    "breakType" "BreakType" NOT NULL,
    "remark" TEXT DEFAULT '',
    "rentPrice" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "seats" INTEGER NOT NULL,
    "doors" INTEGER NOT NULL,
    "airCondition" BOOLEAN NOT NULL,
    "bluetooth" BOOLEAN NOT NULL,
    "usb" BOOLEAN NOT NULL,
    "gps" BOOLEAN NOT NULL,
    "radio" BOOLEAN NOT NULL,
    "aux" BOOLEAN NOT NULL,
    "childSeat" BOOLEAN NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);
