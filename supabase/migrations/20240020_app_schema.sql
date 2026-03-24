-- App Schema — all tables needed by the customer app
-- Idempotent: safe to run multiple times (IF NOT EXISTS + DO blocks for policies)

-- ─── Vehicles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make          TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INTEGER NOT NULL,
  color         TEXT,
  license_plate TEXT,
  vin           TEXT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Customers view own vehicles') THEN
    CREATE POLICY "Customers view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = customer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Customers insert own vehicles') THEN
    CREATE POLICY "Customers insert own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = customer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Customers update own vehicles') THEN
    CREATE POLICY "Customers update own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = customer_id);
  END IF;
END $$;

-- ─── Service Jobs ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.service_jobs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id           UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  service_type         TEXT NOT NULL DEFAULT 'Service',
  service_category     TEXT NOT NULL DEFAULT 'custom',
  status               TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','awaiting_parts','quality_check','completed','cancelled')),
  progress_percent     INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  current_stage_name   TEXT NOT NULL DEFAULT 'Intake',
  estimated_completion DATE,
  started_at           TIMESTAMPTZ DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,
  technician_name      TEXT DEFAULT 'Wraptors Team',
  notes                TEXT,
  total_cost           NUMERIC(10,2),
  invoice_url          TEXT,
  stages               JSONB DEFAULT '[]',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='service_jobs' AND policyname='Customers view own jobs') THEN
    CREATE POLICY "Customers view own jobs" ON public.service_jobs FOR SELECT USING (auth.uid() = customer_id);
  END IF;
END $$;

-- ─── Quote Requests ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name      TEXT NOT NULL,
  customer_email     TEXT NOT NULL,
  customer_phone     TEXT,
  vehicle_info       TEXT,
  service_categories TEXT[] DEFAULT '{}',
  service_details    TEXT,
  additional_info    TEXT,
  status             TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','reviewing','quoted','accepted','declined')),
  quoted_price       NUMERIC(10,2),
  quoted_at          TIMESTAMPTZ,
  source             TEXT DEFAULT 'app',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quote_requests' AND policyname='Customers view own quotes') THEN
    CREATE POLICY "Customers view own quotes" ON public.quote_requests FOR SELECT USING (auth.uid() = customer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quote_requests' AND policyname='Anyone can submit a quote') THEN
    CREATE POLICY "Anyone can submit a quote" ON public.quote_requests FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ─── Campaigns (Offers) ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  offer_headline  TEXT,
  offer_body      TEXT,
  offer_code      TEXT,
  discount_value  NUMERIC(10,2),
  discount_type   TEXT CHECK (discount_type IN ('percentage','fixed','none')),
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','expired')),
  members_only    BOOLEAN DEFAULT FALSE,
  offer_cta       TEXT DEFAULT 'Book Now',
  image_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='campaigns' AND policyname='All authenticated users view active campaigns') THEN
    CREATE POLICY "All authenticated users view active campaigns" ON public.campaigns FOR SELECT USING (status = 'active');
  END IF;
END $$;

-- ─── App Notifications ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'service_update',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  link_to     TEXT,
  cta_label   TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_notifications' AND policyname='Customers view own notifications') THEN
    CREATE POLICY "Customers view own notifications" ON public.app_notifications FOR SELECT USING (auth.uid() = customer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_notifications' AND policyname='Customers update own notifications') THEN
    CREATE POLICY "Customers update own notifications" ON public.app_notifications FOR UPDATE USING (auth.uid() = customer_id);
  END IF;
END $$;

-- ─── Services Catalog ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.services (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category       TEXT NOT NULL,
  name           TEXT NOT NULL,
  tagline        TEXT,
  description    TEXT,
  benefits       TEXT[] DEFAULT '{}',
  price_range    TEXT,
  estimated_days TEXT,
  image_url      TEXT,
  popular        BOOLEAN DEFAULT FALSE,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='Anyone can view active services') THEN
    CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = TRUE);
  END IF;
END $$;

-- ─── Updated_at trigger for service_jobs ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_jobs_updated_at ON public.service_jobs;
CREATE TRIGGER service_jobs_updated_at
  BEFORE UPDATE ON public.service_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
