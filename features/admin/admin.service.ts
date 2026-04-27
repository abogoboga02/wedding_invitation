import { validateInvitationPublishability } from "@/features/invitation/invitation.service";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TableRow } from "@/lib/supabase/database.types";
import { unwrapList } from "@/lib/supabase/helpers";

type AdminClient = ReturnType<typeof getSupabaseAdminClient>;
type InvitationRow = TableRow<"invitations">;
type EventSlotRow = TableRow<"event_slots">;
type GuestRow = TableRow<"guests">;
type GalleryImageRow = TableRow<"gallery_images">;
type RsvpRow = TableRow<"rsvps">;
type TemplateRow = TableRow<"templates">;
type PaymentOrderRow = TableRow<"payment_orders">;
type AdminOverviewPaymentRow = Pick<
  PaymentOrderRow,
  "id" | "user_id" | "status" | "amount_in_idr" | "template_name" | "selected_package" | "created_at"
>;

type AdminOverviewInvitationRow = Pick<
  InvitationRow,
  | "id"
  | "owner_id"
  | "couple_slug"
  | "partner_one_name"
  | "partner_two_name"
  | "status"
  | "template"
  | "template_name"
  | "cover_image_url"
  | "published_at"
  | "created_at"
  | "updated_at"
> & {
  event_slots?: Array<
    Pick<EventSlotRow, "id" | "starts_at" | "venue_name" | "address" | "latitude" | "longitude">
  > | null;
  guests?:
    | Array<
        Pick<GuestRow, "id" | "guest_slug"> & {
          rsvps?: Pick<RsvpRow, "id" | "status" | "attendees"> | Array<Pick<RsvpRow, "id" | "status" | "attendees">> | null;
        }
      >
    | null;
  gallery_images?: Array<Pick<GalleryImageRow, "id">> | null;
};

export type AdminOverviewData = {
  users: number;
  clients: number;
  admins: number;
  activeClients: number;
  invitations: number;
  published: number;
  drafts: number;
  guests: number;
  rsvps: number;
  needsSetup: number;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "CLIENT";
    createdAt: Date;
  }>;
  latestOrders: Array<{
    id: string;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    amountInIdr: number;
    templateName: string | null;
    selectedPackage: "STARTER" | "SIGNATURE" | "STUDIO" | null;
    createdAt: Date;
    userName: string | null;
    userEmail: string;
  }>;
  actionRequiredClients: Array<{
    id: string;
    userName: string | null;
    userEmail: string;
    coupleSlug: string;
    status: "DRAFT" | "PUBLISHED";
    issues: string[];
  }>;
  recentPublishes: Array<{
    id: string;
    coupleSlug: string;
    partnerOneName: string;
    partnerTwoName: string;
    publishedAt: Date;
    status: "DRAFT" | "PUBLISHED";
    ownerEmail: string;
  }>;
  templateSummary: {
    total: number;
    active: number;
    draft: number;
    inactive: number;
    premium: number;
    regular: number;
    mostUsed: {
      templateId: string;
      templateName: string;
      usageCount: number;
    } | null;
  };
  revenueSummary: {
    paidRevenue: number;
    pendingRevenue: number;
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
  };
  globalRsvpStats: {
    totalGuests: number;
    totalRsvps: number;
    responseRate: number;
    attending: number;
    maybe: number;
    declined: number;
  };
};

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "CLIENT";
  createdAt: Date;
  invitation: {
    id: string;
    coupleSlug: string;
    status: "DRAFT" | "PUBLISHED";
    template: string;
    templateName: string | null;
  } | null;
};

export type AdminInvitationRow = {
  id: string;
  coupleSlug: string;
  partnerOneName: string;
  partnerTwoName: string;
  template: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: Date;
  owner: {
    name: string | null;
    email: string;
  };
  guestCount: number;
  wishCount: number;
};

