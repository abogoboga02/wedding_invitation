import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { unwrapList } from "@/lib/supabase/helpers";

type AdminClient = ReturnType<typeof getSupabaseAdminClient>;

export type AdminOverviewData = {
  users: number;
  admins: number;
  invitations: number;
  published: number;
  guests: number;
  rsvps: number;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "CLIENT";
    createdAt: Date;
  }>;
  recentInvitations: Array<{
    id: string;
    coupleSlug: string;
    partnerOneName: string;
    partnerTwoName: string;
    status: "DRAFT" | "PUBLISHED";
    updatedAt: Date;
    ownerEmail: string;
  }>;
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
  const [logRows, guestRows] = await Promise.all([
    unwrapList(
      await client
        .from("send_logs")
        .select("id, channel, status, recipient, guest_id, created_at")
        .eq("invitation_id", invitationId)
        .order("created_at", { ascending: false })
        .limit(limit),
      "Gagal mengambil riwayat distribusi invitation.",
    ),
    unwrapList(
      await client
        .from("guests")
        .select("id, name")
        .eq("invitation_id", invitationId),
      "Gagal mengambil data tamu untuk send log.",
    ),
  ]);

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
  const [userCount, adminCount, invitationCount, publishedCount, guestCount, rsvpCount, invitationRows] =
    await Promise.all([
      client.from("users").select("*", { count: "exact", head: true }),
      client.from("users").select("*", { count: "exact", head: true }).eq("role", "ADMIN"),
      client.from("invitations").select("*", { count: "exact", head: true }),
      client.from("invitations").select("*", { count: "exact", head: true }).eq("status", "PUBLISHED"),
      client.from("guests").select("*", { count: "exact", head: true }),
      client.from("rsvps").select("*", { count: "exact", head: true }),
      unwrapList(
        await client
          .from("invitations")
          .select("id, owner_id, couple_slug, partner_one_name, partner_two_name, status, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        "Gagal mengambil invitation terbaru admin.",
      ),
    ]);

  const recentUsers = [...userMap.values()]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 5);

  return {
    users: userCount.count ?? 0,
    admins: adminCount.count ?? 0,
    invitations: invitationCount.count ?? 0,
    published: publishedCount.count ?? 0,
    guests: guestCount.count ?? 0,
    rsvps: rsvpCount.count ?? 0,
    recentUsers,
    recentInvitations: invitationRows.map((invitation) => ({
      id: invitation.id,
      coupleSlug: invitation.couple_slug,
      partnerOneName: invitation.partner_one_name,
      partnerTwoName: invitation.partner_two_name,
      status: invitation.status,
      updatedAt: new Date(invitation.updated_at),
      ownerEmail: userMap.get(invitation.owner_id)?.email ?? "-",
    })),
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
        .select("id, user_id, status, amount_in_idr")
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
