-- CreateTable
CREATE TABLE "public"."user_credits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "thumbnailsRemaining" INTEGER NOT NULL DEFAULT 0,
    "regeneratesRemaining" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "hasUsedFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."thumbnail_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctrScore" DOUBLE PRECISION,
    "ctrAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thumbnail_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."regenerate_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regenerate_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_credits_userId_key" ON "public"."user_credits"("userId");

-- AddForeignKey
ALTER TABLE "public"."thumbnail_history" ADD CONSTRAINT "thumbnail_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user_credits"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
