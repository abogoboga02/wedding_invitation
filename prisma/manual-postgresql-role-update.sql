-- Jalankan file ini jika database sudah terlanjur dibuat sebelum kolom role ditambahkan.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'UserRole'
  ) THEN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');
  END IF;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'CLIENT';
