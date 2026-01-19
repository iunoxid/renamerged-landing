# Renamerged Landing Page

Website landing page modern untuk aplikasi Renamerged - tools untuk menggabungkan file dan mengatur nama file secara batch.

## Features

- Modern & responsive design
- Dark theme dengan gradient accent
- Smooth animations dengan Framer Motion
- Download modal dengan agreement checkbox
- Security & transparency section dengan VirusTotal integration
- FAQ section
- Donation section dengan QRIS
- Installation guide
- Download counter tracking dengan SQLite
- SEO optimized

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Express** - Backend API server
- **SQLite** - Database untuk tracking downloads

## Getting Started

### Prerequisites

- Node.js 18+ or 20+ (LTS recommended)
- npm atau yarn .

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd renamerged-landing

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dan isi dengan nilai yang sesuai
```

### Environment Variables

Create `.env` file:

```env
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
VITE_API_URL=http://localhost:3001
```

### Development

```bash
# Run backend server (Terminal 1)
npm run dev:server

# Run frontend dev server (Terminal 2)
npm run dev

# Open browser di http://localhost:5173
```

Backend akan jalan di `http://localhost:3001` dan database SQLite akan otomatis dibuat di `server/downloads.db`.

### Build for Production

```bash
# Build frontend
npm run build

# File hasil build ada di folder dist/
```

### Type Checking

```bash
# Check TypeScript types
npm run typecheck
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
renamerged-landing/
├── public/                 # Static assets
│   ├── assets/logo/       # Favicon & app icons
│   ├── image.png          # App screenshots
│   ├── VirusTotal1.png    # Security proof images
│   └── ...
├── server/                # Backend API server
│   ├── index.js          # Express server + SQLite
│   ├── downloads.db      # SQLite database (auto-generated)
│   └── .gitignore        # Ignore database files
├── src/
│   ├── components/        # React components
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── SecuritySection.tsx
│   │   ├── SecurityTransparencySection.tsx
│   │   ├── InstallationGuideSection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── DonationSection.tsx
│   │   ├── DownloadModal.tsx
│   │   └── Footer.tsx
│   ├── config.ts          # App configuration
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Configuration

### App Config

Edit `src/config.ts`:

```typescript
export const APP_CONFIG = {
  downloadUrl: 'https://drive.google.com/your-link-here',
  appVersion: '1.0.0',
  fileSize: '~30MB',
  virusTotalUrl: 'https://www.virustotal.com/gui/file/your-hash',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};
```

### Google reCAPTCHA

1. Daftar di [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)
2. Pilih reCAPTCHA v2 "I'm not a robot" Checkbox
3. Daftarkan domain (untuk local: `localhost`)
4. Copy Site Key ke `.env` → `VITE_RECAPTCHA_SITE_KEY`

## Deployment

### Deploy to VPS/Ubuntu Server (dengan Backend)

#### 1. Persiapan Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 untuk manage backend process
sudo npm install -g pm2
```

#### 2. Upload Project ke Server

```bash
# Di local machine, build frontend
npm run build

# Upload ke server via scp/rsync
rsync -avz --exclude 'node_modules' ./ user@your-server-ip:/var/www/renamerged/

# Atau gunakan git
ssh user@your-server-ip
cd /var/www/
git clone <your-repo-url> renamerged
cd renamerged
npm install
npm run build
```

#### 3. Setup Backend dengan PM2

```bash
# Masuk ke server
ssh user@your-server-ip
cd /var/www/renamerged

# Set production environment
export PORT=3001

# Start backend dengan PM2
pm2 start server/index.js --name renamerged-api

# Auto-restart on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs renamerged-api
```

#### 4. Setup Nginx

```bash
# Buat config Nginx
sudo nano /etc/nginx/sites-available/renamerged
```

Paste konfigurasi ini:

```nginx
server {
    listen 80;
    server_name renamerged.id www.renamerged.id;  # Ganti dengan domain kamu

    # Frontend (Static Files)
    root /var/www/renamerged/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/renamerged /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 5. Setup SSL dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d renamerged.id -d www.renamerged.id

# Auto-renewal test
sudo certbot renew --dry-run
```

#### 6. Update Environment Variables di Server

```bash
# Edit .env di server
cd /var/www/renamerged
nano .env
```

Update dengan nilai production:

```env
VITE_RECAPTCHA_SITE_KEY=your-production-recaptcha-key
VITE_API_URL=https://renamerged.id
```

Rebuild frontend kalau ubah .env:

```bash
npm run build
```

#### 7. Database Backup (Optional)

```bash
# Buat cron job untuk backup database
crontab -e

# Tambahkan ini untuk backup setiap hari jam 2 pagi
0 2 * * * cp /var/www/renamerged/server/downloads.db /var/www/renamerged/server/backups/downloads-$(date +\%Y\%m\%d).db
```

### Deploy to Vercel/Netlify (Frontend Only)

Untuk hosting static tanpa backend:

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Catatan**: Kalau deploy ke Vercel/Netlify, backend harus di-deploy terpisah (misal di Railway, Render, atau VPS).

## API Endpoints

Backend menyediakan 2 endpoints:

### GET `/api/download-count`

Get total download count.

**Response:**
```json
{
  "success": true,
  "count": 1234
}
```

### POST `/api/track-download`

Increment download count.

**Response:**
```json
{
  "success": true,
  "count": 1235
}
```

## Troubleshooting

### Backend tidak bisa diakses

```bash
# Check PM2 status
pm2 status
pm2 logs renamerged-api

# Restart backend
pm2 restart renamerged-api
```

### Database error

```bash
# Check database file
ls -la /var/www/renamerged/server/downloads.db

# Set proper permissions
chmod 644 /var/www/renamerged/server/downloads.db
```

### Nginx error

```bash
# Check error log
sudo tail -f /var/log/nginx/error.log

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle size: ~324KB (gzipped ~101KB)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

All rights reserved. Renamerged © 2026

## Support

Untuk pertanyaan atau bantuan:
- Website: https://renamerged.id
- Issues: Buka issue di GitHub repository

## Changelog

### v2.0.0 (2025-11-27)
- Migrasi dari Supabase ke SQLite lokal
- Backend Express + SQLite untuk tracking downloads
- Database portable dalam 1 file
- Deployment lebih simpel tanpa cloud dependencies

### v1.0.0 (2025-11-26)
- Initial release
- Modern landing page design
- Download modal dengan agreement
- Security & transparency section
- FAQ section
- Donation support
- Installation guide
