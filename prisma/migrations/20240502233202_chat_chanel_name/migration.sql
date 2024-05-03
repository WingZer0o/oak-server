/*
  Warnings:

  - Added the required column `chatChannelName` to the `ChatChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatChannel" ADD COLUMN     "chatChannelName" TEXT NOT NULL;
