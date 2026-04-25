"use server";

import { revalidatePath } from "next/cache";

import { requireClientUser } from "@/lib/auth/guards";
import { PLAN_TIERS } from "@/lib/domain/types";
import { createTemplateBasedPaymentOrder } from "@/features/pricing/pricing.service";

export type PricingOrderActionState = {
  error?: string;
  success?: string;
};

export async function submitTemplatePricingOrderAction(
  _prevState: PricingOrderActionState,
  formData: FormData,
): Promise<PricingOrderActionState> {
  const user = await requireClientUser();
  const templateId = String(formData.get("templateId") ?? "").trim();
  const selectedPackage = String(formData.get("selectedPackage") ?? "").trim();

  if (!templateId) {
    return { error: "Pilih template terlebih dahulu untuk melihat dan mengunci harga." };
  }

  if (!PLAN_TIERS.includes(selectedPackage as (typeof PLAN_TIERS)[number])) {
    return { error: "Paket tidak valid. Pilih Starter, Signature, atau Studio." };
  }

  try {
    await createTemplateBasedPaymentOrder(user.id, {
      templateId,
      selectedPackage: selectedPackage as (typeof PLAN_TIERS)[number],
    });
  } catch {
    return { error: "Order belum berhasil dibuat. Silakan coba lagi." };
  }

  revalidatePath("/pricing");

  return {
    success:
      "Order berhasil dibuat. Harga utama mengikuti template yang Anda pilih, paket hanya menentukan fitur.",
  };
}
