-- CreateTable
CREATE TABLE "EmailRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "EmailRequest_email_createdAt_idx" ON "EmailRequest"("email", "createdAt");
