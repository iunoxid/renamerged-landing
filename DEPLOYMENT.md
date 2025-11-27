# Deployment Guide - Renamerged.id

## PM2 + Cloudflare Zero Trust Setup

### Prerequisites
```bash
npm install -g pm2
```

---

## Part 1: PM2 Setup (Port 3001)

### 1. Build the project
```bash
npm install
npm run build
```

### 2. Start with PM2
```bash
pm2 start ecosystem.config.cjs
```

### 3. Useful PM2 Commands
```bash
pm2 status                # Check status
pm2 logs renamerged       # View logs
pm2 restart renamerged    # Restart app
pm2 stop renamerged       # Stop app
pm2 delete renamerged     # Remove from PM2
pm2 monit                 # Real-time monitoring
```

### 4. Auto-start on server reboot
```bash
pm2 startup
pm2 save
```

Application will run on **port 3001** at `http://localhost:3001`

---

## Part 2: Cloudflare Zero Trust Configuration

### 1. Install Cloudflared

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**Alternative (manual):**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

**Windows:**
- Download from [Cloudflare Releases](https://github.com/cloudflare/cloudflared/releases)
- Install `.msi` installer

### 2. Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
Browser will open, select your domain.

### 3. Create Tunnel
```bash
cloudflared tunnel create renamerged-tunnel
```

Output will show:
```
Tunnel credentials written to: ~/.cloudflared/<TUNNEL_ID>.json
```
Copy the `TUNNEL_ID` for next steps.

### 4. Configure Tunnel

Create config file:
```bash
# Linux/Mac
nano ~/.cloudflared/config.yml

# Windows
notepad %USERPROFILE%\.cloudflared\config.yml
```

Add this configuration:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: renamerged.id
    service: http://localhost:3001
  - hostname: www.renamerged.id
    service: http://localhost:3001
  - service: http_status:404
```

Replace:
- `<TUNNEL_ID>` with your actual tunnel ID
- `/root/` with your home directory path if different

### 5. Route DNS to Tunnel

**Option A: Command Line**
```bash
cloudflared tunnel route dns renamerged-tunnel renamerged.id
cloudflared tunnel route dns renamerged-tunnel www.renamerged.id
```

**Option B: Cloudflare Dashboard**
1. Go to **DNS** settings in Cloudflare Dashboard
2. Add CNAME records:
   - **Name:** `@` (for root domain)
   - **Target:** `<TUNNEL_ID>.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud)

   - **Name:** `www`
   - **Target:** `<TUNNEL_ID>.cfargotunnel.com`
   - **Proxy status:** Proxied (orange cloud)

### 6. Run Tunnel

**Test Run:**
```bash
cloudflared tunnel run renamerged-tunnel
```

**Production Setup (Linux systemd service):**

Install as service:
```bash
sudo cloudflared service install
```

Create service file:
```bash
sudo nano /etc/systemd/system/cloudflared.service
```

Add this content:
```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /root/.cloudflared/config.yml run renamerged-tunnel
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

**Production Setup (Windows):**
```bash
cloudflared service install
```

---

## Part 3: Cloudflare SSL/TLS Settings

1. Go to **SSL/TLS** > **Overview** in Cloudflare Dashboard
2. Set encryption mode: **Full** or **Full (strict)**
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

---

## Part 4: Cloudflare Zero Trust Application (Optional - For Access Control)

### 1. Create Application

1. Go to **Cloudflare Zero Trust Dashboard**
2. Navigate to **Access** > **Applications**
3. Click **Add an application** > **Self-hosted**

### 2. Application Configuration

**Application Settings:**
- **Application name:** Renamerged
- **Session Duration:** 24 hours
- **Application domain:** `renamerged.id`

**Application Details:**
- **Subdomain:** `@` (for root domain)
- **Domain:** `renamerged.id`
- **Path:** Leave empty

### 3. Create Access Policy

**For Public Access:**
- **Policy name:** Allow Everyone
- **Action:** Allow
- **Rule type:** Include
- **Selector:** Everyone

**For Restricted Access (Optional):**
- **Action:** Allow
- **Rule type:** Include
- **Selector:** Emails ending in `@yourdomain.com`

---

## Verification

### Check PM2 Status
```bash
pm2 status
pm2 logs renamerged
```

### Check Tunnel Status
```bash
cloudflared tunnel info renamerged-tunnel
sudo systemctl status cloudflared
```

### Check if Port is Listening
```bash
netstat -tulpn | grep 3001
# or
lsof -i :3001
```

### Test Website
Visit: `https://renamerged.id`

---

## Troubleshooting

### PM2 Issues

