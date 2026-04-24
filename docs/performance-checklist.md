# Performance Checklist

- Gunakan Server Components sebagai default.
- Hindari client component untuk section marketing yang statis.
- Gunakan `next/font` untuk heading dan body font.
- Gunakan gambar responsif dan kompresi asset sebelum upload.
- Batasi gallery awal, tampilkan jumlah item yang masuk akal untuk mobile.
- Gunakan animasi ringan: opacity/translate.
- Hormati `prefers-reduced-motion`.
- Hindari dependency UI berat.
- Pastikan route publik hanya mengambil data yang dibutuhkan.
- Gunakan `connection()` hanya untuk route yang memang harus runtime.
- Gunakan metadata file route untuk SEO daripada komponen custom di client.
- Simpan upload ke path terstruktur per owner/invitation.
- Hindari chart library besar untuk analytics MVP.
- Pastikan dashboard list memakai pagination jika data membesar.
- Jaga ukuran bundle dengan memusatkan constants dan komponen reusable.
