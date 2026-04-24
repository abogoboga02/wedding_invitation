# Atelier Amora

MVP web app undangan digital berbasis Next.js 16, TypeScript, Tailwind v4, Auth.js, Prisma, dan PostgreSQL.

## Fitur MVP

- Homepage premium mobile-first
- Auth email/password untuk client pengantin
- Dashboard builder undangan
- Admin panel dasar untuk monitoring user, invitation, plan, dan send log
- Tiga template live: Elegant Luxury, Korean Soft, Modern Minimal
- Guest management manual + import CSV
- Upload cover dan galeri kecil
- Link personal tamu: `/{coupleSlug}/{guestSlug}`
- RSVP + ucapan di halaman undangan publik
- Pricing page, SEO metadata, sitemap, robots, dan OG image dasar

## Setup Lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `NEXTAUTH_URL`, `AUTH_SECRET`, dan `DATABASE_URL`.
   Nilai `NEXTAUTH_URL` wajib memakai protokol lengkap, mis. `http://localhost:3000` atau `https://your-app.vercel.app`.
3. Jalankan:

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

## Script Penting

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test`
- `npm run db:generate`
- `npm run db:push`

## Catatan

- Upload gambar disimpan ke `public/uploads/` untuk MVP.
- Prisma schema memakai PostgreSQL sebagai default.
- Undangan publik hanya tampil jika status sudah `PUBLISHED`.
- Deliverable dokumen produk/arsitektur/checklist ada di folder `docs/`.
- Jika pakai Supabase, isi variabel environment mengikuti panduan `docs/supabase-setup.md`.
