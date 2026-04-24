-- =========================================================
-- Admin seed untuk local development
-- =========================================================
-- Login admin tetap memakai halaman yang sama:
--   /login
-- Setelah role = ADMIN, user bisa masuk ke:
--   /admin
--
-- Default admin baru:
--   username : admin
--   email    : admin@atelieramora.local
--   password : admin
--
-- Password hash di bawah dibuat dengan bcrypt(12).
-- Ganti password ini setelah local setup selesai jika perlu.
-- =========================================================

-- ---------------------------------------------------------
-- Opsi 1: Promote user yang sudah ada menjadi ADMIN
-- ---------------------------------------------------------
UPDATE "User"
SET
  "name" = 'admin',
  "role" = 'ADMIN',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "email" = 'admin@atelieramora.local';

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
  'admin',
  'admin@atelieramora.local',
  '$2b$12$cw./7fhR8JPMOJLrSrOJeuAKGkSH8b4fxUwchkMeSKiLxrTgEmBpG',
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
