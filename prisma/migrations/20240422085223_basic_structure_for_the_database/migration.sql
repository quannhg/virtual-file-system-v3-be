-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(511) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "githubUsername" VARCHAR(255),
    "phone" VARCHAR(255),
    "birthdate" INTEGER,
    "avatarUrl" VARCHAR(255),
    "gender" "Gender",
    "urls" TEXT[],
    "joinedAt" INTEGER NOT NULL,
    "leaveAt" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
