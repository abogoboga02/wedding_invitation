import { z } from "zod";

export const invitationSettingsSchema = z.object({
  locale: z.string().trim().min(2, "Locale wajib diisi."),
  timezone: z.string().trim().min(3, "Timezone wajib diisi."),
  isRsvpEnabled: z.boolean(),
  isWishEnabled: z.boolean(),
  autoPlayMusic: z.boolean(),
  preferredSendChannel: z.enum(["MANUAL", "WHATSAPP", "EMAIL"]),
});
