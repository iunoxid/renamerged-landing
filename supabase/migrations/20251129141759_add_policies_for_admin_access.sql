/*
  # Admin Access Policies

  1. Updates
    - Add policies for authenticated admin users to access download_logs
    - These policies allow admins to view analytics and download history
    
  2. Security
    - Only authenticated users (admins) can SELECT from download_logs
    - Public users have no access to download_logs
    - This enables the admin dashboard to display analytics
*/

-- Check if policy exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'download_logs' 
    AND policyname = 'Authenticated users can view download logs'
  ) THEN
    CREATE POLICY "Authenticated users can view download logs"
      ON download_logs
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;