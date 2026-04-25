-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateSlug" TEXT NOT NULL,
    "templateCategory" TEXT NOT NULL,
    "templatePreview" TEXT NOT NULL,
    "templatePrice" INTEGER NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "PaymentOrder"
ADD COLUMN     "templateRefId" TEXT,
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "templateName" TEXT,
ADD COLUMN     "templatePrice" INTEGER,
ADD COLUMN     "selectedPackage" "PlanTier";

-- CreateIndex
CREATE UNIQUE INDEX "Template_templateId_key" ON "Template"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_templateSlug_key" ON "Template"("templateSlug");

-- CreateIndex
CREATE INDEX "PaymentOrder_templateRefId_status_idx" ON "PaymentOrder"("templateRefId", "status");

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_templateRefId_fkey" FOREIGN KEY ("templateRefId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
