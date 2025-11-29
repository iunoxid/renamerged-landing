/*
  # Create is_admin() function and fix RLS policies

  1. Changes
    - Create is_admin() function to check if current user is admin
    - Replace all RLS policies to use this function instead of subquery
    - This fixes "permission denied for table users" error
    
  2. Security
    - Function is SECURITY DEFINER so it can read auth.users
    - Only checks current user's email
    - Returns boolean for use in RLS policies
*/

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  ) = 'admin@renamerged.id';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Admin can view all login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Anyone can check lockout status" ON account_lockouts;
DROP POLICY IF EXISTS "Admin can update lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admin can delete lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "System can insert lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admin can view all sessions" ON active_sessions;
DROP POLICY IF EXISTS "Admin can delete sessions" ON active_sessions;
DROP POLICY IF EXISTS "System can insert sessions" ON active_sessions;
DROP POLICY IF EXISTS "Anyone can read security config" ON security_config;
DROP POLICY IF EXISTS "Admin can update security config" ON security_config;

-- Login Attempts Policies
CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (is_admin());

-- Account Lockouts Policies
CREATE POLICY "Anyone can check lockout status"
  ON account_lockouts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can update lockouts"
  ON account_lockouts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete lockouts"
  ON account_lockouts FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert lockouts"
  ON account_lockouts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Active Sessions Policies
CREATE POLICY "Admin can view all sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin can delete sessions"
  ON active_sessions FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert sessions"
  ON active_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Security Config Policies
CREATE POLICY "Anyone can read security config"
  ON security_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can update security config"
  ON security_config FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
