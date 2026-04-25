# Atelier Amora

MVP web app undangan digital berbasis Next.js 16, TypeScript, Tailwind v4, Supabase Auth, Supabase Postgres, dan Supabase Storage.

## Fitur MVP

- Homepage premium mobile-first
- Auth email/password via Supabase Auth
- Dashboard builder undangan
- Admin panel dasar untuk monitoring user, invitation, plan, dan send log
- Tiga template live: Elegant Luxury, Korean Soft, Modern Minimal
- Guest management manual + import CSV
- Upload cover, galeri, dan musik ke Supabase Storage
- Link personal tamu: `/{coupleSlug}/{guestSlug}`
- RSVP + ucapan di halaman undangan publik
- Pricing page, SEO metadata, sitemap, robots, dan OG image dasar

## Setup Lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `APP_URL`, `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, dan `SUPABASE_SECRET_KEY`.
3. Jalankan bootstrap schema Supabase dari [`supabase/migrations/20260425_full_supabase_bootstrap.sql`](supabase/migrations/20260425_full_supabase_bootstrap.sql).
4. Jika kamu sedang migrasi dari schema Prisma lama, jalankan:

```bash
npm install
npm run supabase:migrate:dry-run
npm run supabase:migrate
```

5. Jalankan aplikasi:

```bash
npm run dev
```

## Alur Migrasi dari Schema Lama

1. Pastikan database lama yang masih berisi tabel Prisma camelCase tetap bisa diakses lewat `DATABASE_URL`.
2. Jalankan SQL bootstrap Supabase agar tabel snake_case, RLS, dan bucket storage siap.
3. Jalankan `npm run supabase:migrate:dry-run` untuk melihat jumlah user, invitation, guest, dan aset lokal yang akan dipindahkan.
4. Jalankan `npm run supabase:migrate` untuk:
   - membuat atau menyinkronkan user Supabase Auth
   - memetakan `User.id` lama ke UUID `auth.users.id`
   - mengisi tabel `public.*` snake_case
   - memindahkan aset yang masih direferensikan dari `public/uploads` ke Supabase Storage
5. Verifikasi login client, login admin, dashboard, dan satu route undangan publik.
6. Setelah lolos verifikasi, baru hapus tabel legacy NextAuth/Prisma.

## Script Penting

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test`
- `npm run supabase:migrate:dry-run`
- `npm run supabase:migrate`
- `npm run db:generate`
- `npm run db:push`

`db:*` dipertahankan hanya sebagai alat baca schema Prisma lama selama masa migrasi.

## Catatan

- Route publik dan dashboard sekarang membaca data dari tabel Supabase snake_case.
- Upload media sekarang menggunakan Supabase Storage bucket `SUPABASE_STORAGE_BUCKET`.
- `APP_URL` adalah env utama untuk metadata dan redirect. `NEXTAUTH_URL` masih diterima hanya sebagai fallback kompatibilitas.
- Panduan environment dan langkah SQL ada di [`docs/supabase-setup.md`](docs/supabase-setup.md).
