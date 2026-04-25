import { z } from "zod";

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

export const eventSchema = z.object({
  label: z.string().trim().min(2, "Label acara wajib diisi."),
  startsAt: z.string().min(1, "Tanggal acara wajib diisi."),
  placeName: z.string().trim().min(2, "Lokasi acara wajib dipilih dari peta."),
  formattedAddress: z.string().trim().min(10, "Alamat lokasi minimal 10 karakter."),
  latitude: z.coerce.number().finite("Latitude belum valid."),
  longitude: z.coerce.number().finite("Longitude belum valid."),
  googleMapsUrl: z.string().trim().url("Google Maps URL belum valid."),
});

function hasAnyValue(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}

function hasCompleteGiftEntry(label: string, accountName: string, accountNumber: string) {
  return Boolean(label.trim() && accountName.trim() && accountNumber.trim());
}

export const commonInvitationSetupSchema = z
  .object({
    partnerOneName: z.string().trim().min(2, "Nama pengantin wajib diisi."),
    partnerTwoName: z.string().trim().min(2, "Nama pengantin wanita wajib diisi."),
    coupleSlug: z
      .string()
      .trim()
      .min(3, "Slug minimal 3 karakter.")
      .max(80, "Slug terlalu panjang.")
      .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
    eventLabel: z.string().trim().min(2, "Nama acara wajib diisi."),
    eventDate: z.string().min(1, "Tanggal acara wajib diisi."),
    eventTime: z.string().min(1, "Waktu acara wajib diisi."),
    placeName: z.string().trim().min(2, "Pilih lokasi utama dari peta terlebih dahulu."),
    formattedAddress: z.string().trim().min(10, "Alamat lokasi minimal 10 karakter."),
    latitude: z.coerce.number().finite("Koordinat latitude belum valid."),
    longitude: z.coerce.number().finite("Koordinat longitude belum valid."),
    googleMapsUrl: z.string().trim().url("Google Maps URL belum valid."),
    loveStoryFirstMeeting: z.string().trim().max(400, "Cerita awal bertemu terlalu panjang."),
    loveStoryProposal: z.string().trim().max(400, "Cerita lamaran terlalu panjang."),
    loveStoryWedding: z.string().trim().max(400, "Cerita pernikahan terlalu panjang."),
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

export function buildCommonInvitationSetupInput(formData: FormData): CommonInvitationSetupInput {
  return {
    partnerOneName: String(formData.get("partnerOneName") ?? ""),
    partnerTwoName: String(formData.get("partnerTwoName") ?? ""),
    coupleSlug: String(formData.get("coupleSlug") ?? ""),
    eventLabel: String(formData.get("eventLabel") ?? ""),
    eventDate: String(formData.get("eventDate") ?? ""),
    eventTime: String(formData.get("eventTime") ?? ""),
    placeName: String(formData.get("placeName") ?? ""),
    formattedAddress: String(formData.get("formattedAddress") ?? ""),
    latitude: Number(formData.get("latitude") ?? Number.NaN),
    longitude: Number(formData.get("longitude") ?? Number.NaN),
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
    loveStoryFirstMeeting: String(formData.get("loveStoryFirstMeeting") ?? ""),
    loveStoryProposal: String(formData.get("loveStoryProposal") ?? ""),
    loveStoryWedding: String(formData.get("loveStoryWedding") ?? ""),
    weddingGiftEnabled: formData.get("weddingGiftEnabled") === "on",
    giftPrimaryType: String(formData.get("giftPrimaryType") ?? "bank") as "bank" | "ewallet",
    giftPrimaryLabel: String(formData.get("giftPrimaryLabel") ?? ""),
    giftPrimaryAccountName: String(formData.get("giftPrimaryAccountName") ?? ""),
    giftPrimaryAccountNumber: String(formData.get("giftPrimaryAccountNumber") ?? ""),
    giftPrimaryNote: String(formData.get("giftPrimaryNote") ?? ""),
    giftSecondaryType: String(formData.get("giftSecondaryType") ?? "ewallet") as
      | "bank"
      | "ewallet",
    giftSecondaryLabel: String(formData.get("giftSecondaryLabel") ?? ""),
    giftSecondaryAccountName: String(formData.get("giftSecondaryAccountName") ?? ""),
    giftSecondaryAccountNumber: String(formData.get("giftSecondaryAccountNumber") ?? ""),
    giftSecondaryNote: String(formData.get("giftSecondaryNote") ?? ""),
    isRsvpEnabled: formData.get("isRsvpEnabled") === "on",
  };
}
