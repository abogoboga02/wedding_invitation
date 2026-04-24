import { z } from "zod";

const registerPasswordSchema = z.string().min(8, "Password minimal 8 karakter.");

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Masukkan email atau username."),
  password: z.string().min(1, "Password wajib diisi."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(80, "Nama terlalu panjang."),
  email: z.email("Masukkan email yang valid.").transform((value) => value.toLowerCase()),
  password: registerPasswordSchema,
});

export const registerClientSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password harus sama.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Masukkan email yang valid.").transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(6, "Token reset tidak valid."),
    password: z.string().min(8, "Password minimal 8 karakter."),
    confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password harus sama.",
    path: ["confirmPassword"],
  });
