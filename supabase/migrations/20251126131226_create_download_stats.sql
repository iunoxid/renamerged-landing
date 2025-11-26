/*
  # Download Statistics Tracking

  1. New Tables
    - `download_stats`
      - `id` (uuid, primary key) - Unique identifier
      - `total_downloads` (integer) - Total number of successful downloads
      - `last_updated` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Record creation time
    
    - `download_logs`
      - `id` (uuid, primary key) - Unique identifier
      - `downloaded_at` (timestamptz) - Download timestamp
      - `ip_hash` (text, optional) - Hashed IP for analytics (privacy-safe)
      - `user_agent` (text, optional) - Browser info for analytics

  2. Security
    - Enable RLS on both tables
    - Allow public SELECT on download_stats (read-only)
    - No public INSERT/UPDATE/DELETE (will use Edge Function for security)
    - download_logs is fully protected (admin only via Edge Function)

  3. Initial Data
    - Insert initial stats record with 0 downloads
*/

-- Create download_stats table
CREATE TABLE IF NOT EXISTS download_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_downloads integer DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create download_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  downloaded_at timestamptz DEFAULT now(),
  ip_hash text,
  user_agent text
);

-- Enable RLS
ALTER TABLE download_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- Public can only read the stats (not insert/update/delete)
CREATE POLICY "Anyone can view download stats"
  ON download_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No direct public access to logs (Edge Function will handle inserts)
-- Admin/service role can do everything via Edge Function

-- Insert initial stats record
INSERT INTO download_stats (total_downloads)
VALUES (0)
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_download_logs_date ON download_logs(downloaded_at DESC);