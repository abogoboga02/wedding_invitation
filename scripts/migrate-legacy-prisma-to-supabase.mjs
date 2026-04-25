import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const storageBucket = (process.env.SUPABASE_STORAGE_BUCKET || "invitation-media").trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecret =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required so Prisma can read the legacy schema.");
}

if (!supabaseUrl || !supabaseSecret) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required.",
  );
}

const prisma = new PrismaClient();
const admin = createClient(supabaseUrl, supabaseSecret, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const mimeTypesByExtension = {
  ".aac": "audio/aac",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".mp4": "audio/mp4",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webp": "image/webp",
};

function logSection(title) {
  console.log(`\n== ${title} ==`);
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function lowerEmail(email) {
  return email.trim().toLowerCase();
}

function chunk(items, size = 200) {
  const batches = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

function guessMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return mimeTypesByExtension[extension] || "application/octet-stream";
}

function randomPassword() {
  return `Migrated-${crypto.randomUUID()}!`;
}

function deterministicSettingId(invitationId) {
  return `legacy-setting-${invitationId}`;
}

function deterministicPathSegment(prefix, entityId, originalPath) {
  const extension = path.extname(originalPath) || "";
  const safeId = entityId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${prefix}-${safeId}${extension.toLowerCase()}`;
}

function requireMappedUserId(userIdMap, legacyUserId, contextLabel) {
  const mappedUserId = userIdMap.get(legacyUserId);

  if (!mappedUserId) {
    throw new Error(`Missing mapped Supabase Auth user for ${contextLabel} (${legacyUserId}).`);
  }

  return mappedUserId;
}

function normalizeLegacyUploadPath(sourceUrl) {
  if (!sourceUrl) {
    return null;
  }

  const trimmedValue = sourceUrl.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/^(https?:|data:)/i.test(trimmedValue)) {
    return null;
  }

  const withoutLeadingSlash = trimmedValue.replace(/^\/+/, "");

  if (withoutLeadingSlash.startsWith("public/uploads/")) {
    return withoutLeadingSlash.replace(/^public\//, "");
  }

  if (withoutLeadingSlash.startsWith("uploads/")) {
    return withoutLeadingSlash;
  }

  return null;
}

async function assertStorageBucket() {
  if (dryRun) {
    return;
  }

  const { data, error } = await admin.storage.listBuckets();

  if (error) {
    throw new Error(`Failed to list storage buckets. ${error.message}`);
  }

  const existingBucket = (data || []).find((bucket) => bucket.name === storageBucket);

  if (existingBucket) {
    return;
  }

  const { error: createBucketError } = await admin.storage.createBucket(storageBucket, {
    public: true,
    fileSizeLimit: 20 * 1024 * 1024,
  });

  if (createBucketError) {
    throw new Error(`Failed to create storage bucket "${storageBucket}". ${createBucketError.message}`);
  }
}

async function listAllAuthUsers() {
  const authUsers = new Map();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(`Failed to read Supabase Auth users. ${error.message}`);
    }

    for (const user of data.users) {
      if (user.email) {
        authUsers.set(lowerEmail(user.email), user);
      }
    }

    if (data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  return authUsers;
}

async function upsertRows(table, rows, options = {}) {
  if (rows.length === 0 || dryRun) {
    return;
  }

  for (const batch of chunk(rows)) {
    const { error } = await admin.from(table).upsert(batch, options);

    if (error) {
      throw new Error(`Failed to upsert ${table}. ${error.message}`);
    }
  }
}

async function countTable(table) {
  const { count, error } = await admin.from(table).select("*", {
    count: "exact",
    head: true,
  });

  if (error) {
    throw new Error(`Failed to count ${table}. ${error.message}`);
  }

  return count || 0;
}

async function resolveStorageAsset({
  sourceUrl,
  ownerId,
  invitationId,
  kind,
  entityId,
}) {
  if (!sourceUrl) {
    return {
      publicUrl: null,
      storagePath: null,
      usedLocalFile: false,
      localFileFound: false,
    };
  }

  const normalizedUploadPath = normalizeLegacyUploadPath(sourceUrl);

  if (!normalizedUploadPath) {
    return {
      publicUrl: sourceUrl,
      storagePath: null,
      usedLocalFile: false,
      localFileFound: false,
    };
  }

  const absolutePath = path.join(publicDir, normalizedUploadPath.replace(/^uploads\//, "uploads/"));
  const storagePath = `${ownerId}/${invitationId}/${kind}/${deterministicPathSegment(kind, entityId, absolutePath)}`;

  try {
    const fileBuffer = await fs.readFile(absolutePath);

    if (!dryRun) {
      const { error: uploadError } = await admin.storage.from(storageBucket).upload(storagePath, fileBuffer, {
        upsert: true,
        contentType: guessMimeType(absolutePath),
      });

      if (uploadError) {
        throw new Error(`Failed to upload ${absolutePath}. ${uploadError.message}`);
      }
    }

    const { data } = admin.storage.from(storageBucket).getPublicUrl(storagePath);

    return {
      publicUrl: dryRun ? sourceUrl : data.publicUrl,
      storagePath,
      usedLocalFile: true,
      localFileFound: true,
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return {
        publicUrl: sourceUrl,
        storagePath: null,
        usedLocalFile: true,
        localFileFound: false,
      };
    }

    throw error;
  }
}

async function main() {
  logSection("Loading legacy data");

  const [
    legacyUsers,
    legacyPlans,
    legacyInvitations,
    legacyInvitationSettings,
    legacyEventSlots,
    legacyGalleryImages,
    legacyGuests,
    legacyRsvps,
    legacyWishes,
    legacyViewLogs,
    legacySubscriptions,
    legacyPaymentOrders,
    legacySendLogs,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.plan.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.invitation.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.invitationSetting.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.eventSlot.findMany({ orderBy: [{ invitationId: "asc" }, { sortOrder: "asc" }] }),
    prisma.galleryImage.findMany({ orderBy: [{ invitationId: "asc" }, { sortOrder: "asc" }] }),
    prisma.guest.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.rsvp.findMany({ orderBy: { respondedAt: "asc" } }),
    prisma.wish.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.invitationViewLog.findMany({ orderBy: { openedAt: "asc" } }),
    prisma.userSubscription.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.paymentOrder.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.sendLog.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const legacyInvitationSettingsByInvitationId = new Map(
    legacyInvitationSettings.map((setting) => [setting.invitationId, setting]),
  );

  console.log(`Legacy users: ${legacyUsers.length}`);
  console.log(`Legacy invitations: ${legacyInvitations.length}`);
  console.log(`Legacy guests: ${legacyGuests.length}`);
  console.log(`Legacy plans: ${legacyPlans.length}`);

  const usersWithoutPasswordHash = legacyUsers.filter((user) => !user.passwordHash);

  if (usersWithoutPasswordHash.length > 0) {
    console.log(
      `Users without password hash: ${usersWithoutPasswordHash.length} (${usersWithoutPasswordHash
        .map((user) => user.email)
        .join(", ")})`,
    );
  }

  const localAssetCandidates = [
    ...legacyInvitations
      .flatMap((invitation) => [invitation.coverImage, invitation.musicUrl])
      .filter(Boolean),
    ...legacyGalleryImages.map((image) => image.imageUrl).filter(Boolean),
  ].filter((value) => normalizeLegacyUploadPath(value));

  console.log(`DB-referenced local assets: ${localAssetCandidates.length}`);

  if (dryRun) {
    logSection("Dry run");
    console.log("No data will be written.");
  } else {
    await assertStorageBucket();
  }

  logSection("Preparing auth users");

  const authUsersByEmail = await listAllAuthUsers();
  const userIdMap = new Map();
  const publicUserRows = [];

  for (const legacyUser of legacyUsers) {
    const emailKey = lowerEmail(legacyUser.email);
    const existingAuthUser = authUsersByEmail.get(emailKey);
    const baseAdminAttributes = {
      email: legacyUser.email,
      email_confirm: true,
      user_metadata: {
        legacy_user_id: legacyUser.id,
        name: legacyUser.name,
      },
      app_metadata: {
        legacy_user_id: legacyUser.id,
        role: legacyUser.role,
      },
    };
    const createAdminAttributes = legacyUser.passwordHash
      ? {
          ...baseAdminAttributes,
          password_hash: legacyUser.passwordHash,
        }
      : {
          ...baseAdminAttributes,
          password: randomPassword(),
        };
    const updateAdminAttributes = legacyUser.passwordHash
      ? {
          ...baseAdminAttributes,
          password_hash: legacyUser.passwordHash,
        }
      : baseAdminAttributes;

    let authUserId = `dry-run-${legacyUser.id}`;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;

      if (!dryRun) {
        const { data, error } = await admin.auth.admin.updateUserById(
          existingAuthUser.id,
          updateAdminAttributes,
        );

        if (error) {
          throw new Error(`Failed to update auth user for ${legacyUser.email}. ${error.message}`);
        }

        authUserId = data.user.id;
      }
    } else if (!dryRun) {
      const { data, error } = await admin.auth.admin.createUser(createAdminAttributes);

      if (error) {
        throw new Error(`Failed to create auth user for ${legacyUser.email}. ${error.message}`);
      }

      authUserId = data.user.id;
      authUsersByEmail.set(emailKey, data.user);
    }

    userIdMap.set(legacyUser.id, authUserId);
    publicUserRows.push({
      id: authUserId,
      name: legacyUser.name,
      email: legacyUser.email,
      role: legacyUser.role,
      created_at: toIso(legacyUser.createdAt),
      updated_at: toIso(legacyUser.updatedAt),
    });
  }

  await upsertRows("users", publicUserRows, {
    onConflict: "id",
  });

  logSection("Migrating plans");

  const planRows = legacyPlans.map((plan) => ({
    id: plan.id,
    tier: plan.tier,
    name: plan.name,
    description: plan.description,
    price_in_idr: plan.priceInIdr,
    is_active: plan.isActive,
    sort_order: plan.sortOrder,
    created_at: toIso(plan.createdAt),
    updated_at: toIso(plan.updatedAt),
  }));

  await upsertRows("plans", planRows, {
    onConflict: "id",
  });

  logSection("Migrating invitations and media");

  const invitationRows = [];
  const galleryImageRows = [];
  const storageSummary = {
    localAssetsReferenced: 0,
    localAssetsUploaded: 0,
    localAssetsMissing: 0,
  };

  for (const legacyInvitation of legacyInvitations) {
    const mappedOwnerId = requireMappedUserId(
      userIdMap,
      legacyInvitation.ownerId,
      `invitation ${legacyInvitation.id}`,
    );

    const coverAsset = await resolveStorageAsset({
      sourceUrl: legacyInvitation.coverImage,
      ownerId: mappedOwnerId,
      invitationId: legacyInvitation.id,
      kind: "cover",
      entityId: legacyInvitation.id,
    });
    const musicAsset = await resolveStorageAsset({
      sourceUrl: legacyInvitation.musicUrl,
      ownerId: mappedOwnerId,
      invitationId: legacyInvitation.id,
      kind: "music",
      entityId: legacyInvitation.id,
    });

    for (const asset of [coverAsset, musicAsset]) {
      if (!asset.usedLocalFile) {
        continue;
      }

      storageSummary.localAssetsReferenced += 1;

      if (asset.localFileFound) {
        storageSummary.localAssetsUploaded += 1;
      } else {
        storageSummary.localAssetsMissing += 1;
      }
    }

    invitationRows.push({
      id: legacyInvitation.id,
      owner_id: mappedOwnerId,
      template: legacyInvitation.template,
      status: legacyInvitation.status,
      couple_slug: legacyInvitation.coupleSlug,
      partner_one_name: legacyInvitation.partnerOneName,
      partner_two_name: legacyInvitation.partnerTwoName,
      headline: legacyInvitation.headline,
      subheadline: legacyInvitation.subheadline,
      story: legacyInvitation.story,
      closing_note: legacyInvitation.closingNote,
      template_config: legacyInvitation.templateConfig,
      cover_image_url: coverAsset.publicUrl,
      cover_image_alt: legacyInvitation.coverImageAlt,
      cover_image_storage_path: coverAsset.storagePath,
      music_url: musicAsset.publicUrl,
      music_original_name: legacyInvitation.musicOriginalName,
      music_mime_type: legacyInvitation.musicMimeType,
      music_size: legacyInvitation.musicSize,
      music_storage_path: musicAsset.storagePath,
      published_at: toIso(legacyInvitation.publishedAt),
      created_at: toIso(legacyInvitation.createdAt),
      updated_at: toIso(legacyInvitation.updatedAt),
    });
  }

  for (const legacyGalleryImage of legacyGalleryImages) {
    const invitation = legacyInvitations.find((item) => item.id === legacyGalleryImage.invitationId);

    if (!invitation) {
      throw new Error(`Gallery image ${legacyGalleryImage.id} points to missing invitation ${legacyGalleryImage.invitationId}.`);
    }

    const mappedOwnerId = requireMappedUserId(
      userIdMap,
      invitation.ownerId,
      `gallery image ${legacyGalleryImage.id}`,
    );

    const galleryAsset = await resolveStorageAsset({
      sourceUrl: legacyGalleryImage.imageUrl,
      ownerId: mappedOwnerId,
      invitationId: legacyGalleryImage.invitationId,
      kind: "gallery",
      entityId: legacyGalleryImage.id,
    });

    if (galleryAsset.usedLocalFile) {
      storageSummary.localAssetsReferenced += 1;

      if (galleryAsset.localFileFound) {
        storageSummary.localAssetsUploaded += 1;
      } else {
        storageSummary.localAssetsMissing += 1;
      }
    }

    galleryImageRows.push({
      id: legacyGalleryImage.id,
      invitation_id: legacyGalleryImage.invitationId,
      image_url: galleryAsset.publicUrl,
      storage_path: galleryAsset.storagePath,
      alt_text: legacyGalleryImage.altText,
      sort_order: legacyGalleryImage.sortOrder,
      created_at: toIso(legacyGalleryImage.createdAt),
    });
  }

  const invitationSettingRows = legacyInvitations.map((invitation) => {
    const legacySetting = legacyInvitationSettingsByInvitationId.get(invitation.id);

    return {
      id: legacySetting?.id || deterministicSettingId(invitation.id),
      invitation_id: invitation.id,
      locale: legacySetting?.locale || "id-ID",
      timezone: legacySetting?.timezone || "Asia/Jakarta",
      is_rsvp_enabled: legacySetting?.isRsvpEnabled ?? true,
      is_wish_enabled: legacySetting?.isWishEnabled ?? true,
      auto_play_music: legacySetting?.autoPlayMusic ?? true,
      preferred_send_channel: legacySetting?.preferredSendChannel || "MANUAL",
      created_at: toIso(legacySetting?.createdAt || invitation.createdAt),
      updated_at: toIso(legacySetting?.updatedAt || invitation.updatedAt),
    };
  });

  await upsertRows("invitations", invitationRows, {
    onConflict: "id",
  });
  await upsertRows("invitation_settings", invitationSettingRows, {
    onConflict: "id",
  });
  await upsertRows(
    "event_slots",
    legacyEventSlots.map((eventSlot) => ({
      id: eventSlot.id,
      invitation_id: eventSlot.invitationId,
      label: eventSlot.label,
      starts_at: toIso(eventSlot.startsAt),
      venue_name: eventSlot.venueName,
      address: eventSlot.address,
      maps_url: eventSlot.mapsUrl,
      latitude: eventSlot.latitude,
      longitude: eventSlot.longitude,
      place_name: eventSlot.placeName,
      formatted_address: eventSlot.formattedAddress,
      google_maps_url: eventSlot.googleMapsUrl,
      sort_order: eventSlot.sortOrder,
      created_at: toIso(eventSlot.createdAt),
      updated_at: toIso(eventSlot.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );
  await upsertRows("gallery_images", galleryImageRows, {
    onConflict: "id",
  });

  logSection("Migrating guests and public interactions");

  await upsertRows(
    "guests",
    legacyGuests.map((guest) => ({
      id: guest.id,
      invitation_id: guest.invitationId,
      name: guest.name,
      guest_slug: guest.guestSlug,
      phone: guest.phone,
      email: guest.email,
      source: guest.source,
      created_at: toIso(guest.createdAt),
      updated_at: toIso(guest.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );
  await upsertRows(
    "rsvps",
    legacyRsvps.map((rsvp) => ({
      id: rsvp.id,
      guest_id: rsvp.guestId,
      respondent_name: rsvp.respondentName,
      status: rsvp.status,
      attendees: rsvp.attendees,
      note: rsvp.note,
      responded_at: toIso(rsvp.respondedAt),
      updated_at: toIso(rsvp.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );
  await upsertRows(
    "wishes",
    legacyWishes.map((wish) => ({
      id: wish.id,
      invitation_id: wish.invitationId,
      guest_id: wish.guestId,
      message: wish.message,
      is_approved: wish.isApproved,
      created_at: toIso(wish.createdAt),
      updated_at: toIso(wish.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );
  await upsertRows(
    "invitation_view_logs",
    legacyViewLogs.map((viewLog) => ({
      id: viewLog.id,
      invitation_id: viewLog.invitationId,
      guest_id: viewLog.guestId,
      path: viewLog.path,
      opened_at: toIso(viewLog.openedAt),
    })),
    {
      onConflict: "id",
    },
  );

  logSection("Migrating billing and send logs");

  await upsertRows(
    "user_subscriptions",
    legacySubscriptions.map((subscription) => ({
      id: subscription.id,
      user_id: requireMappedUserId(
        userIdMap,
        subscription.userId,
        `subscription ${subscription.id}`,
      ),
      plan_id: subscription.planId,
      status: subscription.status,
      starts_at: toIso(subscription.startsAt),
      expires_at: toIso(subscription.expiresAt),
      auto_renew: subscription.autoRenew,
      created_at: toIso(subscription.createdAt),
      updated_at: toIso(subscription.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );
  await upsertRows(
    "payment_orders",
    legacyPaymentOrders.map((paymentOrder) => ({
      id: paymentOrder.id,
      user_id: requireMappedUserId(
        userIdMap,
        paymentOrder.userId,
        `payment order ${paymentOrder.id}`,
      ),
      invitation_id: paymentOrder.invitationId,
      plan_id: paymentOrder.planId,
      status: paymentOrder.status,
      amount_in_idr: paymentOrder.amountInIdr,
      currency: paymentOrder.currency,
      provider: paymentOrder.provider,
      external_reference: paymentOrder.externalReference,
      paid_at: toIso(paymentOrder.paidAt),
      created_at: toIso(paymentOrder.createdAt),
      updated_at: toIso(paymentOrder.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );
  await upsertRows(
    "send_logs",
    legacySendLogs.map((sendLog) => ({
      id: sendLog.id,
      invitation_id: sendLog.invitationId,
      guest_id: sendLog.guestId,
      channel: sendLog.channel,
      status: sendLog.status,
      recipient: sendLog.recipient,
      provider: sendLog.provider,
      provider_message_id: sendLog.providerMessageId,
      error_message: sendLog.errorMessage,
      sent_at: toIso(sendLog.sentAt),
      created_at: toIso(sendLog.createdAt),
      updated_at: toIso(sendLog.updatedAt),
    })),
    {
      onConflict: "id",
    },
  );

  logSection("Summary");

  console.log(`Mode: ${dryRun ? "dry-run" : "apply"}`);
  console.log(`Users prepared: ${legacyUsers.length}`);
  console.log(`Invitations prepared: ${legacyInvitations.length}`);
  console.log(`Guests prepared: ${legacyGuests.length}`);
  console.log(`Local assets referenced: ${storageSummary.localAssetsReferenced}`);
  console.log(`Local assets uploaded: ${storageSummary.localAssetsUploaded}`);
  console.log(`Local assets missing: ${storageSummary.localAssetsMissing}`);

  if (!dryRun) {
    console.log(`Supabase public.users: ${await countTable("users")}`);
    console.log(`Supabase invitations: ${await countTable("invitations")}`);
    console.log(`Supabase guests: ${await countTable("guests")}`);
    console.log(`Supabase plans: ${await countTable("plans")}`);
    console.log(
      "Legacy NextAuth tables can be dropped after you verify login, dashboard ownership, and one public invitation route.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
