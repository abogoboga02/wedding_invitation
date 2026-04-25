# README Debug Database & Performance

Panduan ini fokus untuk **debug cepat** masalah database Supabase dan performa aplikasi sebelum deploy.

---

## 1) Cek Environment Variable
Pastikan file `.env.local` berisi:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (jika dipakai server-side)
- `DATABASE_URL` (jika pakai direct DB connection)

Checklist:
- [ ] Semua env sudah ada di lokal
- [ ] Semua env sudah ditambahkan di Vercel (Project Settings → Environment Variables)
- [ ] Tidak ada typo pada nama variable
- [ ] Nilai env tidak tertukar (mis. anon key vs service role key)
- [ ] Dev server di-restart setelah mengubah `.env.local`

Contoh command:
```bash
# Cek env terkait Supabase di shell saat ini
env | grep -E 'SUPABASE|DATABASE_URL|NEXT_PUBLIC_SUPABASE'
```

---

## 2) Cek Koneksi Supabase
Checklist:
- [ ] Project URL benar
- [ ] Anon key benar
- [ ] Tabel yang diakses benar-benar ada
- [ ] RLS policy tidak memblokir query
- [ ] User login punya role/akses sesuai policy

Contoh verifikasi cepat di code:
```ts
const { data, error } = await supabase.from('workspaces').select('id').limit(1)
console.log({ data, error })
```

Jika `error` muncul:
- cek RLS policy
- cek key yang digunakan (anon/service role)
- cek nama tabel & kolom

---

## 3) Cara Cek Query Supabase yang Berat
Checklist:
- [ ] Cek query yang mengembalikan data terlalu banyak
- [ ] Cek query tanpa pagination (`range`, `limit`)
- [ ] Cek query dengan filter kurang spesifik
- [ ] Cek query berulang di route/komponen yang sama

Cara cek:
1. Buka browser DevTools → **Network**.
2. Filter request ke endpoint Supabase.
3. Lihat request yang durasi paling lama / payload terbesar.
4. Catat endpoint + parameter query.

Tips:
- Tambahkan log waktu sebelum/sesudah query.
- Bandingkan durasi query saat cold start vs warm cache.

---

## 4) Pastikan Tidak Memakai `select("*")`
`select("*")` sering ambil data berlebihan dan memperlambat response.

### Contoh salah
```ts
const { data } = await supabase
  .from('invitations')
  .select('*')
```

### Contoh benar
```ts
const { data } = await supabase
  .from('invitations')
  .select('id, guest_name, status, updated_at')
  .order('updated_at', { ascending: false })
  .range(0, 49)
```

Checklist:
- [ ] Semua query memilih kolom spesifik
- [ ] Query list memakai pagination (`range`/`limit`)
- [ ] Kolom besar (JSON/text panjang) hanya diambil saat perlu

---

## 5) Cara Cek Data yang Sering Fetch Ulang
Checklist:
- [ ] Cek apakah query dipanggil ulang saat komponen mount/unmount
- [ ] Cek apakah query key berubah-ubah (unstable key)
- [ ] Cek apakah refetch terjadi saat window focus/reconnect
- [ ] Cek apakah route change memicu fetch yang sama berulang

Langkah cepat:
1. Tambahkan `console.count('fetch:workspaces')` di function fetcher.
2. Pindah halaman/workspace beberapa kali.
3. Jika count naik terus tanpa alasan, evaluasi query key & cache.

---

## 6) Cara Cek Cache React Query / Fetch Cache

### React Query
Checklist:
- [ ] Query key stabil (contoh: `['workspace', workspaceId]`)
- [ ] `staleTime` sesuai kebutuhan
- [ ] `gcTime`/`cacheTime` tidak terlalu pendek
- [ ] `refetchOnWindowFocus` tidak terlalu agresif

Contoh konfigurasi:
```ts
useQuery({
  queryKey: ['workspace', workspaceId],
  queryFn: fetchWorkspace,
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
})
```

### Fetch Cache (Next.js/App Router)
Checklist:
- [ ] Gunakan strategi cache yang sesuai (`force-cache` / `no-store` / revalidate)
- [ ] Endpoint yang jarang berubah tidak memakai `no-store`
- [ ] Hindari invalidasi cache berlebihan

Contoh:
```ts
await fetch('/api/dashboard', { cache: 'force-cache' })
// atau
await fetch('/api/dashboard', { next: { revalidate: 60 } })
```

---

## 7) Cara Debug Delay Saat Pindah Workspace
Checklist:
- [ ] Ukur waktu dari klik hingga data siap render
- [ ] Cek query yang dipanggil berantai (waterfall)
- [ ] Cek apakah ada blocking di middleware/server action
- [ ] Cek apakah data workspace lama dibersihkan terlalu cepat

Langkah debug:
1. Tandai waktu saat user klik workspace.
2. Log waktu mulai/selesai tiap query utama.
3. Cek Network waterfall.
4. Optimasi: paralelkan query, preload data, dan cache query penting.

Contoh log:
```ts
console.time('switch-workspace-total')
// ... proses switch + query
console.timeEnd('switch-workspace-total')
```

---

## 8) Cara Cek Komponen yang Sering Re-render
Checklist:
- [ ] Aktifkan React DevTools Profiler
- [ ] Cari komponen dengan render count tinggi
- [ ] Cek props/object/function yang selalu dibuat ulang
- [ ] Gunakan `useMemo` / `useCallback` jika memang perlu

Langkah cepat:
1. Record profiling saat aksi (mis. switch workspace).
2. Lihat komponen mana yang re-render paling sering.
3. Pastikan state global/context tidak memicu render masif.

---

## 9) Cara Cek Apakah Routing Menyebabkan Full Reload
Checklist:
- [ ] Navigasi internal pakai `<Link>` / router API yang benar
- [ ] Tidak ada `window.location.href` untuk route internal
- [ ] Tidak ada hard refresh tidak sengaja dari form submit
- [ ] Di Network tidak muncul reload semua asset setiap pindah halaman

Indikator full reload:
- JS/CSS utama di-download ulang setiap pindah route.
- State in-memory hilang total.

---

## 10) Checklist Cepat Sebelum Deploy ke Vercel
- [ ] Semua environment variable produksi sudah diset
- [ ] Query penting sudah tanpa `select('*')`
- [ ] List data utama sudah pakai pagination
- [ ] Cache strategy sudah ditentukan (React Query / fetch)
- [ ] Tidak ada refetch loop di halaman utama
- [ ] RLS policy sudah dites dengan role user nyata
- [ ] Navigasi antar halaman tidak menyebabkan full reload
- [ ] Tidak ada error kritis di browser console
- [ ] Tidak ada request Supabase yang timeout berulang
- [ ] Build dan test lokal sudah lolos

Contoh command sebelum deploy:
```bash
# sesuaikan dengan package manager
npm run lint
npm run build
npm run start
```

---

## Ringkasan Anti-Pattern yang Wajib Dihindari
- Query pakai `select('*')` tanpa alasan kuat
- Mengambil ribuan row tanpa pagination
- Query key React Query tidak stabil
- Mematikan cache di semua endpoint tanpa pertimbangan
- Full reload untuk navigasi internal
