/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `Email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "password",
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "Id" SERIAL NOT NULL,
ADD COLUMN     "Password" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("Id");

-- CreateTable
CREATE TABLE "ChatChannel" (
    "Id" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "ChatChannel_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "Id" SERIAL NOT NULL,
    "Message" TEXT NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL,
    "IsChatBot" BOOLEAN NOT NULL,
    "ChatHistoryId" INTEGER NOT NULL,
    "UserId" INTEGER,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ChatChannel" ADD CONSTRAINT "ChatChannel_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_ChatHistoryId_fkey" FOREIGN KEY ("ChatHistoryId") REFERENCES "ChatChannel"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
