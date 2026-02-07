# Renamerged Landing Page

Landing page modern untuk aplikasi Renamerged.

## Tech Stack
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (Auth, DB, Edge Functions)
- Google reCAPTCHA v2

## Struktur Proyek
```
renamerged-landing/
+-- frontend/               # FE (Vite + React)
¦   +-- public/
¦   +-- src/
¦   +-- package.json
¦   +-- .env.example
+-- backend/                # BE (Supabase)
¦   +-- supabase/
¦   +-- SETUP_SUPABASE.md
¦   +-- SECURITY_FEATURES.md
+-- DEPLOYMENT.md
```

## Development

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend (Supabase)
Ikuti `backend/SETUP_SUPABASE.md` untuk:
- membuat project Supabase
- menjalankan migration
- deploy Edge Functions
- set secrets (reCAPTCHA)

## Environment Variables (frontend)
```env
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Production
Lihat `DEPLOYMENT.md` (FE static build + Supabase).

## License
All rights reserved. Renamerged © 2026
