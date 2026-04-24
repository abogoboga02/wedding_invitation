# Security Checklist

## Auth
- Gunakan bcrypt untuk password hash.
- Simpan secret hanya di env.
- Pastikan role masuk ke session/JWT server-side.

## Authorization
- Pisahkan guard `CLIENT` dan `ADMIN`.
- Lindungi route dashboard/admin di layout server.
- Validasi kepemilikan invitation pada semua action penting.

## Upload
- Validasi mime type.
- Validasi ukuran file.
- Sanitasi nama file.
- Simpan file ke direktori terstruktur.

## Input
- Validasi pakai Zod.
- Sanitasi slug dan cegah reserved slug.
- Batasi panjang note dan wish.

## API
- Tolak request tanpa session.
- Batasi channel yang diterima dengan enum.
- Kembalikan error generik untuk input invalid.

## Database
- Gunakan unique index untuk email, slug, guestSlug.
- Gunakan foreign key dan cascade yang jelas.
- Hindari query lintas owner tanpa filter role/admin.

## Logging
- Simpan send log terpisah.
- Jangan log password atau secret.

## Rate Limit / Abuse
- Tambahkan rate limiting untuk RSVP/wish/public submit di fase berikutnya.
- Tambahkan throttling upload bila traffic mulai naik.

## Future
- Tambahkan payment signature validation saat gateway masuk.
- Tambahkan audit log admin jika panel mulai sering dipakai tim.
