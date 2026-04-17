-- =====================================================================
-- PRODUCT SETTINGS (singleton row, id = 1)
-- =====================================================================
CREATE TABLE public.product_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Nintendo Switch V2 NOVO – Completo na Caixa',
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 750,
  installments_text TEXT NOT NULL DEFAULT '3x sem juros de R$ 250,00',
  coupon_code TEXT NOT NULL DEFAULT 'QUERO50',
  coupon_label TEXT NOT NULL DEFAULT 'R$ 50 OFF',
  location_neighborhood TEXT NOT NULL DEFAULT 'Vila Cruzeiro',
  location_city TEXT NOT NULL DEFAULT 'São Paulo',
  location_state TEXT NOT NULL DEFAULT 'SP',
  location_cep TEXT NOT NULL DEFAULT '04726010',
  photos JSONB NOT NULL DEFAULT '["/switch-main.jpg","/switch-photo2.jpg","/switch-photo3.jpg","/switch-photo4.jpg","/switch-photo5.jpg"]'::jsonb,
  details JSONB NOT NULL DEFAULT '[
    {"label":"Categoria","value":"Consoles De Vídeo Game"},
    {"label":"Marca do Console","value":"Nintendo"},
    {"label":"Modelo","value":"Nintendo Switch"},
    {"label":"Condição","value":"Novo"},
    {"label":"Características","value":"Inclui Cabos, Inclui Caixa, Inclui Controles, Inclui Jogos"},
    {"label":"Aceita trocas","value":"Não"}
  ]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.product_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_settings_public_read"
  ON public.product_settings FOR SELECT USING (true);
CREATE POLICY "product_settings_public_insert"
  ON public.product_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "product_settings_public_update"
  ON public.product_settings FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.product_settings (id, description) VALUES (1,
'Nintendo Switch V2 NOVO – Completo na Caixa

Foi presente de aniversário para o meu filho, está praticamente sem uso, novinho mesmo. Mas estou precisando levantar dinheiro urgente para pagar contas, então estou vendendo

✔️ Sem detalhes
✔️ Completo com todos acessórios
✔️ Pouquíssimo uso
✔️ Funcionando perfeitamente

🎮 Acompanha jogos: Mario, Zelda e Pokémon

💰 Valor: R$ 750,00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- SELLER SETTINGS (singleton row, id = 1)
-- =====================================================================
CREATE TABLE public.seller_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Neuza',
  masked_name TEXT NOT NULL DEFAULT 'Neuza M*** S****',
  masked_cpf TEXT NOT NULL DEFAULT '*** *** *** **',
  avatar_url TEXT NOT NULL DEFAULT '/images/neuza.jpg',
  verified BOOLEAN NOT NULL DEFAULT true,
  last_seen_text TEXT NOT NULL DEFAULT 'Último acesso há 21 min',
  member_since_text TEXT NOT NULL DEFAULT 'Na OLX desde outubro de 2013',
  location_neighborhood TEXT NOT NULL DEFAULT 'Vila Cruzeiro',
  location_city TEXT NOT NULL DEFAULT 'São Paulo',
  location_state TEXT NOT NULL DEFAULT 'SP',
  location_cep TEXT NOT NULL DEFAULT '04726010',
  profile_url TEXT NOT NULL DEFAULT 'https://conta.olx.com.br/acesso?action_type=FAVORITES&list_id=1494050970',
  sales_completed TEXT NOT NULL DEFAULT '01',
  sales_cancelled TEXT NOT NULL DEFAULT '00',
  avg_dispatch_time TEXT NOT NULL DEFAULT '20 horas',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seller_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seller_settings_public_read"
  ON public.seller_settings FOR SELECT USING (true);
CREATE POLICY "seller_settings_public_insert"
  ON public.seller_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "seller_settings_public_update"
  ON public.seller_settings FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.seller_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- CHECKOUT SETTINGS (singleton row, id = 1)
-- =====================================================================
CREATE TABLE public.checkout_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  warranty_price NUMERIC NOT NULL DEFAULT 196.99,
  shipping_original NUMERIC NOT NULL DEFAULT 41.72,
  shipping_final NUMERIC NOT NULL DEFAULT 13.82,
  shipping_days TEXT NOT NULL DEFAULT 'Até 5 dias úteis',
  pickup_location TEXT NOT NULL DEFAULT 'Vila Cruzeiro, São Paulo - SP',
  coupons JSONB NOT NULL DEFAULT '[
    {"code":"QUERO50","discount":50},
    {"code":"DESCONTO20","discount":20},
    {"code":"AMO25","discount":25}
  ]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT checkout_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.checkout_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkout_settings_public_read"
  ON public.checkout_settings FOR SELECT USING (true);
CREATE POLICY "checkout_settings_public_insert"
  ON public.checkout_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "checkout_settings_public_update"
  ON public.checkout_settings FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.checkout_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- TIMESTAMP TRIGGER
-- =====================================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_product_settings_updated
  BEFORE UPDATE ON public.product_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_seller_settings_updated
  BEFORE UPDATE ON public.seller_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_checkout_settings_updated
  BEFORE UPDATE ON public.checkout_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================================
-- STORAGE BUCKET FOR ADMIN IMAGE UPLOADS
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-images', 'admin-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "admin_images_public_read"
  ON storage.objects FOR SELECT USING (bucket_id = 'admin-images');
CREATE POLICY "admin_images_public_insert"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'admin-images');
CREATE POLICY "admin_images_public_update"
  ON storage.objects FOR UPDATE USING (bucket_id = 'admin-images') WITH CHECK (bucket_id = 'admin-images');
CREATE POLICY "admin_images_public_delete"
  ON storage.objects FOR DELETE USING (bucket_id = 'admin-images');