/*
  # Create Automatic Log Cleanup Function

  1. Changes
    - Create function to delete old login attempts based on retention policy
    - Create scheduled job using pg_cron to run daily at 2 AM UTC
    - Respects log_retention_days setting in security_config
    
  2. Security
    - Function runs with SECURITY DEFINER privilege
    - Only deletes logs older than configured retention period
    - Keeps system clean and performant
*/

-- Create function to clean up old login attempts
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
DECLARE
  retention_days INTEGER;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get retention days from config
  SELECT log_retention_days INTO retention_days
  FROM security_config
  LIMIT 1;
  
  -- Default to 90 days if not configured
  IF retention_days IS NULL THEN
    retention_days := 90;
  END IF;
  
  -- Calculate cutoff date
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
  
  -- Delete old login attempts
  DELETE FROM login_attempts
  WHERE attempted_at < cutoff_date;
  
  -- Log the cleanup
  RAISE NOTICE 'Cleaned up login attempts older than % days (before %)', retention_days, cutoff_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (for manual trigger if needed)
GRANT EXECUTE ON FUNCTION cleanup_old_login_attempts() TO authenticated;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup to run daily at 2 AM UTC
-- Note: This requires pg_cron extension which may need to be enabled in Supabase dashboard
DO $$
BEGIN
  -- Remove existing schedule if exists
  PERFORM cron.unschedule('cleanup-old-login-attempts');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore if schedule doesn't exist
END $$;

-- Create new schedule
SELECT cron.schedule(
  'cleanup-old-login-attempts',
  '0 2 * * *',  -- Run at 2 AM UTC daily
  'SELECT cleanup_old_login_attempts();'
);
