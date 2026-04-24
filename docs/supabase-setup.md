# Setup Supabase untuk Project Atelier Amora

Panduan ini menjelaskan **form pengisian** apa saja yang kamu butuhkan dari Supabase agar project ini bisa jalan.

## Form pengisian (isi dari dashboard Supabase)

Salin ke `.env`:

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=isi-secret-random
DATABASE_URL=isi-connection-string-supabase
```

### 1) `NEXTAUTH_URL`
- **Isi dengan:** URL aplikasi kamu.
- **Local:** `http://localhost:3000`
- **Production:** contoh `https://atelier-amora.com`

### 2) `AUTH_SECRET`
- **Isi dengan:** random secret untuk session/token Auth.js.
- **Cara generate cepat:**
  ```bash
  openssl rand -base64 32
  ```

### 3) `DATABASE_URL` (wajib dari Supabase)
- Ambil dari Supabase:
  1. Buka **Supabase Dashboard** → project kamu.
  2. Masuk **Settings** → **Database**.
  3. Cari bagian **Connection string**.
  4. Pilih format **URI**.
  5. Gunakan koneksi **pooler** (port `6543`) agar stabil untuk app.
- Contoh format:
  ```env
  DATABASE_URL=postgresql://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```

---

## Checklist Supabase sebelum `npm run db:push`

- [ ] Password database benar (bukan anon key).
- [ ] Project Supabase tidak paused.
- [ ] IP/Network restriction (jika ada) mengizinkan environment kamu.
- [ ] Nilai `DATABASE_URL` sudah URL-encoded kalau password punya karakter khusus.

---

## Jalankan migrasi/schema ke Supabase

```bash
npm install
npm run db:generate
npm run db:push
```

Jika sukses, tabel dari Prisma akan otomatis dibuat di database Supabase kamu.
