-- CreateTable
CREATE TABLE "AIChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIChat_userId_idx" ON "AIChat"("userId");

-- CreateIndex
CREATE INDEX "AIChat_timestamp_idx" ON "AIChat"("timestamp");

-- AddForeignKey
ALTER TABLE "AIChat" ADD CONSTRAINT "AIChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
