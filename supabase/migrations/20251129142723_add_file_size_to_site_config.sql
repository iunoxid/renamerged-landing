/*
  # Add file_size field to site_config

  1. Updates
    - Add `file_size` column to `site_config` table
    - Default value of '~33MB' for existing records
    
  2. Purpose
    - Allow admin to configure the file size displayed on the landing page
    - Make it easy to update when new versions are released
*/

-- Add file_size column to site_config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_config' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE site_config ADD COLUMN file_size text DEFAULT '~33MB' NOT NULL;
  END IF;
END $$;