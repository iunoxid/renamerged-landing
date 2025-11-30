/*
  # Fix Admin Email in RLS Policies

  1. Changes
    - Update all RLS policies to use correct admin email: admin@renamerged.id
    - Previously used fkryakbar@gmail.com which doesn't exist in database
    
  2. Security
    - Admin user with email admin@renamerged.id can access all security features
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view all login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Admin can update lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admin can delete lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "Admin can view all sessions" ON active_sessions;
DROP POLICY IF EXISTS "Admin can delete sessions" ON active_sessions;
DROP POLICY IF EXISTS "Admin can update security config" ON security_config;

-- Recreate with correct admin email
CREATE POLICY "Admin can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  );

CREATE POLICY "Admin can update lockouts"
  ON account_lockouts FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  );

CREATE POLICY "Admin can delete lockouts"
  ON account_lockouts FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  );

CREATE POLICY "Admin can view all sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  );

CREATE POLICY "Admin can delete sessions"
  ON active_sessions FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  );

CREATE POLICY "Admin can update security config"
  ON security_config FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'admin@renamerged.id'
  );
