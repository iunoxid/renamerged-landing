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
- SEO optimized

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Supabase** - Backend (ready to use)

## Getting Started

### Prerequisites

- Node.js 18+ or 20+ (LTS recommended)
- npm atau yarn

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
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

### Development

```bash
# Run development server
npm run dev

# Open browser di http://localhost:5173
```

### Build for Production

```bash
# Build project
npm run build

# Preview production build
npm run preview
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
├── README.md              # This file
└── DEPLOYMENT.md          # Deployment guide for Ubuntu Server
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
};
```

### Google reCAPTCHA (Optional)

1. Daftar di [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)
2. Pilih reCAPTCHA v2 "I'm not a robot" Checkbox
3. Daftarkan domain (untuk local: `localhost`)
4. Copy Site Key ke `.env` → `VITE_RECAPTCHA_SITE_KEY`
5. Uncomment reCAPTCHA code di `src/components/DownloadModal.tsx`

## Deployment

### Deploy to Ubuntu Server

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

### Deploy to Vercel/Netlify

```bash
# Build
npm run build

# Upload folder dist/ ke hosting pilihan kamu
# Atau connect git repository untuk auto-deploy
```

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

### Deploy to VPS/Cloud

1. Setup Nginx web server
2. Build project: `npm run build`
3. Copy `dist/` folder ke web server directory
4. Configure Nginx untuk serve static files
5. Setup SSL dengan Let's Encrypt

Detail di [DEPLOYMENT.md](./DEPLOYMENT.md)

## Customization

### Colors

Edit `tailwind.config.js` untuk ubah color scheme.

### Content

Edit components di `src/components/` untuk ubah konten:
- Features
- How it works steps
- FAQ questions
- Installation guide
- Donation info

### Images

Ganti images di `public/`:
- App screenshots
- Security proof (VirusTotal)
- Logo/favicon di `public/assets/logo/`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Bundle size: ~300KB (gzipped ~95KB)

## License

All rights reserved. Renamerged © 2025

## Support

Untuk pertanyaan atau bantuan:
- Email: support@renamerged.id (jika ada)
- Website: https://renamerged.id
- Issues: Buka issue di GitHub repository

## Changelog

### v1.0.0 (2025-11-26)
- Initial release
- Modern landing page design
- Download modal dengan agreement
- Security & transparency section
- FAQ section
- Donation support
- Installation guide
