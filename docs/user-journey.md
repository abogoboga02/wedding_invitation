# User Journey

## MVP Flow
1. Register atau login.
   Tujuan: membuat akun client dan membuka dashboard.
   Input: nama, email, password.
   CTA: `Buat Akun`, `Masuk ke Dashboard`.
   Empty/error state: email sudah dipakai, password salah, field belum valid.

2. Masuk dashboard overview.
   Tujuan: melihat status undangan, progres publish, dan shortcut kerja.
   CTA: `Pilih Template`, `Setup Undangan`, `Preview`.

3. Pilih template.
   Tujuan: menentukan visual utama invitation.
   Input: satu template aktif.
   CTA: `Pilih Template`.
   Error state: belum memilih template.

4. Isi setup undangan.
   Tujuan: melengkapi pasangan, slug, acara, lokasi, copy utama.
   Input: nama pasangan, slug, event, tanggal, waktu, venue, maps, story.
   CTA: `Simpan Draft`.
   Error state: slug bentrok, data wajib kosong.

5. Upload media.
   Tujuan: melengkapi cover, gallery, dan musik.
   Input: image/audio file.
   CTA: `Upload`, `Simpan Media`.
   Error state: format file salah, ukuran terlalu besar.

6. Preview draft.
   Tujuan: memastikan hasil akhir sudah sesuai.
   CTA: `Publish Invitation`, `Kembali Edit`.
   Empty state: data inti belum lengkap.

7. Kelola guest list.
   Tujuan: tambah tamu manual atau import CSV.
   Input: nama, nomor HP, email.
   CTA: `Tambah Tamu`, `Preview Import`.
   Error state: data duplikat, CSV kosong, row invalid.

8. Generate personal link.
   Tujuan: memberi link unik ke tiap tamu.
   Output: `/{slug_pengantin}/{slug_tamu}`.
   CTA: implicit, terjadi otomatis saat tamu dibuat.

9. Kirim invitation.
   Tujuan: mendistribusikan link personal.
   CTA: `Tandai Manual`, `Kirim lewat WhatsApp`, `Kirim lewat Email`.
   MVP: logging manual send.

10. Lihat RSVP dan wishes.
    Tujuan: membaca respons tamu.
    CTA: tidak dominan, fokus monitoring.

11. Lihat analytics.
    Tujuan: melihat jumlah tamu, open, unique open, dan RSVP.

## Ditunda ke fase berikutnya
- multi invitation per client
- auto send worker
- payment gateway final
- approval moderation untuk wishes oleh admin
- template CRUD dinamis dari database
