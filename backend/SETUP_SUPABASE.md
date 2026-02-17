# Setup Supabase untuk RenamerGED

Panduan lengkap untuk setup Supabase di project kamu sendiri.

## 1. Setup Google reCAPTCHA

1. Buka [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Login dengan Google Account
3. Klik **+** atau **Register a new site**
4. Isi form:
   - **Label**: RenamerGED (atau nama bebas)
   - **reCAPTCHA type**: Pilih **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - **Domains**: Tambahkan domain kamu (contoh: `renamerged.com`) dan `localhost` untuk testing
5. Accept Terms of Service
6. Klik **Submit**
7. Salin **Site Key** (untuk `.env`) dan **Secret Key** (untuk Edge Function)

## 2. Buat Supabase Project

1. Buka [supabase.com](https://supabase.com) dan login/daftar
2. Klik **New Project**
3. Isi detail project:
   - **Name**: RenamerGED (atau nama bebas)
   - **Database Password**: Buat password kuat dan simpan
   - **Region**: Pilih region terdekat (Singapore/Tokyo untuk Indonesia)
4. Klik **Create new project** dan tunggu beberapa menit

## 3. Salin API Keys

1. Di dashboard Supabase, buka **Project Settings** (icon gear di kiri bawah)
2. Pilih **API**
3. Salin keys berikut:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public** key (Key yang panjang dimulai dengan `eyJ...`)

## 4. Update File .env

Buka file `.env` di root project dan update:

```env
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ganti dengan keys yang sudah kamu salin:
- `VITE_RECAPTCHA_SITE_KEY` → Site Key dari Google reCAPTCHA (step 1)
- `VITE_SUPABASE_URL` → Project URL dari Supabase (step 3)
- `VITE_SUPABASE_ANON_KEY` → anon public key dari Supabase (step 3)

## 5. Set Edge Function Secrets

Di Supabase dashboard:

1. Buka **Project Settings** → **Functions**
2. Tambahkan secret berikut:
   - `RECAPTCHA_SECRET_KEY` = Secret Key reCAPTCHA (step 1)
   - `DOWNLOAD_GATE_SECRET` = random string panjang (contoh output openssl rand -base64 32)
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key project Supabase
   - `ALLOW_RECAPTCHA_BYPASS` = `true` (opsional, hanya untuk local/dev testing tanpa captcha)

## 6. Jalankan Database Migration

Di dashboard Supabase:

1. Buka **SQL Editor** (icon database di menu kiri)
2. Klik **New Query**
3. Copy paste SQL berikut:

```sql
-- Create download_stats table
CREATE TABLE IF NOT EXISTS download_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_downloads integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE download_stats ENABLE ROW LEVEL SECURITY;

-- Policy untuk read public
CREATE POLICY "Anyone can view download stats"
  ON download_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create download_logs table
CREATE TABLE IF NOT EXISTS download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  downloaded_at timestamptz DEFAULT now(),
  ip_hash text,
  user_agent text
);

-- Enable RLS
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- Insert initial data
INSERT INTO download_stats (total_downloads)
VALUES (0)
ON CONFLICT DO NOTHING;
```

4. Klik **Run** (atau Ctrl+Enter)

### Tambahan untuk halaman daftar download (wajib untuk fitur Download List)

Jalankan SQL migration berikut agar daftar versi download bisa dikelola dari Admin Dashboard:

- File: `backend/supabase/migrations/20260218_create_download_versions.sql`

Migration ini akan membuat tabel `download_versions` + policy RLS untuk:
- read public hanya untuk entry aktif
- create/update/delete khusus admin

## 7. Deploy Edge Functions

### Cara 1: Via Dashboard (Recommended)

1. Di dashboard Supabase, buka **Edge Functions** (icon function di menu kiri)
2. Klik **Deploy a new function**
3. Deploy fungsi berikut satu per satu:
   - **Function name**: `track-download`
     - **Verify JWT**: OFF (public counter)
     - Code: `backend/supabase/functions/track-download/index.ts`
   - **Function name**: `send-telegram-notification`
     - **Verify JWT**: ON (admin only)
     - Code: `backend/supabase/functions/send-telegram-notification/index.ts`
   - **Function name**: `verify-recaptcha`
     - **Verify JWT**: OFF (public verify)
     - Code: `backend/supabase/functions/verify-recaptcha/index.ts`
   - **Function name**: `download-catalog`
     - **Verify JWT**: OFF (gate token handled internally)
     - Code: `backend/supabase/functions/download-catalog/index.ts`
4. Klik **Deploy function**

### Cara 2: Via Supabase CLI

Jika kamu punya Supabase CLI installed:

```bash
# Login
supabase login

# Link project (ganti project-ref dengan ID project kamu)
supabase link --project-ref xxxxx

# Deploy functions
supabase functions deploy track-download
supabase functions deploy send-telegram-notification
supabase functions deploy verify-recaptcha
supabase functions deploy download-catalog
```

## 8. Test Setup

1. Jalankan project: `npm run dev` (di folder `frontend/`)
2. Buka website di browser
3. Klik tombol **Download**
4. Isi verifikasi dan download
5. Refresh halaman - counter seharusnya naik

## 9. Verifikasi di Database

Di Supabase dashboard:

1. Buka **Table Editor**
2. Pilih table `download_stats`
3. Cek kolom `total_downloads` sudah berisi angka downloads

## Troubleshooting

### Counter tidak naik

1. Cek browser console (F12) untuk error
2. Pastikan edge function sudah deploy
3. Cek di **Edge Functions > Logs** untuk error logs

### Error "Invalid API key"

- Pastikan `VITE_SUPABASE_ANON_KEY` di `.env` sudah benar
- Restart dev server setelah update `.env`

### CORS Error

- Edge function sudah include CORS headers by default
- Pastikan function sudah deploy dengan benar

## Notes

- Database gratis Supabase: 500MB storage, 2GB bandwidth
- Edge Functions gratis: 500K invocations/bulan
- Download counter akan persist walau ganti hosting/VPS
- Backup `.env` file kamu - jangan commit ke git!
