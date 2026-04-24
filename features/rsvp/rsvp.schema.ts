import { z } from "zod";

export const rsvpSchema = z.object({
  guestId: z.string().min(1),
  respondentName: z.string().trim().max(100, "Nama konfirmasi maksimal 100 karakter.").optional(),
  status: z.enum(["ATTENDING", "MAYBE", "DECLINED"]),
  attendees: z.coerce.number().int().min(1).max(10),
  note: z.string().trim().max(250, "Pesan singkat maksimal 250 karakter.").optional(),
  wishMessage: z.string().max(500, "Ucapan maksimal 500 karakter.").optional(),
  coupleSlug: z.string().min(1),
  guestSlug: z.string().min(1),
});
