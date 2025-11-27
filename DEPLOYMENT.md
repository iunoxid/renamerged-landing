# Deployment Guide - Cloudflare Zero Trust

Panduan lengkap untuk deploy website Renamerged menggunakan Cloudflare Pages (frontend) dan Cloudflare Tunnel (backend).

## Architecture Overview

- **Frontend**: Cloudflare Pages (Static React App)
- **Backend**: Express Server + SQLite (via Cloudflare Tunnel)
- **Download Counter**: Local database dengan backend lokal

## Prerequisites

- Akun Cloudflare
- Domain yang sudah terhubung ke Cloudflare
- Server lokal untuk backend (bisa PC/laptop yang always on, VPS, atau Raspberry Pi)
- Node.js 20.x atau lebih baru di server backend

---

## Part 1: Deploy Frontend ke Cloudflare Pages

### 1. Build Production

```bash
# Di local machine, build project
npm install
npm run build
```

File production akan ada di folder `dist/`.

### 2. Deploy ke Cloudflare Pages

**Option A: Via Cloudflare Dashboard (Manual)**

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **Pages** di sidebar
3. Klik **Create a project**
4. Pilih **Upload assets**
5. Upload folder `dist/` atau drag & drop
6. Beri nama project (contoh: `renamerged`)
7. Klik **Deploy**

**Option B: Via Git (Recommended)**

1. Push project ke GitHub/GitLab
2. Di Cloudflare Dashboard, pilih **Pages** → **Create a project**
3. Pilih **Connect to Git**
4. Pilih repository kamu
5. Setup build configuration:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Node version**: `20`
6. Tambahkan environment variables:
   - `VITE_RECAPTCHA_SITE_KEY`: (your reCAPTCHA site key)
   - `VITE_API_URL`: `https://api.yourdomain.com` (akan disetup di Part 2)
7. Klik **Save and Deploy**

### 3. Setup Custom Domain (Optional)

1. Di project Pages kamu, pilih **Custom domains**
2. Klik **Set up a custom domain**
3. Masukkan domain/subdomain (contoh: `renamerged.id` atau `www.renamerged.id`)
4. Cloudflare akan auto-setup DNS records
5. SSL otomatis aktif

---

## Part 2: Deploy Backend dengan Cloudflare Tunnel

### 1. Setup Server Backend

**Di server lokal/VPS:**

```bash
# Clone atau upload project
cd /path/to/project

# Install dependencies
npm install

# Test backend server
npm run dev:server
# Backend akan jalan di http://localhost:3001
```

### 2. Install Cloudflared

**Linux/Mac:**
```bash
# Download cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared

# Make it executable
chmod +x cloudflared

# Move to system path
sudo mv cloudflared /usr/local/bin/
```

