/*
  # Security Enhancement Tables

  1. New Tables
    - `login_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for tracking unknown users)
      - `email` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `success` (boolean)
      - `failure_reason` (text, nullable)
      - `attempted_at` (timestamptz)
      
    - `account_lockouts`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `locked_at` (timestamptz)
      - `unlock_at` (timestamptz)
      - `failed_attempts` (integer)
      - `is_locked` (boolean)
      - `locked_by` (text - 'system' or 'manual')
      
    - `active_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `session_token` (text, unique)
      - `ip_address` (text)
      - `user_agent` (text)
      - `last_activity` (timestamptz)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      
    - `security_config`
      - `id` (uuid, primary key)
      - `telegram_bot_token` (text, nullable)
      - `telegram_chat_id` (text, nullable)
      - `max_failed_attempts` (integer, default 5)
      - `lockout_duration_minutes` (integer, default 60)
      - `session_timeout_minutes` (integer, default 30)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Only authenticated admin users can access these tables
    
  3. Indexes
    - Index on login_attempts.email for fast lookup
    - Index on login_attempts.attempted_at for time-based queries
    - Index on active_sessions.user_id for session management
*/

-- Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean NOT NULL DEFAULT false,
  failure_reason text,
  attempted_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

-- Account Lockouts Table
CREATE TABLE IF NOT EXISTS account_lockouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  locked_at timestamptz DEFAULT now(),
  unlock_at timestamptz NOT NULL,
  failed_attempts integer DEFAULT 0,
  is_locked boolean DEFAULT true,
  locked_by text DEFAULT 'system'
);

ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all account lockouts"
  ON account_lockouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

CREATE POLICY "Admins can update account lockouts"
  ON account_lockouts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

CREATE POLICY "Admins can delete account lockouts"
  ON account_lockouts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

-- Active Sessions Table
CREATE TABLE IF NOT EXISTS active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON active_sessions(expires_at);

ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all active sessions"
  ON active_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

CREATE POLICY "Admins can delete sessions"
  ON active_sessions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

-- Security Config Table
CREATE TABLE IF NOT EXISTS security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_bot_token text,
  telegram_chat_id text,
  max_failed_attempts integer DEFAULT 5,
  lockout_duration_minutes integer DEFAULT 60,
  session_timeout_minutes integer DEFAULT 30,
  updated_at timestamptz DEFAULT now()
);

-- Insert default config
INSERT INTO security_config (max_failed_attempts, lockout_duration_minutes, session_timeout_minutes)
VALUES (5, 60, 30)
ON CONFLICT DO NOTHING;

ALTER TABLE security_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security config"
  ON security_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );

CREATE POLICY "Admins can update security config"
  ON security_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'fkryakbar@gmail.com'
    )
  );
