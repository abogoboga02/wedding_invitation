"use server";

import { revalidatePath } from "next/cache";

import { createDefaultInvitation } from "@/features/invitation/invitation.service";
import { getInvitationTemplateSlug, isInvitationTemplate } from "@/features/invitation/templates/template-slugs";
import { getTemplateDisplayName, getTemplateSchema } from "@/features/invitation/templates/template-schema";
import { buildGeneratedInvitationCopy } from "@/features/invitation/generated-copy";
import { normalizeTemplateConfig } from "@/features/invitation/form/config";
import { requireAdminUser } from "@/lib/auth/guards";
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

export async function createClientFromAdminAction(formData: FormData) {
  await requireAdminUser();
  const admin = getSupabaseAdminClient();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const template = String(formData.get("template") ?? "").trim();

  if (!name || !email || password.length < 8 || !isInvitationTemplate(template)) {
    return;
  }

  const existingUser = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser.data?.id) {
    return;
  }

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
    },
    app_metadata: {
      role: "CLIENT",
    },
  });

  if (createUserError || !createdUser.user?.id) {
    return;
  }

  await admin.from("users").upsert(
    {
      id: createdUser.user.id,
      name,
      email,
      role: "CLIENT",
    },
    {
      onConflict: "id",
    },
  );

  await createDefaultInvitation(createdUser.user.id, name, admin, {
    template,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function updateClientTemplateAction(formData: FormData) {
  await requireAdminUser();
  const admin = getSupabaseAdminClient();
  const userId = String(formData.get("userId") ?? "").trim();
  const template = String(formData.get("template") ?? "").trim();

  if (!userId || !isInvitationTemplate(template)) {
    return;
  }

  const { data: invitation } = await admin
    .from("invitations")
    .select("id, template_config, partner_one_name, partner_two_name")
    .eq("owner_id", userId)
    .maybeSingle();

  if (!invitation?.id) {
    return;
  }

  const nextTemplateConfig = normalizeTemplateConfig(template, invitation.template_config);
  const generatedCopy = buildGeneratedInvitationCopy({
    templateSlug: getInvitationTemplateSlug(template),
    partnerOneName: invitation.partner_one_name,
    partnerTwoName: invitation.partner_two_name,
    config: nextTemplateConfig,
  });

  await admin
    .from("invitations")
    .update({
      template,
      template_name: getTemplateDisplayName(template),
      template_schema: getTemplateSchema(template),
      template_config: nextTemplateConfig,
      headline: generatedCopy.legacy.headline,
      subheadline: generatedCopy.legacy.subheadline,
      story: generatedCopy.legacy.story,
      closing_note: generatedCopy.legacy.closingNote,
    })
    .eq("id", invitation.id);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");
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

  revalidatePath("/admin/templates");
  revalidatePath("/admin/payments");
}
