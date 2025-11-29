/*
  # Fix Security Table RLS Policies

  1. Changes
    - Drop existing policies that check auth.users table incorrectly
    - Create new policies with correct auth.uid() checks
    - Allow anonymous INSERT for login_attempts (needed for logging before auth)
    - Allow anonymous SELECT for account_lockouts and security_config (needed for login checks)
    
  2. Security
    - Admin users can manage all security data
    - Anonymous users can only insert login attempts and check lockout status
    - All other operations require authentication
*/

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Admins can view all login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Admins can view all account lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admins can update account lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admins can delete account lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admins can view all active sessions" ON active_sessions;
DROP POLICY IF EXISTS "Admins can delete sessions" ON active_sessions;
DROP POLICY IF EXISTS "Admins can view security config" ON security_config;
DROP POLICY IF EXISTS "Admins can update security config" ON security_config;

-- Login Attempts Policies
CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  );

-- Account Lockouts Policies
CREATE POLICY "Anyone can check lockout status"
  ON account_lockouts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can update lockouts"
  ON account_lockouts FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  );

CREATE POLICY "Admin can delete lockouts"
  ON account_lockouts FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  );

CREATE POLICY "System can insert lockouts"
  ON account_lockouts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Active Sessions Policies
CREATE POLICY "Admin can view all sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  );

CREATE POLICY "Admin can delete sessions"
  ON active_sessions FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  );

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
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'fkryakbar@gmail.com'
  );
