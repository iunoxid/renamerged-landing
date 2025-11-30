/*
  # Add Log Retention Settings to Security Config

  1. Changes
    - Add log_retention_days column to security_config table
    - Default to 90 days (industry standard for security logs)
    - Update existing config row with default value
    
  2. Security
    - Admin can configure retention period
    - Old logs will be auto-deleted based on this setting
*/

-- Add log retention column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'security_config' AND column_name = 'log_retention_days'
  ) THEN
    ALTER TABLE security_config 
    ADD COLUMN log_retention_days INTEGER DEFAULT 90 NOT NULL;
  END IF;
END $$;

-- Update existing config with default value
UPDATE security_config 
SET log_retention_days = 90 
WHERE log_retention_days IS NULL OR log_retention_days = 0;
