"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/guards";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";
import { PRICING_PLANS } from "@/lib/constants/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateUserRoleAction(formData: FormData) {
  await requireAdminUser();
  const admin = getSupabaseAdminClient();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as "ADMIN" | "CLIENT";

  if (!userId || !["ADMIN", "CLIENT"].includes(role)) {
    return;
  }

  if (role === "CLIENT") {
    const { data: currentUser } = await admin
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (currentUser?.role === "ADMIN") {
      const adminCount = await admin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "ADMIN");

      if ((adminCount.count ?? 0) <= 1) {
        return;
      }
    }
  }

  await admin
    .from("users")
    .update({ role })
    .eq("id", userId);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function toggleInvitationStatusAction(formData: FormData) {
  await requireAdminUser();
  const admin = getSupabaseAdminClient();
  const invitationId = String(formData.get("invitationId") ?? "");
  const status = String(formData.get("status") ?? "") as "DRAFT" | "PUBLISHED";

  if (!invitationId || !["DRAFT", "PUBLISHED"].includes(status)) {
    return;
  }

  await admin
    .from("invitations")
    .update({
      status,
      published_at: status === "PUBLISHED" ? new Date().toISOString() : null,
    })
    .eq("id", invitationId);

  revalidatePath("/admin");
  revalidatePath("/admin/invitations");
}

export async function syncPlanCatalogAction() {
  await requireAdminUser();
  const admin = getSupabaseAdminClient();

  await admin.from("plans").upsert(
    PRICING_PLANS.map((plan, index) => ({
      tier: plan.tier,
      name: plan.name,
      description: plan.caption,
      price_in_idr: plan.priceInIdr,
      is_active: true,
      sort_order: index,
    })),
    {
      onConflict: "tier",
    },
  );

  await admin.from("templates").upsert(
    TEMPLATE_OPTIONS.map((template) => ({
      template_id: template.id,
      template_name: template.label,
      template_slug: template.slug,
      template_category: template.category,
      template_preview: template.previewImage,
      template_price: template.priceInIdr,
      is_premium: template.isPremium,
      is_active: true,
    })),
    {
      onConflict: "template_id",
    },
  );

  revalidatePath("/admin/templates");
  revalidatePath("/admin/payments");
  revalidatePath("/pricing");
}
