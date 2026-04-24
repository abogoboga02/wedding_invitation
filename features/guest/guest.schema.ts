import { z } from "zod";

export const guestSchema = z.object({
  name: z.string().min(2, "Nama tamu wajib diisi."),
  phone: z.string().optional(),
  email: z.email("Email tidak valid.").optional().or(z.literal("")),
});