**App not starting:**
```bash
pm2 delete renamerged
pm2 start ecosystem.config.cjs
pm2 logs renamerged --lines 100
```

**High memory usage:**
```bash
pm2 restart renamerged
```

### Tunnel Issues

**Connection problems:**
```bash
# Check tunnel info
cloudflared tunnel info renamerged-tunnel

# Check tunnel logs
sudo journalctl -u cloudflared -f

# Restart tunnel
sudo systemctl restart cloudflared
```

**DNS not resolving:**
- Check CNAME records in Cloudflare DNS
- Verify tunnel ID in DNS target
- Wait 5-10 minutes for DNS propagation

### 502 Bad Gateway

This means tunnel is working but PM2 app is not responding:

1. **Check PM2 status:**
```bash
pm2 status
pm2 logs renamerged
```

2. **Check if app is listening:**
```bash
netstat -tulpn | grep 3001
```

3. **Restart both services:**
```bash
pm2 restart renamerged
sudo systemctl restart cloudflared
```

4. **Verify tunnel config:**
- Ensure tunnel config points to `localhost:3001`
- Ensure PM2 app is running on port 3001

### 503 Service Unavailable

Tunnel is not running:
```bash
sudo systemctl start cloudflared
cloudflared tunnel info renamerged-tunnel
```

---

## Monitoring & Logs

### PM2 Monitoring
```bash
pm2 monit                          # Real-time dashboard
pm2 logs renamerged                # Live logs
pm2 logs renamerged --lines 100    # Last 100 lines
pm2 logs renamerged --err          # Error logs only
```

### Tunnel Logs
```bash
# Systemd logs
sudo journalctl -u cloudflared -f

# Last 50 lines
sudo journalctl -u cloudflared -n 50
```

### Cloudflare Analytics
- Go to **Analytics & Logs** in Cloudflare Dashboard
- Monitor traffic, threats, and performance
- Check **Zero Trust** > **Analytics** for tunnel metrics

---

## Security Best Practices

1. **Never expose port 3001 to internet**
   - Only accessible via localhost
   - All traffic goes through Cloudflare Tunnel

2. **Firewall Configuration (Linux):**
```bash
# Allow SSH only
sudo ufw allow ssh

# Deny all incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable firewall
sudo ufw enable
sudo ufw status
```

3. **Keep files secure:**
   - Never commit `.env` to git
   - Protect `~/.cloudflared/` directory
   - Regular backups of tunnel credentials

4. **Regular updates:**
```bash
# Update PM2
npm update -g pm2

# Update cloudflared
sudo cloudflared update

# Update dependencies
npm audit fix
```

5. **Monitor logs:**
   - Check PM2 logs daily
   - Review Cloudflare Analytics
   - Set up alerts for errors

---

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart renamerged

# Check status
pm2 status
pm2 logs renamerged
```

### Restart Services

```bash
# Restart PM2 app
pm2 restart renamerged

# Restart tunnel
sudo systemctl restart cloudflared

# Restart both
pm2 restart renamerged && sudo systemctl restart cloudflared
```

### Stop Services

```bash
# Stop PM2 app
pm2 stop renamerged

# Stop tunnel
sudo systemctl stop cloudflared
```

---

## Cost

- **Cloudflare Tunnel:** Free
- **Cloudflare Zero Trust:** Free tier (up to 50 users)
- **Cloudflare SSL:** Free
- **PM2:** Free
- **Server:** Your existing server/VPS cost

**Total additional cost: $0**

---

## Architecture Summary

```
Internet
   ↓
Cloudflare Network (SSL/DDoS Protection)
   ↓
Cloudflare Tunnel (encrypted connection)
   ↓
Your Server (localhost:3001)
   ↓
PM2 Process (Vite Preview)
   ↓
Built React App
```

**Benefits:**
- No need to expose ports to internet
- Free SSL certificates
- DDoS protection included
- CDN caching
- Zero Trust security
- Easy to manage

---

## Quick Reference

```bash
# PM2 Commands
pm2 start ecosystem.config.cjs    # Start app
pm2 restart renamerged            # Restart
pm2 stop renamerged               # Stop
pm2 logs renamerged               # View logs
pm2 monit                         # Monitor

# Cloudflare Tunnel Commands
cloudflared tunnel run renamerged-tunnel     # Run manually
sudo systemctl start cloudflared             # Start service
sudo systemctl restart cloudflared           # Restart service
sudo systemctl status cloudflared            # Check status
cloudflared tunnel info renamerged-tunnel    # Tunnel info

# Debugging
pm2 logs renamerged --lines 100              # App logs
sudo journalctl -u cloudflared -f            # Tunnel logs
netstat -tulpn | grep 3001                   # Check port
```
