import { z } from "zod";

const supportedSocialPlatforms = ["instagram", "tiktok"] as const;

export const setupEventFieldGroups = [
  {
    key: "eventOne",
    title: "Acara 1",
    description: "Acara utama yang wajib diisi. Contoh: Akad Nikah.",
    isRequired: true,
    sortOrder: 0,
    fields: {
      label: "eventOneLabel",
      date: "eventOneDate",
      time: "eventOneTime",
      placeName: "eventOnePlaceName",
      formattedAddress: "eventOneFormattedAddress",
      latitude: "eventOneLatitude",
      longitude: "eventOneLongitude",
      googleMapsUrl: "eventOneGoogleMapsUrl",
    },
  },
  {
    key: "eventTwo",
    title: "Acara 2",
    description: "Opsional. Isi bila ada acara tambahan seperti resepsi rumah pengantin wanita.",
    isRequired: false,
    sortOrder: 1,
    fields: {
      label: "eventTwoLabel",
      date: "eventTwoDate",
      time: "eventTwoTime",
      placeName: "eventTwoPlaceName",
      formattedAddress: "eventTwoFormattedAddress",
      latitude: "eventTwoLatitude",
      longitude: "eventTwoLongitude",
      googleMapsUrl: "eventTwoGoogleMapsUrl",
    },
  },
  {
    key: "eventThree",
    title: "Acara 3",
    description: "Opsional. Isi bila ada acara tambahan seperti resepsi rumah pengantin pria.",
    isRequired: false,
    sortOrder: 2,
    fields: {
      label: "eventThreeLabel",
      date: "eventThreeDate",
      time: "eventThreeTime",
      placeName: "eventThreePlaceName",
      formattedAddress: "eventThreeFormattedAddress",
      latitude: "eventThreeLatitude",
      longitude: "eventThreeLongitude",
      googleMapsUrl: "eventThreeGoogleMapsUrl",
    },
  },
] as const;

type SetupEventFieldGroup = (typeof setupEventFieldGroups)[number];

type SetupEventDraft = {
  label: string;
  date: string;
  time: string;
  placeName: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string;
};

type SetupSocialPlatform = (typeof supportedSocialPlatforms)[number];

const coordinateSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : Number.NaN;
    }

    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return null;
    }

    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
  },
  z.number().finite("Koordinat lokasi belum valid.").nullable(),
);

function hasAnyValue(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}

function hasCompleteGiftEntry(label: string, accountName: string, accountNumber: string) {
  return Boolean(label.trim() && accountName.trim() && accountNumber.trim());
}

function isValidDateInput(value: string) {
  const parsedDate = new Date(`${value}T00:00`);
  return !Number.isNaN(parsedDate.getTime());
}

function isClockTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value.trim());
}

function resolveEventStartsAt(date: string, timeLabel: string) {
  const resolvedTime = isClockTime(timeLabel) ? timeLabel.trim() : "00:00";
  return new Date(`${date}T${resolvedTime}`);
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isSocialPlatform(value: string): value is SetupSocialPlatform {
  return supportedSocialPlatforms.includes(value as SetupSocialPlatform);
}

function readSetupEventDraft(
  value: CommonInvitationSetupInput,
  group: SetupEventFieldGroup,
): SetupEventDraft {
  const { fields } = group;

  return {
    label: value[fields.label],
    date: value[fields.date],
    time: value[fields.time],
    placeName: value[fields.placeName],
    formattedAddress: value[fields.formattedAddress],
    latitude: value[fields.latitude],
    longitude: value[fields.longitude],
    googleMapsUrl: value[fields.googleMapsUrl],
  };
}

function hasAnyEventValue(event: SetupEventDraft) {
  return (
    hasAnyValue([
      event.label,
      event.date,
      event.time,
      event.placeName,
      event.formattedAddress,
      event.googleMapsUrl,
    ]) ||
    event.latitude !== null ||
    event.longitude !== null
  );
}

function validateSocialFields(
  value: CommonInvitationSetupInput,
  ctx: z.RefinementCtx,
  fieldNames: {
    platform: "partnerOneSocialPlatform" | "partnerTwoSocialPlatform";
    handle: "partnerOneSocialHandle" | "partnerTwoSocialHandle";
  },
) {
  const platform = value[fieldNames.platform].trim();
  const handle = value[fieldNames.handle].trim();

  if (platform && !isSocialPlatform(platform)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.platform],
      message: "Pilih platform sosial Instagram atau TikTok.",
    });
  }

  if (handle && !platform) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.platform],
      message: "Pilih platform sosial terlebih dahulu.",
    });
  }

  if (platform && !handle) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fieldNames.handle],
      message: "Isi username akun sosial jika platform dipilih.",
    });
  }
}

