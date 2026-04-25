import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";
import type { PlanTier } from "@/lib/domain/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { unwrapList } from "@/lib/supabase/helpers";

export type TemplatePricingCatalogItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  preview: string;
  priceInIdr: number;
  isPremium: boolean;
};

export type PricingOrderInput = {
  selectedPackage: PlanTier;
  templateId: string;
};

export async function getTemplatePricingCatalog(): Promise<TemplatePricingCatalogItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("templates")
    .select(
      "template_id, template_name, template_slug, template_category, template_preview, template_price, is_premium",
    )
    .order("template_name", { ascending: true });

  if (error || !data || data.length === 0) {
    return TEMPLATE_OPTIONS.map((template) => ({
      id: template.id,
      name: template.label,
      slug: template.slug,
      category: template.category,
      preview: template.previewImage,
      priceInIdr: template.priceInIdr,
      isPremium: template.isPremium,
    }));
  }

  return data.map((template) => ({
    id: template.template_id,
    name: template.template_name,
    slug: template.template_slug,
    category: template.template_category,
    preview: template.template_preview,
    priceInIdr: template.template_price,
    isPremium: template.is_premium,
  }));
}

export async function createTemplateBasedPaymentOrder(
  userId: string,
  input: PricingOrderInput,
) {
  const supabase = await createServerSupabaseClient();
  const templates = await unwrapList(
    await supabase
      .from("templates")
      .select("template_id, template_name, template_price")
      .eq("template_id", input.templateId)
      .limit(1),
    "Template tidak ditemukan saat membuat order.",
  );

  const selectedTemplate = templates[0];
  if (!selectedTemplate) {
    throw new Error("Template tidak valid.");
  }

  const { error } = await supabase.from("payment_orders").insert({
    user_id: userId,
    status: "PENDING",
    template_id: selectedTemplate.template_id,
    template_name: selectedTemplate.template_name,
    template_price: selectedTemplate.template_price,
    selected_package: input.selectedPackage,
    amount_in_idr: selectedTemplate.template_price,
    currency: "IDR",
  });

  if (error) {
    throw new Error("Gagal membuat payment order.");
  }
}
