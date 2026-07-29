# Sistem Administrasi Penerimaan Order
## Kantor Notaris & PPAT Renny Fonda

**Tugas Akhir — Rifki Maulana Yusuf (2357570007)**  
Program Studi Manajemen Informatika, Politeknik PGRI Banten 2026

---

## Stack Teknologi
- **Frontend**: React 18 + Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS custom (tidak pakai library)
- **Chart**: Recharts
- **Routing**: React Router v6

---

## Cara Setup (Langkah demi Langkah)

### 1. Setup Supabase

1. Buka https://supabase.com → buat akun → **New Project**
2. Isi nama project, password DB, pilih region (Singapore paling dekat)
3. Tunggu project siap (~2 menit)
4. Buka **SQL Editor** → paste isi file `supabase_schema.sql` → klik **Run**
5. Pergi ke **Project Settings → API**, copy:
   - `Project URL`
   - `anon public` key

### 2. Setup Project Lokal

```bash
# Clone / extract folder notaris-app
cd notaris-app

# Install dependencies
npm install

# Buat file .env.local (jangan di-commit ke GitHub!)
cp .env.local .env.local.bak
```

Edit file `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```

### 3. Jalankan

```bash
npm run dev
```

Buka browser: http://localhost:5173

---

## Fitur Lengkap

| Modul | Fitur |
|-------|-------|
| **Dashboard** | Statistik order, grafik distribusi layanan, order terbaru |
| **Penerimaan Order** | CRUD order, filter status & pencarian, update status cepat, auto-generate nomor order |
| **Data Klien** | CRUD klien, data lengkap (NIK, telepon, email, alamat), pencarian |
| **Dokumen** | CRUD dokumen per order, status kelengkapan berkas, filter |
| **Laporan** | Filter periode, grafik bar & pie, rekap per jenis layanan |

---

## Struktur Database

```
klien          → data klien
jenis_layanan  → master jenis layanan (seed otomatis)
orders         → data order (auto nomor: ORD-YYYYMM-XXXX)
dokumen        → berkas/dokumen per order
v_dashboard    → view statistik dashboard
v_orders       → view order lengkap dengan join
```

---

## Build untuk Produksi

```bash
npm run build
# Output ada di folder dist/
# Deploy ke Vercel / Netlify / hosting apapun
```

---

## Catatan untuk Skripsi

Sistem ini menggunakan:
- **Metode Waterfall** untuk pengembangan
- **PHP diganti React** (lebih modern, SPA)
- **MySQL diganti Supabase** (PostgreSQL berbasis cloud, gratis tier cukup untuk TA)
- Bisa dijadikan **prototype** untuk pengujian kuesioner
