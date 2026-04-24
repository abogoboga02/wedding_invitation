-- Jalankan file ini jika database sudah dibuat dari schema versi awal
-- sebelum plans, settings, payments, dan send logs ditambahkan.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlanTier') THEN
    CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'SIGNATURE', 'STUDIO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SendChannel') THEN
    CREATE TYPE "SendChannel" AS ENUM ('MANUAL', 'WHATSAPP', 'EMAIL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SendLogStatus') THEN
    CREATE TYPE "SendLogStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "InvitationSetting" (
  "id" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'id-ID',
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  "isRsvpEnabled" BOOLEAN NOT NULL DEFAULT true,
  "isWishEnabled" BOOLEAN NOT NULL DEFAULT true,
  "autoPlayMusic" BOOLEAN NOT NULL DEFAULT true,
  "preferredSendChannel" "SendChannel" NOT NULL DEFAULT 'MANUAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvitationSetting_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InvitationSetting_invitationId_key" UNIQUE ("invitationId"),
  CONSTRAINT "InvitationSetting_invitationId_fkey"
    FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Plan" (
  "id" TEXT NOT NULL,
  "tier" "PlanTier" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priceInIdr" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Plan_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Plan_tier_key" UNIQUE ("tier")
);

CREATE TABLE IF NOT EXISTS "UserSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "autoRenew" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "UserSubscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserSubscription_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "Plan"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PaymentOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "invitationId" TEXT,
  "planId" TEXT,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amountInIdr" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'IDR',
  "provider" TEXT,
  "externalReference" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentOrder_externalReference_key" UNIQUE ("externalReference"),
  CONSTRAINT "PaymentOrder_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PaymentOrder_invitationId_fkey"
    FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PaymentOrder_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "Plan"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SendLog" (
  "id" TEXT NOT NULL,
  "invitationId" TEXT NOT NULL,
  "guestId" TEXT,
  "channel" "SendChannel" NOT NULL DEFAULT 'MANUAL',
  "status" "SendLogStatus" NOT NULL DEFAULT 'QUEUED',
  "recipient" TEXT NOT NULL,
  "provider" TEXT,
  "providerMessageId" TEXT,
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SendLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SendLog_invitationId_fkey"
    FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SendLog_guestId_fkey"
    FOREIGN KEY ("guestId") REFERENCES "Guest"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserSubscription_userId_status_idx"
  ON "UserSubscription"("userId", "status");
CREATE INDEX IF NOT EXISTS "UserSubscription_planId_status_idx"
  ON "UserSubscription"("planId", "status");
CREATE INDEX IF NOT EXISTS "PaymentOrder_userId_status_createdAt_idx"
  ON "PaymentOrder"("userId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "PaymentOrder_invitationId_status_idx"
  ON "PaymentOrder"("invitationId", "status");
CREATE INDEX IF NOT EXISTS "SendLog_invitationId_createdAt_idx"
  ON "SendLog"("invitationId", "createdAt");
CREATE INDEX IF NOT EXISTS "SendLog_guestId_createdAt_idx"
  ON "SendLog"("guestId", "createdAt");
CREATE INDEX IF NOT EXISTS "SendLog_status_createdAt_idx"
  ON "SendLog"("status", "createdAt");

INSERT INTO "InvitationSetting" (
  "id",
  "invitationId",
  "locale",
  "timezone",
  "isRsvpEnabled",
  "isWishEnabled",
  "autoPlayMusic",
  "preferredSendChannel",
  "createdAt",
  "updatedAt"
)
SELECT
  'iset_' || REPLACE(i."id", '-', ''),
  i."id",
  'id-ID',
  'Asia/Jakarta',
  true,
  true,
  true,
  'MANUAL',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Invitation" i
WHERE NOT EXISTS (
  SELECT 1
  FROM "InvitationSetting" s
  WHERE s."invitationId" = i."id"
);