export type AdminGuestRow = {
  id: string;
  name: string;
  guestSlug: string;
  phone: string | null;
  email: string | null;
  source: "MANUAL" | "CSV";
  createdAt: Date;
  invitation: {
    coupleSlug: string;
    partnerOneName: string;
    partnerTwoName: string;
    ownerEmail: string;
  };
  rsvp: {
    status: "ATTENDING" | "MAYBE" | "DECLINED";
    attendees: number;
  } | null;
};

export type AdminRsvpRow = {
  id: string;
  respondentName: string | null;
  status: "ATTENDING" | "MAYBE" | "DECLINED";
  attendees: number;
  note: string | null;
  respondedAt: Date;
  guest: {
    name: string;
    guestSlug: string;
    invitation: {
      coupleSlug: string;
      partnerOneName: string;
      partnerTwoName: string;
    };
  };
};

export type AdminSendLogRow = {
  id: string;
  channel: "MANUAL" | "WHATSAPP" | "EMAIL";
  status: "QUEUED" | "SENT" | "FAILED";
  recipient: string;
  createdAt: Date;
  invitationCoupleSlug: string;
  guestName: string | null;
};

export type AdminPaymentsData = {
  plans: Array<{
    id: string;
    tier: "STARTER" | "SIGNATURE" | "STUDIO";
    name: string;
    description: string;
    priceInIdr: number;
  }>;
  payments: Array<{
    id: string;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    amountInIdr: number;
    templateName: string | null;
    selectedPackage: "STARTER" | "SIGNATURE" | "STUDIO" | null;
    userName: string | null;
    userEmail: string;
  }>;
  subscriptions: Array<{
    id: string;
    status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELED";
    userName: string | null;
    userEmail: string;
    planName: string;
  }>;
};

export type AdminSettingsSnapshot = {
  invitationSettingsCount: number;
  rsvpEnabledCount: number;
  wishEnabledCount: number;
};

function firstEmbeddedRow<T>(value?: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function embeddedRows<T>(value?: T | T[] | null) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function resolvePaymentIssueLabel(status: PaymentOrderRow["status"] | null | undefined) {
  if (status === "PENDING") {
    return "Pembayaran masih pending";
  }

  if (status === "FAILED") {
    return "Pembayaran gagal";
  }

  if (status === "REFUNDED") {
    return "Pembayaran sudah direfund";
  }

  return null;
}

function getFallbackTemplateRows(): TemplateRow[] {
  const now = new Date().toISOString();

  return TEMPLATE_OPTIONS.map((template) => ({
    id: template.id,
    template_id: template.id,
    template_name: template.label,
    template_slug: template.slug,
    template_category: template.category,
    template_preview: template.previewImage,
    template_price: template.priceInIdr,
    is_premium: template.isPremium,
    is_active: true,
    created_at: now,
    updated_at: now,
  }));
}

async function getUserMap(client: AdminClient) {
  const users = await unwrapList(
    await client.from("users").select("id, name, email, role, created_at"),
    "Gagal mengambil data pengguna admin.",
  );

  return new Map(
    users.map((user) => [
      user.id,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
      },
    ]),
  );
}

