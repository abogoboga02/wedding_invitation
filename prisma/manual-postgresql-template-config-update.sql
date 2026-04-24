ALTER TABLE "Invitation"
ADD COLUMN IF NOT EXISTS "templateConfig" JSONB;
