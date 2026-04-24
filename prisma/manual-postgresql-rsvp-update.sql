-- =========================================================
-- Patch RSVP: tambah nama responden untuk form publik
-- Jalankan di database wedding_invitation yang sudah ada
-- =========================================================

ALTER TABLE "Rsvp"
  ADD COLUMN IF NOT EXISTS "respondentName" TEXT;