export async function getInvitationSendLogs(invitationId: string, limit = 8) {
  const client = getSupabaseAdminClient();
  const logRows = await unwrapList(
    await client
      .from("send_logs")
      .select("id, channel, status, recipient, guest_id, created_at")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false })
      .limit(limit),
    "Gagal mengambil riwayat distribusi invitation.",
  );

  const guestIds = [
    ...new Set(
      logRows
        .map((log) => log.guest_id)
        .filter((guestId): guestId is string => Boolean(guestId)),
    ),
  ];
  const guestRows =
    guestIds.length > 0
      ? await unwrapList(
          await client.from("guests").select("id, name").in("id", guestIds),
          "Gagal mengambil data tamu untuk send log.",
        )
      : [];

  const guestMap = new Map(guestRows.map((guest) => [guest.id, guest.name]));

  return logRows.map((log) => ({
    id: log.id,
    channel: log.channel,
    status: log.status,
    recipient: log.recipient,
    createdAt: new Date(log.created_at),
    guestName: log.guest_id ? (guestMap.get(log.guest_id) ?? null) : null,
  }));
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const client = getSupabaseAdminClient();
  const userMap = await getUserMap(client);
  const [invitationRows, templateRowsRaw, paymentRows] = await Promise.all([
    unwrapList<AdminOverviewInvitationRow>(
      await client
        .from("invitations")
        .select(
          "id, owner_id, couple_slug, partner_one_name, partner_two_name, status, template, template_name, cover_image_url, published_at, created_at, updated_at, event_slots (id, starts_at, venue_name, address, latitude, longitude), gallery_images (id), guests (id, guest_slug, rsvps (id, status, attendees))",
        )
        .order("updated_at", { ascending: false }),
      "Gagal mengambil ringkasan invitation admin.",
    ),
    unwrapList(
      await client
        .from("templates")
        .select(
          "id, template_id, template_name, template_slug, template_category, template_preview, template_price, is_premium, is_active, created_at, updated_at",
        )
        .order("template_name", { ascending: true }),
      "Gagal mengambil katalog template admin.",
    ),
    unwrapList<AdminOverviewPaymentRow>(
      await client
        .from("payment_orders")
        .select(
          "id, user_id, status, amount_in_idr, template_name, selected_package, created_at",
        )
        .order("created_at", { ascending: false }),
      "Gagal mengambil data order pembayaran admin.",
    ),
  ]);

  const templateRows = templateRowsRaw.length > 0 ? templateRowsRaw : getFallbackTemplateRows();
  const clients = [...userMap.values()].filter((user) => user.role === "CLIENT");
  const recentUsers = [...userMap.values()]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 5);
  const activeClients = new Set(invitationRows.map((invitation) => invitation.owner_id)).size;
  const latestPaymentByUserId = new Map<string, AdminOverviewPaymentRow>();
  const templateUsageMap = new Map<string, number>();

  paymentRows.forEach((payment) => {
    if (!latestPaymentByUserId.has(payment.user_id)) {
      latestPaymentByUserId.set(payment.user_id, payment);
    }
  });

  const invitationSummaries = invitationRows.map((invitation) => {
    const guests = embeddedRows(invitation.guests);
    const eventSlots = embeddedRows(invitation.event_slots).map((eventSlot) => ({
      id: eventSlot.id,
      startsAt: eventSlot.starts_at,
      venueName: eventSlot.venue_name,
      address: eventSlot.address,
      latitude: eventSlot.latitude,
      longitude: eventSlot.longitude,
    }));
    const publishValidation = validateInvitationPublishability({
      partnerOneName: invitation.partner_one_name,
      partnerTwoName: invitation.partner_two_name,
      coupleSlug: invitation.couple_slug,
      template: invitation.template,
      eventSlots,
      guests: guests.map((guest) => ({ id: guest.id })),
    });
    const galleryCount = embeddedRows(invitation.gallery_images).length;

    templateUsageMap.set(
      invitation.template,
      (templateUsageMap.get(invitation.template) ?? 0) + 1,
    );

    const checklistState = new Set(
      publishValidation.checklist.filter((item) => !item.isComplete).map((item) => item.id),
    );
    const issues: string[] = [];

    if (
      checklistState.has("couple-name") ||
      checklistState.has("event-date") ||
      checklistState.has("primary-location")
    ) {
      issues.push("Detail undangan belum lengkap");
    }

    if (checklistState.has("guest-list")) {
      issues.push("Belum tambah tamu");
    }

    if (checklistState.has("template")) {
      issues.push("Belum pilih template");
    }

    if (!invitation.cover_image_url && galleryCount === 0) {
      issues.push("Belum upload foto/media");
    }

    const paymentIssue = resolvePaymentIssueLabel(
      latestPaymentByUserId.get(invitation.owner_id)?.status,
    );
    if (paymentIssue) {
      issues.push(paymentIssue);
    }

    return {
      invitation,
      publishValidation,
      guestCount: guests.length,
      rsvpRows: guests
        .map((guest) => firstEmbeddedRow(guest.rsvps))
        .filter(Boolean) as Array<Pick<RsvpRow, "id" | "status" | "attendees">>,
      issues,
      galleryCount,
      hasSetupIssue:
        !publishValidation.isValid || (!invitation.cover_image_url && galleryCount === 0),
    };
  });

  const totalGuests = invitationSummaries.reduce((sum, item) => sum + item.guestCount, 0);
  const allRsvps = invitationSummaries.flatMap((item) => item.rsvpRows);
  const totalRsvps = allRsvps.length;
  const attending = allRsvps.filter((rsvp) => rsvp.status === "ATTENDING").length;
  const maybe = allRsvps.filter((rsvp) => rsvp.status === "MAYBE").length;
  const declined = allRsvps.filter((rsvp) => rsvp.status === "DECLINED").length;
  const mostUsedTemplateEntry = [...templateUsageMap.entries()].sort((left, right) => right[1] - left[1])[0];
  const templateNameById = new Map(templateRows.map((template) => [template.template_id, template.template_name]));
  const actionRequiredClients = invitationSummaries
    .filter((item) => item.issues.length > 0)
    .slice(0, 6)
    .map((item) => ({
      id: item.invitation.id,
      userName: userMap.get(item.invitation.owner_id)?.name ?? null,
      userEmail: userMap.get(item.invitation.owner_id)?.email ?? "-",
      coupleSlug: item.invitation.couple_slug,
      status: item.invitation.status,
      issues: item.issues,
    }));

  return {
    users: userMap.size,
    clients: clients.length,
    admins: [...userMap.values()].filter((user) => user.role === "ADMIN").length,
    activeClients,
    invitations: invitationRows.length,
    published: invitationRows.filter((invitation) => invitation.status === "PUBLISHED").length,
    drafts: invitationRows.filter((invitation) => invitation.status === "DRAFT").length,
    guests: totalGuests,
    rsvps: totalRsvps,
    needsSetup: invitationSummaries.filter((item) => item.hasSetupIssue).length,
    recentUsers,
    latestOrders: paymentRows.slice(0, 6).map((payment) => ({
      id: payment.id,
      status: payment.status,
      amountInIdr: payment.amount_in_idr,
      templateName: payment.template_name,
      selectedPackage: payment.selected_package,
      createdAt: new Date(payment.created_at),
      userName: userMap.get(payment.user_id)?.name ?? null,
      userEmail: userMap.get(payment.user_id)?.email ?? "-",
    })),
    actionRequiredClients,
    recentPublishes: invitationRows
      .filter((invitation) => invitation.published_at)
      .sort(
        (left, right) =>
          new Date(right.published_at ?? 0).getTime() - new Date(left.published_at ?? 0).getTime(),
      )
      .slice(0, 6)
      .map((invitation) => ({
        id: invitation.id,
        coupleSlug: invitation.couple_slug,
        partnerOneName: invitation.partner_one_name,
        partnerTwoName: invitation.partner_two_name,
        publishedAt: new Date(invitation.published_at!),
        status: invitation.status,
        ownerEmail: userMap.get(invitation.owner_id)?.email ?? "-",
      })),
    templateSummary: {
      total: templateRows.length,
      active: templateRows.filter((template) => template.is_active).length,
      draft: 0,
      inactive: templateRows.filter((template) => !template.is_active).length,
      premium: templateRows.filter((template) => template.is_premium).length,
      regular: templateRows.filter((template) => !template.is_premium).length,
      mostUsed: mostUsedTemplateEntry
        ? {
            templateId: mostUsedTemplateEntry[0],
            templateName:
              templateNameById.get(mostUsedTemplateEntry[0]) ?? mostUsedTemplateEntry[0],
            usageCount: mostUsedTemplateEntry[1],
          }
        : null,
    },
    revenueSummary: {
      paidRevenue: paymentRows
        .filter((payment) => payment.status === "PAID")
        .reduce((sum, payment) => sum + payment.amount_in_idr, 0),
      pendingRevenue: paymentRows
        .filter((payment) => payment.status === "PENDING")
        .reduce((sum, payment) => sum + payment.amount_in_idr, 0),
      totalOrders: paymentRows.length,
      paidOrders: paymentRows.filter((payment) => payment.status === "PAID").length,
      pendingOrders: paymentRows.filter((payment) => payment.status === "PENDING").length,
    },
    globalRsvpStats: {
      totalGuests,
      totalRsvps,
      responseRate: totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0,
      attending,
      maybe,
      declined,
    },
  };
}