function validateEventFields(
  value: CommonInvitationSetupInput,
  ctx: z.RefinementCtx,
  group: SetupEventFieldGroup,
) {
  const event = readSetupEventDraft(value, group);
  const isUsed = group.isRequired || hasAnyEventValue(event);

  if (!isUsed) {
    return;
  }

  const { fields } = group;

  if (event.label.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.label],
      message: "Nama acara wajib diisi minimal 2 karakter.",
    });
  }

  if (!event.date.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.date],
      message: "Tanggal acara wajib diisi.",
    });
  } else if (!isValidDateInput(event.date)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.date],
      message: "Format tanggal acara belum valid.",
    });
  }

  if (!event.time.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.time],
      message: "Waktu acara wajib diisi.",
    });
  } else if (event.time.trim().length > 120) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.time],
      message: "Keterangan jam acara terlalu panjang.",
    });
  }

  if (event.placeName.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.placeName],
      message: "Pilih lokasi acara dari peta terlebih dahulu.",
    });
  }

  if (event.formattedAddress.trim().length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.formattedAddress],
      message: "Alamat lokasi minimal 10 karakter.",
    });
  }

  if (event.latitude === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.latitude],
      message: "Koordinat latitude belum tersedia.",
    });
  }

  if (event.longitude === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.longitude],
      message: "Koordinat longitude belum tersedia.",
    });
  }

  if (!event.googleMapsUrl.trim() || !isValidUrl(event.googleMapsUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [fields.googleMapsUrl],
      message: "Google Maps URL belum valid.",
    });
  }
}

