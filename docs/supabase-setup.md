# Setup Supabase untuk Atelier Amora

Panduan ini menjelaskan env, SQL bootstrap, dan migrasi data lama supaya seluruh flow CRUD, auth, dan media benar-benar berjalan dari Supabase.

## Environment yang wajib diisi

Salin `.env.example` menjadi `.env`, lalu isi:

```env
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://legacy-user:legacy-password@legacy-host:5432/wedding_invitation
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
SUPABASE_STORAGE_BUCKET=invitation-media
```

### `APP_URL`

- URL utama aplikasi untuk metadata, callback auth, sitemap, dan redirect reset password.
- Local biasanya `http://localhost:3000`.
- Production biasanya domain Vercel atau domain custom kamu.

### `DATABASE_URL`

- Dipakai hanya oleh skrip migrasi satu kali untuk membaca schema Prisma lama.
- Nilainya harus menunjuk ke database yang masih memiliki tabel legacy seperti `"User"`, `"Invitation"`, `"Guest"`, dan seterusnya.

### `NEXT_PUBLIC_SUPABASE_URL`

- Ambil dari Supabase Dashboard -> `Settings` -> `API` -> `Project URL`.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- Ambil dari Supabase Dashboard -> `Settings` -> `API` -> `Project API keys`.

### `SUPABASE_SECRET_KEY`

- Ambil dari Supabase Dashboard -> `Settings` -> `API`.
- Pakai key server-side ini untuk admin operations, bootstrap auth user, dan upload media saat migrasi.
- `SUPABASE_SERVICE_ROLE_KEY` masih diterima sebagai fallback kompatibilitas, tapi bukan nama env yang direkomendasikan lagi di repo ini.

### `SUPABASE_STORAGE_BUCKET`

- Bucket publik tempat cover image, gallery image, dan music file akan disimpan.
- Default repo ini: `invitation-media`.

## Bootstrap schema Supabase

1. Buka Supabase Dashboard.
2. Masuk ke `SQL Editor`.
3. Jalankan isi file `supabase/migrations/20260425_full_supabase_bootstrap.sql`.

Script SQL ini akan:

- membuat enum snake_case untuk domain app
- membuat tabel `public.*` baru yang dipakai runtime sekarang
- mengaktifkan RLS untuk flow owner/admin
- membuat policy storage untuk bucket media publik
- membuat bucket `invitation-media` jika belum ada

Tabel legacy Prisma camelCase tidak disentuh oleh SQL ini. Itu sengaja, supaya data lama tetap aman sampai migrasi selesai diverifikasi.

## Migrasi data lama ke schema baru

Setelah SQL bootstrap selesai:

```bash
npm install
npm run supabase:migrate:dry-run
npm run supabase:migrate
```

### Apa yang dilakukan skrip migrasi

- membaca data dari schema Prisma lama lewat `DATABASE_URL`
- membuat atau menyinkronkan user di Supabase Auth
- mengimpor `password_hash` lama agar password tetap bisa dipakai
- memetakan `User.id` lama ke UUID baru `auth.users.id`
- mengisi tabel `public.users`, `public.invitations`, `public.guests`, `public.rsvps`, `public.wishes`, `public.send_logs`, `public.payment_orders`, `public.user_subscriptions`, dan tabel terkait lain
- mengunggah aset yang masih direferensikan dari `public/uploads` ke Supabase Storage
- menyimpan `cover_image_storage_path`, `music_storage_path`, dan `gallery_images.storage_path` agar replace/delete berikutnya aman

### Dry run

`npm run supabase:migrate:dry-run` tidak menulis apa pun. Gunakan ini untuk cek:

- jumlah user, invitation, guest, dan plan yang akan dipindahkan
- user mana yang tidak punya `passwordHash`
- berapa aset lokal yang masih direferensikan database

### Apply

`npm run supabase:migrate` akan benar-benar menulis ke Supabase Auth, tabel `public.*`, dan Storage bucket.

## Checklist verifikasi setelah migrasi

- Login client lama masih berhasil.
- Login admin via username alias masih berhasil.
- Register user baru membuat auth user, profile row, dan default invitation.
- Dashboard setup, media, guest, RSVP, dan send log membaca data dari Supabase.
- Halaman publik `/{coupleSlug}/{guestSlug}` tampil dan RSVP/ucapan tersimpan.
- Upload media baru masuk ke Supabase Storage.
- `npm run lint`
- `npm test`
- `npm run build`

## Cleanup setelah verifikasi

Setelah semua flow lolos:

1. Drop tabel legacy NextAuth:
   - `"Account"`
   - `"Session"`
   - `"VerificationToken"`
2. Hentikan penggunaan `passwordHash` di tabel legacy `"User"`.
3. Arsipkan atau hapus `public/uploads` yang sudah tidak direferensikan lagi.

SQL bootstrap sudah menyertakan komentar cleanup opsional di bagian bawah file untuk membantu tahap ini.