export async function getAdminUsers() {
  const client = getSupabaseAdminClient();
  const [users, invitations] = await Promise.all([
    unwrapList(
      await client
        .from("users")
        .select("id, name, email, role, created_at")
        .order("created_at", { ascending: false }),
      "Gagal mengambil daftar user admin.",
    ),
    unwrapList(
      await client.from("invitations").select("id, owner_id, couple_slug, status, template, template_name"),
      "Gagal mengambil invitation milik user.",
    ),
  ]);

  const invitationByOwnerId = new Map(
    invitations.map((invitation) => [
      invitation.owner_id,
      {
        id: invitation.id,
        coupleSlug: invitation.couple_slug,
        status: invitation.status,
        template: invitation.template,
        templateName: invitation.template_name,
      },
    ]),
  );

  return users.map<AdminUserRow>((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: new Date(user.created_at),
    invitation: invitationByOwnerId.get(user.id) ?? null,
  }));
}

export async function getAdminInvitations() {
  const client = getSupabaseAdminClient();
  const userMap = await getUserMap(client);
  const [invitations, guests, wishes] = await Promise.all([
    unwrapList(
      await client
        .from("invitations")
        .select("id, owner_id, couple_slug, partner_one_name, partner_two_name, template, status, updated_at")
        .order("updated_at", { ascending: false }),
      "Gagal mengambil daftar invitation admin.",
    ),
    unwrapList(
      await client.from("guests").select("invitation_id"),
      "Gagal menghitung guest invitation admin.",
    ),
    unwrapList(
      await client.from("wishes").select("invitation_id"),
      "Gagal menghitung ucapan invitation admin.",
    ),
  ]);

  const guestCountMap = new Map<string, number>();
  const wishCountMap = new Map<string, number>();

  guests.forEach((guest) => {
    guestCountMap.set(guest.invitation_id, (guestCountMap.get(guest.invitation_id) ?? 0) + 1);
  });
  wishes.forEach((wish) => {
    wishCountMap.set(wish.invitation_id, (wishCountMap.get(wish.invitation_id) ?? 0) + 1);
  });

  return invitations.map<AdminInvitationRow>((invitation) => ({
    id: invitation.id,
    coupleSlug: invitation.couple_slug,
    partnerOneName: invitation.partner_one_name,
    partnerTwoName: invitation.partner_two_name,
    template: invitation.template,
    status: invitation.status,
    updatedAt: new Date(invitation.updated_at),
    owner: {
      name: userMap.get(invitation.owner_id)?.name ?? null,
      email: userMap.get(invitation.owner_id)?.email ?? "-",
    },
    guestCount: guestCountMap.get(invitation.id) ?? 0,
    wishCount: wishCountMap.get(invitation.id) ?? 0,
  }));
}

