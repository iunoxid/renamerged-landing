-- Download versions shown on the public /download page
CREATE TABLE IF NOT EXISTS public.download_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  file_name text NOT NULL,
  architecture text NOT NULL CHECK (architecture IN ('32-bit', '64-bit')),
  download_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (version, file_name, architecture)
);

ALTER TABLE public.download_versions ENABLE ROW LEVEL SECURITY;

-- Explicit grants for PostgREST roles.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.download_versions TO authenticated;

-- Prevent direct public reads; catalog is served by Edge Function gate.
DROP POLICY IF EXISTS "Public can read active download versions" ON public.download_versions;
DROP POLICY IF EXISTS "Admin can read download versions" ON public.download_versions;
CREATE POLICY "Admin can read download versions"
  ON public.download_versions
  FOR SELECT
  TO authenticated
  USING (coalesce(is_admin(), false));

-- Admin write policies.
DROP POLICY IF EXISTS "Admin can manage download versions" ON public.download_versions;
DROP POLICY IF EXISTS "Admin can insert download versions" ON public.download_versions;
DROP POLICY IF EXISTS "Admin can update download versions" ON public.download_versions;
DROP POLICY IF EXISTS "Admin can delete download versions" ON public.download_versions;

CREATE POLICY "Admin can insert download versions"
  ON public.download_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (coalesce(is_admin(), false));

CREATE POLICY "Admin can update download versions"
  ON public.download_versions
  FOR UPDATE
  TO authenticated
  USING (coalesce(is_admin(), false))
  WITH CHECK (coalesce(is_admin(), false));

CREATE POLICY "Admin can delete download versions"
  ON public.download_versions
  FOR DELETE
  TO authenticated
  USING (coalesce(is_admin(), false));

-- Keep updated_at in sync.
CREATE OR REPLACE FUNCTION public.set_download_versions_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_download_versions_updated_at ON public.download_versions;
CREATE TRIGGER trg_download_versions_updated_at
  BEFORE UPDATE ON public.download_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_download_versions_updated_at();

-- Seed one default entry from site_config when available.
INSERT INTO public.download_versions (version, file_name, architecture, download_url, sort_order, is_active)
SELECT
  COALESCE(version, '1.0.0'),
  'Renamerged-Setup-x64.exe',
  '64-bit',
  download_url,
  1,
  true
FROM public.site_config
WHERE download_url IS NOT NULL
ON CONFLICT (version, file_name, architecture) DO NOTHING;
