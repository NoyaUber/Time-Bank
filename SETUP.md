# Panduan setup TimeBank

## 1. Buat proyek Supabase
- Buat proyek baru di Supabase.
- Salin Project URL dan publishable/anon key.
- Jangan gunakan service-role key di frontend.

## 2. Jalankan database
- Buka SQL Editor.
- Jalankan `supabase/migrations/001_initial_schema.sql`.
- Periksa bahwa tabel `profiles`, `player_states`, dan `coin_transactions` terbentuk.

## 3. Konfigurasi aplikasi
Buat `.env.local` di root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

## 4. Jalankan
```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## 5. Tes aturan koin
- Daftar akun.
- Tunggu sedikitnya satu menit.
- Klaim koin.
- Periksa transaksi di `coin_transactions`.
- Uji login dari browser/perangkat lain untuk memeriksa sinkronisasi saldo.

Jangan mengubah `last_claim_at` secara manual pada database produksi untuk pengujian pengguna nyata.
