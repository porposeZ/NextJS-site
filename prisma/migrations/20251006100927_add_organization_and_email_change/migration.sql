/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `middleName` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EmailChangeToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailChangeToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "phone" TEXT,
    "defaultCity" TEXT,
    "notifyOnStatusChange" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnPayment" BOOLEAN NOT NULL DEFAULT true,
    "organization" TEXT
);
INSERT INTO "new_User" ("defaultCity", "email", "emailVerified", "id", "image", "name", "notifyOnPayment", "notifyOnStatusChange", "organization", "phone") SELECT "defaultCity", "email", "emailVerified", "id", "image", "name", "notifyOnPayment", "notifyOnStatusChange", "organization", "phone" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EmailChangeToken_token_key" ON "EmailChangeToken"("token");

-- CreateIndex
CREATE INDEX "EmailChangeToken_userId_expires_idx" ON "EmailChangeToken"("userId", "expires");