export async function getAdminGuests(limit = 50) {
  const client = getSupabaseAdminClient();
  const userMap = await getUserMap(client);
  const [guestRows, invitationRows, rsvpRows] = await Promise.all([
    unwrapList(
      await client
        .from("guests")
        .select("id, invitation_id, name, guest_slug, phone, email, source, created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      "Gagal mengambil daftar guest admin.",
    ),
    unwrapList(
      await client
        .from("invitations")
        .select("id, owner_id, couple_slug, partner_one_name, partner_two_name"),
      "Gagal mengambil invitation untuk daftar guest admin.",
    ),
    unwrapList(
      await client.from("rsvps").select("guest_id, status, attendees"),
      "Gagal mengambil data RSVP untuk daftar guest admin.",
    ),
  ]);

  const invitationMap = new Map(
    invitationRows.map((invitation) => [
      invitation.id,
      {
        coupleSlug: invitation.couple_slug,
        partnerOneName: invitation.partner_one_name,
        partnerTwoName: invitation.partner_two_name,
        ownerEmail: userMap.get(invitation.owner_id)?.email ?? "-",
      },
    ]),
  );
  const rsvpMap = new Map(
    rsvpRows.map((rsvp) => [
      rsvp.guest_id,
      {
        status: rsvp.status,
        attendees: rsvp.attendees,
      },
    ]),
  );

  return guestRows.map<AdminGuestRow>((guest) => ({
    id: guest.id,
    name: guest.name,
    guestSlug: guest.guest_slug,
    phone: guest.phone,
    email: guest.email,
    source: guest.source,
    createdAt: new Date(guest.created_at),
    invitation: invitationMap.get(guest.invitation_id) ?? {
      coupleSlug: "-",
      partnerOneName: "-",
      partnerTwoName: "-",
      ownerEmail: "-",
    },
    rsvp: rsvpMap.get(guest.id) ?? null,
  }));
}

export async function getAdminRsvps(limit = 50) {
  const client = getSupabaseAdminClient();
  const [rsvpRows, guestRows, invitationRows] = await Promise.all([
    unwrapList(
      await client
        .from("rsvps")
        .select("id, guest_id, respondent_name, status, attendees, note, responded_at")
        .order("responded_at", { ascending: false })
        .limit(limit),
      "Gagal mengambil daftar RSVP admin.",
    ),
    unwrapList(
      await client.from("guests").select("id, invitation_id, name, guest_slug"),
      "Gagal mengambil data guest untuk daftar RSVP admin.",
    ),
    unwrapList(
      await client
        .from("invitations")
        .select("id, couple_slug, partner_one_name, partner_two_name"),
      "Gagal mengambil data invitation untuk daftar RSVP admin.",
    ),
  ]);

  const guestMap = new Map(
    guestRows.map((guest) => [
      guest.id,
      {
        name: guest.name,
        guestSlug: guest.guest_slug,
        invitationId: guest.invitation_id,
      },
    ]),
  );
  const invitationMap = new Map(
    invitationRows.map((invitation) => [
      invitation.id,
      {
        coupleSlug: invitation.couple_slug,
        partnerOneName: invitation.partner_one_name,
        partnerTwoName: invitation.partner_two_name,
      },
    ]),
  );

  const countMap = new Map<"ATTENDING" | "MAYBE" | "DECLINED", number>([
    ["ATTENDING", 0],
    ["MAYBE", 0],
    ["DECLINED", 0],
  ]);

  rsvpRows.forEach((rsvp) => {
    countMap.set(rsvp.status, (countMap.get(rsvp.status) ?? 0) + 1);
  });

  return {
    countMap,
    rsvps: rsvpRows.map<AdminRsvpRow>((rsvp) => {
      const guest = guestMap.get(rsvp.guest_id);
      const invitation = invitationMap.get(guest?.invitationId ?? "");

      return {
        id: rsvp.id,
        respondentName: rsvp.respondent_name,
        status: rsvp.status,
        attendees: rsvp.attendees,
        note: rsvp.note,
        respondedAt: new Date(rsvp.responded_at),
        guest: {
          name: guest?.name ?? "-",
          guestSlug: guest?.guestSlug ?? "-",
          invitation: {
            coupleSlug: invitation?.coupleSlug ?? "-",
            partnerOneName: invitation?.partnerOneName ?? "-",
            partnerTwoName: invitation?.partnerTwoName ?? "-",
          },
        },
      };
    }),
  };
}

export async function getAdminSendLogs(limit = 20) {
  const client = getSupabaseAdminClient();
  const [logs, invitations, guests] = await Promise.all([
    unwrapList(
      await client
        .from("send_logs")
        .select("id, invitation_id, guest_id, channel, status, recipient, created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      "Gagal mengambil send log admin.",
    ),
    unwrapList(
      await client.from("invitations").select("id, couple_slug"),
      "Gagal mengambil invitation untuk send log admin.",
    ),
    unwrapList(
      await client.from("guests").select("id, name"),
      "Gagal mengambil tamu untuk send log admin.",
    ),
  ]);

  const invitationMap = new Map(invitations.map((item) => [item.id, item.couple_slug]));
  const guestMap = new Map(guests.map((item) => [item.id, item.name]));

  return logs.map<AdminSendLogRow>((log) => ({
    id: log.id,
    channel: log.channel,
    status: log.status,
    recipient: log.recipient,
    createdAt: new Date(log.created_at),
    invitationCoupleSlug: invitationMap.get(log.invitation_id) ?? "-",
    guestName: log.guest_id ? (guestMap.get(log.guest_id) ?? null) : null,
  }));
}

export async function getAdminPaymentsData(): Promise<AdminPaymentsData> {
  const client = getSupabaseAdminClient();
  const userMap = await getUserMap(client);
  const [plans, payments, subscriptions] = await Promise.all([
    unwrapList(
      await client
        .from("plans")
        .select("id, tier, name, description, price_in_idr")
        .order("sort_order", { ascending: true }),
      "Gagal mengambil katalog plan admin.",
    ),
    unwrapList(
      await client
        .from("payment_orders")
        .select("id, user_id, status, amount_in_idr, template_name, selected_package")
        .order("created_at", { ascending: false })
        .limit(10),
      "Gagal mengambil payment order admin.",
    ),
    unwrapList(
      await client
        .from("user_subscriptions")
        .select("id, user_id, plan_id, status")
        .order("created_at", { ascending: false })
        .limit(10),
      "Gagal mengambil subscription admin.",
    ),
  ]);

  const planMap = new Map(plans.map((plan) => [plan.id, plan.name]));

  return {
    plans: plans.map((plan) => ({
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      description: plan.description,
      priceInIdr: plan.price_in_idr,
    })),
    payments: payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      amountInIdr: payment.amount_in_idr,
      templateName: payment.template_name,
      selectedPackage: payment.selected_package,
      userName: userMap.get(payment.user_id)?.name ?? null,
      userEmail: userMap.get(payment.user_id)?.email ?? "-",
    })),
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      userName: userMap.get(subscription.user_id)?.name ?? null,
      userEmail: userMap.get(subscription.user_id)?.email ?? "-",
      planName: planMap.get(subscription.plan_id) ?? "-",
    })),
  };
}

export async function getAdminSettingsSnapshot(): Promise<AdminSettingsSnapshot> {
  const client = getSupabaseAdminClient();
  const [allSettings, rsvpEnabled, wishEnabled] = await Promise.all([
    client.from("invitation_settings").select("*", { count: "exact", head: true }),
    client
      .from("invitation_settings")
      .select("*", { count: "exact", head: true })
      .eq("is_rsvp_enabled", true),
    client
      .from("invitation_settings")
      .select("*", { count: "exact", head: true })
      .eq("is_wish_enabled", true),
  ]);

  return {
    invitationSettingsCount: allSettings.count ?? 0,
    rsvpEnabledCount: rsvpEnabled.count ?? 0,
    wishEnabledCount: wishEnabled.count ?? 0,
  };
}

export async function getAdminTemplateUsage() {
  const client = getSupabaseAdminClient();
  const invitations = await unwrapList(
    await client.from("invitations").select("template"),
    "Gagal mengambil penggunaan template admin.",
  );

  const usageMap = new Map<string, number>();
  invitations.forEach((invitation) => {
    usageMap.set(invitation.template, (usageMap.get(invitation.template) ?? 0) + 1);
  });

  return usageMap;
}
