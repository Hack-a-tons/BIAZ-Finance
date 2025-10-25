# BIAZ Finance Web Client - Deployment Guide

## Production Deployment

The web client is deployed at **https://news.biaz.hurated.com** (port 22000 internally).

### Architecture

```
┌─────────────────────────────────────────┐
│  news.biaz.hurated.com (nginx)          │
│  ↓ reverse proxy                        │
│  localhost:22000 (web client)           │
│  ↓ API calls                            │
│  api.news.biaz.hurated.com (nginx)      │
│  ↓ reverse proxy                        │
│  localhost:23000 (API backend)          │
└─────────────────────────────────────────┘
```

### Services

**Docker Compose Services:**
- `web` - React Native web client (port 22000)
- `api` - Node.js API backend (port 23000)
- `postgres` - PostgreSQL database
- `redis` - Redis cache

### Deployment Steps

1. **Update code:**
   ```bash
   cd /path/to/BIAZ-Finance
   git pull
   ```

2. **Deploy:**
   ```bash
   ./scripts/deploy.sh -m "Update web client" biaz.hurated.com
   ```

3. **Verify:**
   ```bash
   curl -I https://news.biaz.hurated.com
   ```

### Environment Variables

Required in `.env`:
```bash
WEB_PORT=22000
WEB_URL=https://news.biaz.hurated.com
API_URL=https://api.news.biaz.hurated.com/v1
```

### Nginx Configuration

The web client should be served via nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name news.biaz.hurated.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name news.biaz.hurated.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:22000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring

**Check service status:**
```bash
ssh biaz.hurated.com "docker ps --filter name=biaz-finance-web"
```

**View logs:**
```bash
ssh biaz.hurated.com "docker logs biaz-finance-web-1 -f"
```

**Restart service:**
```bash
ssh biaz.hurated.com "cd BIAZ-Finance && docker compose restart web"
```

### Troubleshooting

**Web client not loading:**
1. Check if container is running: `docker ps`
2. Check logs: `docker logs biaz-finance-web-1`
3. Verify port is exposed: `netstat -tlnp | grep 22000`
4. Check nginx config and restart: `nginx -t && systemctl restart nginx`

**API connection issues:**
1. Verify API_URL in .env
2. Test API directly: `curl https://api.news.biaz.hurated.com/v1/articles`
3. Check CORS settings in API

**Build failures:**
1. Check Dockerfile syntax
2. Verify bun.lock exists
3. Clear Docker cache: `docker system prune -a`