export const invitationSchema = z.object({
  partnerOneName: z.string().trim().min(2, "Nama pengantin pertama wajib diisi."),
  partnerTwoName: z.string().trim().min(2, "Nama pengantin kedua wajib diisi."),
  coupleSlug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter.")
    .max(80, "Slug terlalu panjang.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  template: z.enum(["ELEGANT_LUXURY", "KOREAN_SOFT", "MODERN_MINIMAL"]),
});

export const commonInvitationSetupSchema = z
  .object({
    partnerOneName: z.string().trim().min(2, "Nama pengantin pertama wajib diisi."),
    partnerOneParentLine: z
      .string()
      .trim()
      .max(140, "Keterangan keluarga pengantin pertama terlalu panjang."),
    partnerOneSocialPlatform: z.string().trim().max(20, "Platform sosial belum valid."),
    partnerOneSocialHandle: z
      .string()
      .trim()
      .max(120, "Username sosial pengantin pertama terlalu panjang."),
    partnerTwoName: z.string().trim().min(2, "Nama pengantin kedua wajib diisi."),
    partnerTwoParentLine: z
      .string()
      .trim()
      .max(140, "Keterangan keluarga pengantin kedua terlalu panjang."),
    partnerTwoSocialPlatform: z.string().trim().max(20, "Platform sosial belum valid."),
    partnerTwoSocialHandle: z
      .string()
      .trim()
      .max(120, "Username sosial pengantin kedua terlalu panjang."),
    coupleSlug: z
      .string()
      .trim()
      .min(3, "Slug minimal 3 karakter.")
      .max(80, "Slug terlalu panjang.")
      .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
    eventOneLabel: z.string().trim().max(80, "Nama acara utama terlalu panjang."),
    eventOneDate: z.string(),
    eventOneTime: z.string().trim().max(120, "Keterangan jam acara utama terlalu panjang."),
    eventOnePlaceName: z.string().trim().max(120, "Nama tempat acara utama terlalu panjang."),
    eventOneFormattedAddress: z
      .string()
      .trim()
      .max(240, "Alamat acara utama terlalu panjang."),
    eventOneLatitude: coordinateSchema,
    eventOneLongitude: coordinateSchema,
    eventOneGoogleMapsUrl: z.string().trim().max(500, "URL Google Maps acara utama terlalu panjang."),
    eventTwoLabel: z.string().trim().max(80, "Nama acara kedua terlalu panjang."),
    eventTwoDate: z.string(),
    eventTwoTime: z.string().trim().max(120, "Keterangan jam acara kedua terlalu panjang."),
    eventTwoPlaceName: z.string().trim().max(120, "Nama tempat acara kedua terlalu panjang."),
    eventTwoFormattedAddress: z
      .string()
      .trim()
      .max(240, "Alamat acara kedua terlalu panjang."),
    eventTwoLatitude: coordinateSchema,
    eventTwoLongitude: coordinateSchema,
    eventTwoGoogleMapsUrl: z.string().trim().max(500, "URL Google Maps acara kedua terlalu panjang."),
    eventThreeLabel: z.string().trim().max(80, "Nama acara ketiga terlalu panjang."),
    eventThreeDate: z.string(),
    eventThreeTime: z.string().trim().max(120, "Keterangan jam acara ketiga terlalu panjang."),
    eventThreePlaceName: z.string().trim().max(120, "Nama tempat acara ketiga terlalu panjang."),
    eventThreeFormattedAddress: z
      .string()
      .trim()
      .max(240, "Alamat acara ketiga terlalu panjang."),
    eventThreeLatitude: coordinateSchema,
    eventThreeLongitude: coordinateSchema,
    eventThreeGoogleMapsUrl: z
      .string()
      .trim()
      .max(500, "URL Google Maps acara ketiga terlalu panjang."),
    loveStoryFirstMeeting: z
      .string()
      .trim()
      .min(1, "Cerita awal perkenalan wajib diisi.")
      .max(400, "Cerita awal perkenalan terlalu panjang."),
    loveStoryProposal: z
      .string()
      .trim()
      .min(1, "Cerita proses lamaran wajib diisi.")
      .max(400, "Cerita proses lamaran terlalu panjang."),
    loveStoryWedding: z
      .string()
      .trim()
      .min(1, "Cerita hari bahagia wajib diisi.")
      .max(400, "Cerita hari bahagia terlalu panjang."),
    weddingGiftEnabled: z.boolean(),
    giftPrimaryType: z.enum(["bank", "ewallet"]),
    giftPrimaryLabel: z.string().trim().max(80, "Label gift utama terlalu panjang."),
    giftPrimaryAccountName: z.string().trim().max(120, "Nama pemilik utama terlalu panjang."),
    giftPrimaryAccountNumber: z
      .string()
      .trim()
      .max(80, "Nomor rekening / akun utama terlalu panjang."),
    giftPrimaryNote: z.string().trim().max(120, "Catatan gift utama terlalu panjang."),
    giftSecondaryType: z.enum(["bank", "ewallet"]),
    giftSecondaryLabel: z.string().trim().max(80, "Label gift kedua terlalu panjang."),
    giftSecondaryAccountName: z.string().trim().max(120, "Nama pemilik kedua terlalu panjang."),
    giftSecondaryAccountNumber: z
      .string()
      .trim()
      .max(80, "Nomor rekening / akun kedua terlalu panjang."),
    giftSecondaryNote: z.string().trim().max(120, "Catatan gift kedua terlalu panjang."),
    isRsvpEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    validateSocialFields(value, ctx, {
      platform: "partnerOneSocialPlatform",
      handle: "partnerOneSocialHandle",
    });
    validateSocialFields(value, ctx, {
      platform: "partnerTwoSocialPlatform",
      handle: "partnerTwoSocialHandle",
    });

    for (const group of setupEventFieldGroups) {
      validateEventFields(value, ctx, group);
    }

    const primaryHasAnyValue = hasAnyValue([
      value.giftPrimaryLabel,
      value.giftPrimaryAccountName,
      value.giftPrimaryAccountNumber,
      value.giftPrimaryNote,
    ]);

    if (
      primaryHasAnyValue &&
      !hasCompleteGiftEntry(
        value.giftPrimaryLabel,
        value.giftPrimaryAccountName,
        value.giftPrimaryAccountNumber,
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["giftPrimaryAccountNumber"],
        message: "Lengkapi label, nama pemilik, dan nomor akun untuk gift utama.",
      });
    }

    const secondaryHasAnyValue = hasAnyValue([
      value.giftSecondaryLabel,
      value.giftSecondaryAccountName,
      value.giftSecondaryAccountNumber,
      value.giftSecondaryNote,
    ]);

    if (
      secondaryHasAnyValue &&
      !hasCompleteGiftEntry(
        value.giftSecondaryLabel,
        value.giftSecondaryAccountName,
        value.giftSecondaryAccountNumber,
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["giftSecondaryAccountNumber"],
        message: "Lengkapi label, nama pemilik, dan nomor akun untuk gift kedua.",
      });
    }
  });

export const setupInvitationSchema = commonInvitationSetupSchema;

export type CommonInvitationSetupInput = z.infer<typeof commonInvitationSetupSchema>;
export type CommonInvitationSetupFormInput = z.input<typeof commonInvitationSetupSchema>;

