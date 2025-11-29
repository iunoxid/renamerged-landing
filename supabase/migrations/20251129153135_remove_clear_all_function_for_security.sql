/*
  # Remove Clear All Logs Function for Security

  1. Changes
    - Drop cleanup_all_login_attempts() function
    - Keep only cleanup_old_login_attempts() for safe, controlled cleanup
    
  2. Security Rationale
    - Prevents attackers from deleting all audit logs if they gain access
    - Maintains evidence trail for security investigations
    - Only allows deletion of logs older than retention period
*/

-- Drop the dangerous clear all function
DROP FUNCTION IF EXISTS cleanup_all_login_attempts();

-- Revoke any remaining permissions (just in case)
REVOKE ALL ON FUNCTION cleanup_old_login_attempts() FROM anon;
GRANT EXECUTE ON FUNCTION cleanup_old_login_attempts() TO authenticated;
