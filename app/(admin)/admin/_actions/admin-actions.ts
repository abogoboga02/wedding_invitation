"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/guards";
import { PRICING_PLANS } from "@/lib/constants/pricing";
import { prisma } from "@/lib/db/prisma";

export async function updateUserRoleAction(formData: FormData) {
  await requireAdminUser();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as "ADMIN" | "CLIENT";

  if (!userId || !["ADMIN", "CLIENT"].includes(role)) {
    return;
  }

  if (role === "CLIENT") {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (currentUser?.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return;
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function toggleInvitationStatusAction(formData: FormData) {
  await requireAdminUser();
  const invitationId = String(formData.get("invitationId") ?? "");
  const status = String(formData.get("status") ?? "") as "DRAFT" | "PUBLISHED";

  if (!invitationId || !["DRAFT", "PUBLISHED"].includes(status)) {
    return;
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/invitations");
}

export async function syncPlanCatalogAction() {
  await requireAdminUser();

  await Promise.all(
    PRICING_PLANS.map((plan, index) =>
      prisma.plan.upsert({
        where: { tier: plan.tier },
        update: {
          name: plan.name,
          description: plan.caption,
          priceInIdr: plan.priceInIdr,
          isActive: true,
          sortOrder: index,
        },
        create: {
          tier: plan.tier,
          name: plan.name,
          description: plan.caption,
          priceInIdr: plan.priceInIdr,
          isActive: true,
          sortOrder: index,
        },
      }),
    ),
  );

  revalidatePath("/admin/templates");
  revalidatePath("/admin/payments");
}
