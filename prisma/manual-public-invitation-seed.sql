-- =========================================================
-- Dummy seed untuk route publik undangan personal
-- =========================================================
-- Jalankan di database: wedding_invitation
--
-- Route test yang akan aktif setelah seed ini:
--   /adrian-dan-selma/angga
--   /meira-dan-fathan/sinta
--   /nara-dan-raka/budi
-- =========================================================

-- ---------------------------------------------------------
-- 1. Pastikan user dummy tersedia
-- ---------------------------------------------------------
INSERT INTO "User" (
  "name",
  "email",
  "passwordHash",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'Demo Elegant Luxury',
    'demo.elegant@atelier.local',
    NULL,
    'CLIENT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Demo Korean Soft',
    'demo.korean@atelier.local',
    NULL,
    'CLIENT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Demo Modern Minimal',
    'demo.minimal@atelier.local',
    NULL,
    'CLIENT',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("email") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "updatedAt" = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------
-- 2. Reset invitation sample lama milik user dummy
-- ---------------------------------------------------------
DELETE FROM "Invitation"
WHERE "ownerId" IN (
  SELECT "id"
  FROM "User"
  WHERE "email" IN (
    'demo.elegant@atelier.local',
    'demo.korean@atelier.local',
    'demo.minimal@atelier.local'
  )
);

-- ---------------------------------------------------------
-- 3. Buat invitation published untuk tiga template
-- ---------------------------------------------------------
INSERT INTO "Invitation" (
  "id",
  "ownerId",
  "template",
  "status",
  "coupleSlug",
  "partnerOneName",
  "partnerTwoName",
  "headline",
  "subheadline",
  "story",
  "closingNote",
  "templateConfig",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'inv_demo_elegant_001',
  "id",
  'ELEGANT_LUXURY',
  'PUBLISHED',
  'adrian-dan-selma',
  'Adrian',
  'Selma',
  'The Wedding of',
  'Kami mengundang Anda hadir di malam perayaan yang hangat, formal, dan penuh makna.',
  'Perjalanan kami dimulai dari obrolan sederhana, lalu tumbuh menjadi keyakinan untuk melangkah bersama dalam satu perayaan yang ingin kami bagi dengan orang-orang terdekat.',
  'Terima kasih telah meluangkan waktu untuk hadir dan menyertai hari istimewa kami dengan doa terbaik.',
  '{
    "ceremonialQuote": "A refined evening to celebrate a promise made with grace and devotion.",
    "dressCode": "Formal attire",
    "receptionNote": "Mohon hadir 30 menit lebih awal agar prosesi berjalan dengan nyaman."
  }'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
WHERE "email" = 'demo.elegant@atelier.local';

INSERT INTO "Invitation" (
  "id",
  "ownerId",
  "template",
  "status",
  "coupleSlug",
  "partnerOneName",
  "partnerTwoName",
  "headline",
  "subheadline",
  "story",
  "closingNote",
  "templateConfig",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'inv_demo_korean_001',
  "id",
  'KOREAN_SOFT',
  'PUBLISHED',
  'meira-dan-fathan',
  'Meira',
  'Fathan',
  'The Wedding of',
  'Dengan sukacita yang lembut, kami ingin berbagi hari yang kami jaga dengan penuh syukur.',
  'Cerita kami tumbuh perlahan, hangat, dan sederhana. Di hari ini, kami ingin mengundang Anda untuk hadir sebagai bagian dari momen yang akan selalu kami kenang.',
  'Terima kasih sudah menjadi bagian dari cerita yang kami rayakan dengan hati yang penuh syukur.',
  '{
    "openingMood": "Kami menyiapkan hari ini dengan bahagia, dan akan semakin lengkap bila Anda hadir bersama kami.",
    "photoCaption": "Potongan kecil dari perjalanan yang kami syukuri.",
    "gratitudeNote": "Terima kasih untuk doa, perhatian, dan kehadiran yang berarti."
  }'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
WHERE "email" = 'demo.korean@atelier.local';

INSERT INTO "Invitation" (
  "id",
  "ownerId",
  "template",
  "status",
  "coupleSlug",
  "partnerOneName",
  "partnerTwoName",
  "headline",
  "subheadline",
  "story",
  "closingNote",
  "templateConfig",
  "publishedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  'inv_demo_minimal_001',
  "id",
  'MODERN_MINIMAL',
  'PUBLISHED',
  'nara-dan-raka',
  'Nara',
  'Raka',
  'The Wedding of',
  'Perayaan yang ringkas, hangat, dan personal untuk orang-orang terdekat kami.',
  'Kami memilih merayakan hari ini dengan sederhana namun penuh arti. Kehadiran Anda akan membuat perayaan kami terasa jauh lebih lengkap.',
  'Sampai bertemu di hari kami. Kehadiran dan doa Anda sangat berarti bagi kami.',
  '{
    "openingLabel": "Join us",
    "scheduleNote": "Acara akan dimulai tepat waktu dengan suasana yang tenang dan intim.",
    "closingTagline": "See you on our day."
  }'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
WHERE "email" = 'demo.minimal@atelier.local';

-- ---------------------------------------------------------
-- 4. Setting publik per invitation
-- ---------------------------------------------------------
INSERT INTO "InvitationSetting" (
  "invitationId",
  "locale",
  "timezone",
  "isRsvpEnabled",
  "isWishEnabled",
  "autoPlayMusic",
  "preferredSendChannel",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'inv_demo_elegant_001',
    'id-ID',
    'Asia/Jakarta',
    true,
    true,
    true,
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'inv_demo_korean_001',
    'id-ID',
    'Asia/Jakarta',
    true,
    true,
    true,
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'inv_demo_minimal_001',
    'id-ID',
    'Asia/Jakarta',
    true,
    true,
    true,
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- ---------------------------------------------------------
-- 5. Jadwal acara
-- ---------------------------------------------------------
INSERT INTO "EventSlot" (
  "id",
  "invitationId",
  "label",
  "startsAt",
  "venueName",
  "address",
  "mapsUrl",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'evt_demo_elegant_akad',
    'inv_demo_elegant_001',
    'Akad Nikah',
    TIMESTAMP '2026-07-12 09:00:00',
    'Ballroom Arunika',
    'Jl. Mawar Selatan No. 18, Jakarta Selatan',
    'https://maps.google.com/?q=Jakarta+Selatan',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'evt_demo_elegant_resepsi',
    'inv_demo_elegant_001',
    'Resepsi',
    TIMESTAMP '2026-07-12 18:30:00',
    'Ballroom Arunika',
    'Jl. Mawar Selatan No. 18, Jakarta Selatan',
    'https://maps.google.com/?q=Jakarta+Selatan',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'evt_demo_korean_akad',
    'inv_demo_korean_001',
    'Pemberkatan',
    TIMESTAMP '2026-08-08 10:00:00',
    'Glass House Meira',
    'Jl. Melati Putih No. 7, Bandung',
    'https://maps.google.com/?q=Bandung',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'evt_demo_korean_resepsi',
    'inv_demo_korean_001',
    'Intimate Reception',
    TIMESTAMP '2026-08-08 13:00:00',
    'Glass House Meira',
    'Jl. Melati Putih No. 7, Bandung',
    'https://maps.google.com/?q=Bandung',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'evt_demo_minimal_akad',
    'inv_demo_minimal_001',
    'Wedding Ceremony',
    TIMESTAMP '2026-09-19 15:00:00',
    'Studio Hall Nara',
    'Jl. Purnama No. 11, Surabaya',
    'https://maps.google.com/?q=Surabaya',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'evt_demo_minimal_resepsi',
    'inv_demo_minimal_001',
    'After Party',
    TIMESTAMP '2026-09-19 18:00:00',
    'Studio Hall Nara',
    'Jl. Purnama No. 11, Surabaya',
    'https://maps.google.com/?q=Surabaya',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- ---------------------------------------------------------
-- 6. Tamu personal
-- ---------------------------------------------------------
INSERT INTO "Guest" (
  "id",
  "invitationId",
  "name",
  "guestSlug",
  "phone",
  "email",
  "source",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'gst_demo_elegant_angga',
    'inv_demo_elegant_001',
    'Angga',
    'angga',
    '081200001001',
    'angga@example.com',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_elegant_nina',
    'inv_demo_elegant_001',
    'Nina',
    'nina',
    '081200001002',
    'nina@example.com',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_korean_sinta',
    'inv_demo_korean_001',
    'Sinta',
    'sinta',
    '081200002001',
    'sinta@example.com',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_korean_rahma',
    'inv_demo_korean_001',
    'Rahma',
    'rahma',
    '081200002002',
    'rahma@example.com',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_minimal_budi',
    'inv_demo_minimal_001',
    'Budi',
    'budi',
    '081200003001',
    'budi@example.com',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_minimal_tari',
    'inv_demo_minimal_001',
    'Tari',
    'tari',
    '081200003002',
    'tari@example.com',
    'MANUAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- ---------------------------------------------------------
-- 7. Contoh RSVP + wishes agar halaman publik terlihat hidup
-- ---------------------------------------------------------
INSERT INTO "Rsvp" (
  "guestId",
  "status",
  "attendees",
  "note",
  "respondedAt",
  "updatedAt"
)
VALUES
  (
    'gst_demo_elegant_angga',
    'ATTENDING',
    2,
    'Siap hadir bersama pasangan.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_korean_sinta',
    'ATTENDING',
    1,
    'Tidak sabar ikut merayakan.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_minimal_budi',
    'MAYBE',
    1,
    'Masih menyesuaikan jadwal kantor.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

INSERT INTO "Wish" (
  "guestId",
  "invitationId",
  "message",
  "isApproved",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'gst_demo_elegant_angga',
    'inv_demo_elegant_001',
    'Selamat menempuh hidup baru. Semoga pernikahan kalian dipenuhi kebahagiaan dan ketenangan.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_korean_sinta',
    'inv_demo_korean_001',
    'Ikut senang sekali melihat perjalanan kalian sampai di titik ini. Semoga selalu hangat dan saling menjaga.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'gst_demo_minimal_budi',
    'inv_demo_minimal_001',
    'Selamat untuk hari bahagianya. Semoga semua langkah ke depan terasa ringan dan penuh syukur.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- ---------------------------------------------------------
-- 8. Cek cepat route yang siap dites
-- ---------------------------------------------------------
SELECT
  i."template",
  i."coupleSlug",
  g."guestSlug",
  '/' || i."coupleSlug" || '/' || g."guestSlug" AS "publicRoute"
FROM "Invitation" i
JOIN "Guest" g
  ON g."invitationId" = i."id"
WHERE i."id" IN (
  'inv_demo_elegant_001',
  'inv_demo_korean_001',
  'inv_demo_minimal_001'
)
ORDER BY i."template", g."guestSlug";
