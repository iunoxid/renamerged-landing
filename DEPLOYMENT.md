# Deployment Guide - Renamerged

Panduan ini fokus pada production sederhana: **Frontend static build** + **Backend Supabase**.

---

## Frontend (Static Build)

### 1. Build
```bash
cd frontend
npm install
npm run build
```

Hasil build ada di `frontend/dist/`.

### 2. Deploy
Upload folder `frontend/dist/` ke salah satu hosting static:
- Vercel
- Netlify
- Cloudflare Pages
- Nginx/VPS (serve static)

Pastikan environment build untuk FE sudah berisi:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_RECAPTCHA_SITE_KEY=...
```

---

## Backend (Supabase)

Backend **tidak perlu dijalankan manual**.
Yang perlu dilakukan hanya:
1. Jalankan migrations di Supabase
2. Deploy Edge Functions
3. Set secrets (contoh `RECAPTCHA_SECRET_KEY`)

Panduan lengkap ada di `backend/SETUP_SUPABASE.md`.

---

## Catatan

- Tidak ada server Express lokal untuk production.
- Semua API, Auth, dan database berjalan di Supabase.
- Frontend hanya perlu akses URL + anon key Supabase.
