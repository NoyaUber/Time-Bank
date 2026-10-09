# TimeBank — Starter Project

Starter untuk webapp Bank Waktu: pixel-art dashboard, autentikasi Supabase, dan klaim koin offline yang diproses secara atomik di PostgreSQL.

## Fitur yang ada di starter ini

- Halaman daftar dan masuk dengan Supabase Auth.
- Dashboard responsif bertema pixel art.
- Bank Waktu: 1 koin per menit, batas 12 jam (720 koin).
- Klaim melalui RPC database, bukan perhitungan saldo di browser.
- Tabel profil, status pemain, dan riwayat transaksi koin.
- Tombol navigasi awal untuk Garden, City, Pets, Achievements, dan Social (fitur tersebut masih placeholder).

## Kebutuhan

- Node.js versi LTS yang didukung Next.js
- Akun Supabase
- Akun Vercel opsional untuk deployment

## Setup lokal

1. Ekstrak proyek, lalu buka folder `timebank-starter`.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env.local`.
4. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari pengaturan API proyek Supabase.
5. Di Supabase, buka SQL Editor lalu jalankan isi `supabase/migrations/001_initial_schema.sql`.
6. Di Authentication > URL Configuration, atur Site URL ke URL lokal ketika development, biasanya `http://localhost:3000`.
7. Jalankan `npm run dev`, lalu buka `http://localhost:3000`.

## Catatan autentikasi

Jika konfirmasi email diaktifkan, pengguna baru perlu mengonfirmasi email sebelum sesi dibuat. Sesuaikan pengaturan konfirmasi email dan redirect URL di Supabase untuk kebutuhan proyekmu. Untuk produksi, buat halaman callback email/PKCE dan alur reset kata sandi.

## Catatan keamanan

- Jangan pernah memasukkan `service_role` key ke variabel `NEXT_PUBLIC_*`, kode browser, atau repositori.
- Fungsi `claim_offline_coins()` menggunakan `auth.uid()`, mengunci baris pemain, menghitung durasi dengan waktu database, dan mencatat hadiah ke ledger dalam transaksi yang sama.
- `player_states` dan `coin_transactions` tidak mengizinkan perubahan saldo langsung oleh client.
- Tinjau kebijakan RLS sebelum menambah fitur sosial. Profil publik di migrasi awal bisa dibaca pengguna terautentikasi; batasi kolom/data jika kebutuhan privasi berubah.
- Untuk produksi, tambahkan rate limiting, monitoring, alur reset password, verifikasi username, dan tes keamanan.

## Batas starter

Ini fondasi awal, belum seluruh produk final. Garden, City, Pets, Achievements, Social, sinkronisasi realtime, PWA/offline shell, serta pengujian otomatis belum selesai. Dashboard memakai ilustrasi kota berbasis CSS sebagai placeholder agar tidak memerlukan aset eksternal.

## Deploy ke Vercel

1. Push folder proyek ke repositori GitHub milikmu.
2. Impor repositori tersebut di Vercel.
3. Tambahkan dua environment variable Supabase yang sama dari `.env.local`.
4. Deploy dan tambahkan URL produksi ke Supabase Authentication > URL Configuration.
5. Jangan commit `.env.local`.
