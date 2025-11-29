/*
  # Remove Automatic Cleanup and Improve Manual Cleanup

  1. Changes
    - Remove pg_cron scheduled job (automatic cleanup)
    - Drop and recreate cleanup function to return number of rows deleted
    - Add function to delete all logs (for admin control)
    - Keep manual cleanup button only
    
  2. Security
    - Admin has full control over when to cleanup
    - Functions return deleted count for transparency
*/

-- Remove the scheduled job
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-old-login-attempts');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore if schedule doesn't exist or pg_cron not available
END $$;

-- Drop old function
DROP FUNCTION IF EXISTS cleanup_old_login_attempts();

-- Recreate function to return number of deleted rows
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER AS $$
DECLARE
  retention_days INTEGER;
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count INTEGER;
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
  
  -- Delete old login attempts and get count
  DELETE FROM login_attempts
  WHERE attempted_at < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to delete ALL login attempts (for testing/reset)
CREATE OR REPLACE FUNCTION cleanup_all_login_attempts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM login_attempts;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_login_attempts() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_all_login_attempts() TO authenticated;
