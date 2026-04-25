-- Tambah katalog template yang punya harga sendiri
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  template_slug TEXT NOT NULL UNIQUE,
  template_category TEXT NOT NULL,
  template_preview TEXT NOT NULL,
  template_price INTEGER NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Simpan snapshot info template di payment order agar harga historis tetap aman
ALTER TABLE payment_orders
  ADD COLUMN IF NOT EXISTS template_ref_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS template_name TEXT,
  ADD COLUMN IF NOT EXISTS template_price INTEGER,
  ADD COLUMN IF NOT EXISTS selected_package "PlanTier";

CREATE INDEX IF NOT EXISTS payment_orders_template_ref_id_status_idx
  ON payment_orders(template_ref_id, status);

-- Seed awal katalog template
INSERT INTO templates (
  template_id,
  template_name,
  template_slug,
  template_category,
  template_preview,
  template_price,
  is_premium,
  is_active
)
VALUES
  ('ELEGANT_LUXURY', 'Elegant Luxury', 'elegant-luxury', 'CLASSIC', '/templates/elegant-luxury-preview.jpg', 249000, TRUE, TRUE),
  ('KOREAN_SOFT', 'Korean Soft', 'korean-soft', 'ROMANTIC', '/templates/korean-soft-preview.jpg', 149000, FALSE, TRUE),
  ('MODERN_MINIMAL', 'Modern Minimal', 'modern-minimal', 'MODERN', '/templates/modern-minimal-preview.jpg', 179000, FALSE, TRUE)
ON CONFLICT (template_id) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  template_slug = EXCLUDED.template_slug,
  template_category = EXCLUDED.template_category,
  template_preview = EXCLUDED.template_preview,
  template_price = EXCLUDED.template_price,
  is_premium = EXCLUDED.is_premium,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());