**Windows:**
- Download dari [Cloudflare Releases](https://github.com/cloudflare/cloudflared/releases)
- Install `.msi` installer

### 3. Login ke Cloudflare

```bash
cloudflared tunnel login
```

Browser akan terbuka, pilih domain yang ingin digunakan.

### 4. Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create renamerged-backend

# Output akan seperti ini:
# Tunnel credentials written to: ~/.cloudflared/<TUNNEL-ID>.json
# Copy TUNNEL-ID untuk step selanjutnya
```

### 5. Setup Tunnel Configuration

Buat file config:

```bash
# Linux/Mac
nano ~/.cloudflared/config.yml

# Windows
notepad %USERPROFILE%\.cloudflared\config.yml
```

Isi dengan:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/user/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
```

Ganti:
- `<TUNNEL-ID>` dengan ID tunnel kamu
- `/home/user/` dengan path home directory kamu
- `api.yourdomain.com` dengan subdomain yang kamu inginkan

### 6. Setup DNS Record

```bash
cloudflared tunnel route dns renamerged-backend api.yourdomain.com
```

Atau manual via Cloudflare Dashboard:
1. Buka **DNS** settings di Cloudflare
2. Tambah CNAME record:
   - **Name**: `api` (atau subdomain yang kamu mau)
   - **Target**: `<TUNNEL-ID>.cfargotunnel.com`
   - **Proxy status**: Proxied (orange cloud)

### 7. Run Tunnel

**Test Run:**
```bash
cloudflared tunnel run renamerged-backend
```

**Production Setup (Linux - systemd service):**

```bash
# Install as service
sudo cloudflared service install

# Create service file
sudo nano /etc/systemd/system/cloudflared.service
```

Isi:
```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=your-username
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/your-username/.cloudflared/config.yml run renamerged-backend
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable dan start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Check status
sudo systemctl status cloudflared
```

**Production Setup (Windows):**

```bash
# Install as Windows service
cloudflared service install
```

### 8. Setup Backend Auto-Start

Buat PM2 atau systemd service untuk backend Express.

**Option A: Using PM2 (Recommended)**

```bash
# Install PM2
npm install -g pm2

# Start backend
cd /path/to/project
pm2 start npm --name "renamerged-backend" -- run dev:server

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Follow instruksi yang muncul

# Check status
pm2 status
pm2 logs renamerged-backend
```

**Option B: Using systemd (Linux)**

```bash
sudo nano /etc/systemd/system/renamerged-backend.service
```

Isi:
```ini
[Unit]
Description=Renamerged Backend
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/node /path/to/project/server/index.js
Restart=on-failure
RestartSec=5s
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable renamerged-backend
sudo systemctl start renamerged-backend
sudo systemctl status renamerged-backend
```

---

## Part 3: Update Frontend Environment

Update environment variables di Cloudflare Pages:

1. Buka project di Cloudflare Pages Dashboard
2. Pilih **Settings** → **Environment variables**
3. Update `VITE_API_URL`:
   - **Production**: `https://api.yourdomain.com`
4. Klik **Save**
5. Redeploy project

---

## Part 4: Testing

### Test Backend API

```bash
# Test GET endpoint
curl https://api.yourdomain.com/api/download-count

# Expected response:
# {"success":true,"count":0}

# Test POST endpoint
curl -X POST https://api.yourdomain.com/api/track-download

# Expected response:
# {"success":true,"count":1}
```

### Test Frontend

1. Buka `https://yourdomain.com` atau URL Cloudflare Pages kamu
2. Cek download counter di hero section
3. Klik tombol download dan pastikan modal muncul
4. Complete verification dan download
5. Refresh page, counter harus bertambah

---

## Maintenance & Updates

### Update Frontend

```bash
# Build new version
npm run build

# Option A: Via Git (auto-deploy)
git add .
git commit -m "Update frontend"
git push

# Option B: Manual upload
# Upload folder dist/ ke Cloudflare Pages Dashboard
```

### Update Backend

```bash
# Pull atau upload code baru
cd /path/to/project

# Restart dengan PM2
pm2 restart renamerged-backend

# Atau restart service
sudo systemctl restart renamerged-backend
```

### Check Logs

```bash
# Cloudflare Tunnel logs
sudo journalctl -u cloudflared -f

# Backend logs (PM2)
pm2 logs renamerged-backend

# Backend logs (systemd)
sudo journalctl -u renamerged-backend -f
```

### Backup Database

```bash
# Backup SQLite database
cp /path/to/project/server/downloads.db /path/to/backup/downloads-$(date +%Y%m%d).db

# Automated backup (crontab)
crontab -e

# Add this line untuk backup harian jam 2 pagi:
0 2 * * * cp /path/to/project/server/downloads.db /path/to/backup/downloads-$(date +\%Y\%m\%d).db
```

---

## Troubleshooting

### Tunnel tidak connect

```bash
# Check tunnel status
cloudflared tunnel info renamerged-backend

# Check logs
sudo journalctl -u cloudflared -n 50

# Restart tunnel
sudo systemctl restart cloudflared
```

### Backend tidak bisa diakses

```bash
# Check backend status
pm2 status
# atau
sudo systemctl status renamerged-backend

# Check if port 3001 is listening
netstat -tuln | grep 3001

# Restart backend
pm2 restart renamerged-backend
# atau
sudo systemctl restart renamerged-backend
```

### CORS errors

Pastikan backend sudah enable CORS untuk domain frontend kamu. Cek di `server/index.js`:

```javascript
app.use(cors());
```

### Download counter tidak update

1. Check backend logs
2. Test API endpoint langsung dengan curl
3. Check browser console untuk error
4. Verify `VITE_API_URL` di Cloudflare Pages environment variables

---

## Security Best Practices

- ✅ HTTPS otomatis via Cloudflare
- ✅ Backend tidak expose langsung ke internet (via tunnel)
- ✅ Firewall di server backend (hanya allow localhost:3001)
- ✅ Regular updates system & dependencies
- ✅ Database backup regular
- ✅ Monitor logs untuk suspicious activity

### Setup Firewall (Linux Backend)

```bash
# Allow SSH
sudo ufw allow ssh

# Deny all incoming except localhost
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Cost Estimate

- **Cloudflare Pages**: Free (100k requests/month)
- **Cloudflare Tunnel**: Free
- **Domain**: ~$10-15/year
- **Backend Server**:
  - PC/Laptop lokal: Free (electricity cost)
  - VPS murah: ~$3-5/month (Contabo, Hetzner, dll)
  - Raspberry Pi: ~$50 one-time

**Total**: Bisa gratis atau minimal $3-5/month

---

## Alternative: Backend di VPS Tanpa Tunnel

Jika backend ada di VPS dengan IP public, bisa skip Cloudflare Tunnel:

1. Install Nginx di VPS sebagai reverse proxy
2. Setup SSL dengan Certbot
3. Point subdomain `api.yourdomain.com` ke IP VPS
4. Update `VITE_API_URL` ke `https://api.yourdomain.com`

Config Nginx:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```

Kemudian setup SSL:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## Notes

- Database SQLite ada di `server/downloads.db`
- Frontend fully static, deploy ke CDN global Cloudflare
- Backend bisa jalan di komputer rumah dengan internet biasa
- Cloudflare Tunnel handle SSL & DDoS protection otomatis
- Zero downtime deployment untuk frontend (via Git auto-deploy)
