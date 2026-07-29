-- ============================================================
-- SISTEM ADMINISTRASI PENERIMAAN ORDER
-- Kantor Notaris & PPAT Renny Fonda
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- 1. Tabel klien
CREATE TABLE klien (
  id          BIGSERIAL PRIMARY KEY,
  nama        TEXT NOT NULL,
  nik         TEXT UNIQUE,
  telepon     TEXT,
  email       TEXT,
  alamat      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel jenis layanan
CREATE TABLE jenis_layanan (
  id    BIGSERIAL PRIMARY KEY,
  nama  TEXT NOT NULL UNIQUE
);

INSERT INTO jenis_layanan (nama) VALUES
  ('Akta Jual Beli'),
  ('Akta Hibah'),
  ('Akta Pendirian Perusahaan'),
  ('Akta Perjanjian'),
  ('Sertifikat Tanah'),
  ('Pemberian Hak Tanggungan'),
  ('Perjanjian Kredit'),
  ('Akta Tukar Menukar'),
  ('Legalisasi Dokumen'),
  ('Lainnya');

-- 3. Tabel order
CREATE TABLE orders (
  id              BIGSERIAL PRIMARY KEY,
  nomor_order     TEXT UNIQUE NOT NULL,
  klien_id        BIGINT REFERENCES klien(id) ON DELETE SET NULL,
  layanan_id      BIGINT REFERENCES jenis_layanan(id) ON DELETE SET NULL,
  tanggal_masuk   DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_selesai DATE,
  status          TEXT NOT NULL DEFAULT 'menunggu'
                    CHECK (status IN ('menunggu','diproses','selesai','batal')),
  catatan         TEXT,
  biaya           NUMERIC(15,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate nomor order: ORD-YYYYMM-XXXX
CREATE OR REPLACE FUNCTION generate_nomor_order()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  seq    INT;
BEGIN
  prefix := 'ORD-' || TO_CHAR(NOW(), 'YYYYMM') || '-';
  SELECT COUNT(*) + 1 INTO seq
    FROM orders
   WHERE nomor_order LIKE prefix || '%';
  NEW.nomor_order := prefix || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nomor_order
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.nomor_order = '' OR NEW.nomor_order IS NULL)
EXECUTE FUNCTION generate_nomor_order();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Tabel dokumen (lampiran per order)
CREATE TABLE dokumen (
  id          BIGSERIAL PRIMARY KEY,
  order_id    BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  nama_file   TEXT NOT NULL,
  keterangan  TEXT,
  status_dok  TEXT DEFAULT 'belum_lengkap'
                CHECK (status_dok IN ('belum_lengkap','lengkap')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. View ringkasan untuk dashboard
CREATE OR REPLACE VIEW v_dashboard AS
SELECT
  COUNT(*) FILTER (WHERE status = 'menunggu')  AS total_menunggu,
  COUNT(*) FILTER (WHERE status = 'diproses')  AS total_diproses,
  COUNT(*) FILTER (WHERE status = 'selesai')   AS total_selesai,
  COUNT(*) FILTER (WHERE status = 'batal')     AS total_batal,
  COUNT(*)                                      AS total_order,
  COUNT(*) FILTER (WHERE tanggal_masuk >= DATE_TRUNC('month', CURRENT_DATE)) AS order_bulan_ini
FROM orders;

-- 6. View order lengkap (join klien + layanan)
CREATE OR REPLACE VIEW v_orders AS
SELECT
  o.id,
  o.nomor_order,
  o.status,
  o.tanggal_masuk,
  o.tanggal_selesai,
  o.catatan,
  o.biaya,
  o.created_at,
  o.updated_at,
  k.id         AS klien_id,
  k.nama       AS klien_nama,
  k.telepon    AS klien_telepon,
  k.nik        AS klien_nik,
  jl.id        AS layanan_id,
  jl.nama      AS layanan_nama
FROM orders o
LEFT JOIN klien k  ON k.id  = o.klien_id
LEFT JOIN jenis_layanan jl ON jl.id = o.layanan_id
ORDER BY o.created_at DESC;

-- 7. RLS — aktifkan Row Level Security (opsional, bisa skip dulu)
-- ALTER TABLE klien ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dokumen ENABLE ROW LEVEL SECURITY;

-- Selesai! Lanjut setup env di .env.local
