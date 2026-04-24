-- =========================================================
-- Admin seed untuk local development
-- =========================================================
-- Login admin tetap memakai halaman yang sama:
--   /login
-- Setelah role = ADMIN, user bisa masuk ke:
--   /admin
--
-- Default admin baru:
--   email    : admin@ateliermempelai.local
--   password : Admin12345!
--
-- Password hash di bawah dibuat dengan bcrypt(12).
-- Ganti password ini setelah local setup selesai jika perlu.
-- =========================================================

-- ---------------------------------------------------------
-- Opsi 1: Promote user yang sudah ada menjadi ADMIN
-- ---------------------------------------------------------
UPDATE "User"
SET
  "role" = 'ADMIN',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'admin@wedding.local';

-- Ganti email di atas sesuai akun yang sudah ada.

-- ---------------------------------------------------------
-- Opsi 2: Buat akun admin baru dari nol
-- ---------------------------------------------------------
INSERT INTO "User" (
  "id",
  "name",
  "email",
  "passwordHash",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES (
  'usr_admin_local_001',
  'Admin Local',
  'admin@ateliermempelai.local',
  '$2b$12$fJfRgT9/HQRuX3NqYFd1ROlcbcVNVTuzX5vD6aT2Rx4JT/J968gB.',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "updatedAt" = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------
-- Cek hasil admin yang aktif
-- ---------------------------------------------------------
SELECT
  "id",
  "name",
  "email",
  "role",
  "createdAt",
  "updatedAt"
FROM "User"
WHERE "role" = 'ADMIN'
ORDER BY "createdAt" ASC;