export function buildStructuredSetupEventInputs(value: CommonInvitationSetupInput) {
  return setupEventFieldGroups.flatMap((group) => {
    const event = readSetupEventDraft(value, group);

    if (!hasAnyEventValue(event)) {
      return [];
    }

    return [
      {
        label: event.label.trim(),
        startsAt: resolveEventStartsAt(event.date, event.time),
        placeName: event.placeName.trim(),
        formattedAddress: event.formattedAddress.trim(),
        latitude: event.latitude ?? 0,
        longitude: event.longitude ?? 0,
        googleMapsUrl: event.googleMapsUrl.trim(),
        sortOrder: group.sortOrder,
      },
    ];
  });
}

function readCheckboxField(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function readTextField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export function buildCommonInvitationSetupInput(
  formData: FormData,
): CommonInvitationSetupFormInput {
  return {
    partnerOneName: readTextField(formData, "partnerOneName"),
    partnerOneParentLine: readTextField(formData, "partnerOneParentLine"),
    partnerOneSocialPlatform: readTextField(formData, "partnerOneSocialPlatform"),
    partnerOneSocialHandle: readTextField(formData, "partnerOneSocialHandle"),
    partnerTwoName: readTextField(formData, "partnerTwoName"),
    partnerTwoParentLine: readTextField(formData, "partnerTwoParentLine"),
    partnerTwoSocialPlatform: readTextField(formData, "partnerTwoSocialPlatform"),
    partnerTwoSocialHandle: readTextField(formData, "partnerTwoSocialHandle"),
    coupleSlug: readTextField(formData, "coupleSlug"),
    eventOneLabel: readTextField(formData, "eventOneLabel"),
    eventOneDate: readTextField(formData, "eventOneDate"),
    eventOneTime: readTextField(formData, "eventOneTime"),
    eventOnePlaceName: readTextField(formData, "eventOnePlaceName"),
    eventOneFormattedAddress: readTextField(formData, "eventOneFormattedAddress"),
    eventOneLatitude: readTextField(formData, "eventOneLatitude"),
    eventOneLongitude: readTextField(formData, "eventOneLongitude"),
    eventOneGoogleMapsUrl: readTextField(formData, "eventOneGoogleMapsUrl"),
    eventTwoLabel: readTextField(formData, "eventTwoLabel"),
    eventTwoDate: readTextField(formData, "eventTwoDate"),
    eventTwoTime: readTextField(formData, "eventTwoTime"),
    eventTwoPlaceName: readTextField(formData, "eventTwoPlaceName"),
    eventTwoFormattedAddress: readTextField(formData, "eventTwoFormattedAddress"),
    eventTwoLatitude: readTextField(formData, "eventTwoLatitude"),
    eventTwoLongitude: readTextField(formData, "eventTwoLongitude"),
    eventTwoGoogleMapsUrl: readTextField(formData, "eventTwoGoogleMapsUrl"),
    eventThreeLabel: readTextField(formData, "eventThreeLabel"),
    eventThreeDate: readTextField(formData, "eventThreeDate"),
    eventThreeTime: readTextField(formData, "eventThreeTime"),
    eventThreePlaceName: readTextField(formData, "eventThreePlaceName"),
    eventThreeFormattedAddress: readTextField(formData, "eventThreeFormattedAddress"),
    eventThreeLatitude: readTextField(formData, "eventThreeLatitude"),
    eventThreeLongitude: readTextField(formData, "eventThreeLongitude"),
    eventThreeGoogleMapsUrl: readTextField(formData, "eventThreeGoogleMapsUrl"),
    loveStoryFirstMeeting: readTextField(formData, "loveStoryFirstMeeting"),
    loveStoryProposal: readTextField(formData, "loveStoryProposal"),
    loveStoryWedding: readTextField(formData, "loveStoryWedding"),
    weddingGiftEnabled: readCheckboxField(formData, "weddingGiftEnabled"),
    giftPrimaryType: String(formData.get("giftPrimaryType") ?? "bank") as "bank" | "ewallet",
    giftPrimaryLabel: readTextField(formData, "giftPrimaryLabel"),
    giftPrimaryAccountName: readTextField(formData, "giftPrimaryAccountName"),
    giftPrimaryAccountNumber: readTextField(formData, "giftPrimaryAccountNumber"),
    giftPrimaryNote: readTextField(formData, "giftPrimaryNote"),
    giftSecondaryType: String(formData.get("giftSecondaryType") ?? "ewallet") as
      | "bank"
      | "ewallet",
    giftSecondaryLabel: readTextField(formData, "giftSecondaryLabel"),
    giftSecondaryAccountName: readTextField(formData, "giftSecondaryAccountName"),
    giftSecondaryAccountNumber: readTextField(formData, "giftSecondaryAccountNumber"),
    giftSecondaryNote: readTextField(formData, "giftSecondaryNote"),
    isRsvpEnabled: readCheckboxField(formData, "isRsvpEnabled"),
  };
}
