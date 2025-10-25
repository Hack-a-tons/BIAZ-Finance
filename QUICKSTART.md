# BIAZ Finance - Quick Start Guide

## What's Been Created

✅ **Mockup API** - Full Express.js API with all endpoints returning mock data  
✅ **Mock Data** - Realistic sample data in `mock-data.json` with picsum.photos images  
✅ **API Documentation** - Complete client docs in `APIDOCS.md`  
✅ **Environment Config** - `.env` with real credentials, `.env.example` for reference  
✅ **Docker Setup** - `Dockerfile` and `compose.yml` ready to deploy  
✅ **Deployment Script** - `deploy.sh` with commit & push option  
✅ **Test Scripts** - 4 bash scripts in `tests/` with help and verbose modes  

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally (without Docker)
```bash
npm run dev
```

API will be available at `http://localhost:23000`

### 3. Run with Docker
```bash
docker compose build
docker compose up -d
```

---

## Testing the API

All test scripts support `-h` for help and `-v` for verbose output.

### Articles
```bash
# List all articles
./tests/articles.sh get

# Filter by symbol
./tests/articles.sh get AAPL

# Get specific article
./tests/articles.sh show art_001

# Ingest new article
./tests/articles.sh ingest https://example.com/article AAPL

# Recompute truth score
./tests/articles.sh score art_001

# Verbose mode (shows curl commands)
./tests/articles.sh -v get
```

### Sources
```bash
./tests/sources.sh get
./tests/sources.sh show src_001
./tests/sources.sh create "My Source" example.com 0.8
./tests/sources.sh delete src_123
```

### Stocks
```bash
./tests/stocks.sh get
./tests/stocks.sh get AAPL
./tests/stocks.sh get Apple
```

### Forecasts
```bash
./tests/forecasts.sh show fct_001
./tests/forecasts.sh create art_001 AAPL
```

---

## Deployment

### Deploy to Server
```bash
# Simple deploy
./deploy.sh biaz.hurated.com

# Commit, push, then deploy
./deploy.sh -m "Update API endpoints" biaz.hurated.com
```

The script will:
1. Check `.env` exists
2. (Optional) Commit and push changes
3. Copy `.env` to server
4. SSH to server, pull latest code, rebuild and restart containers

---

## API Endpoints

**Base URL:** `https://api.news.biaz.hurated.com/v1`

- `GET /articles` - List articles (filter by symbol, from, source, page, limit)
- `GET /articles/:id` - Get article with claims and truth score
- `POST /articles/ingest` - Ingest new article from URL
- `POST /articles/:id/score` - Recompute truth score
- `GET /sources` - List news sources
- `GET /sources/:id` - Get source details
- `POST /sources` - Add custom source
- `DELETE /sources/:id` - Delete source
- `GET /stocks` - Search stocks
- `GET /forecasts/:id` - Get forecast
- `POST /forecasts` - Generate new forecast

See `APIDOCS.md` for full documentation.

---

## Mock Data

3 sample articles:
- **art_001** - Apple Q4 revenue (AAPL, truthScore: 0.92, positive)
- **art_002** - Tesla Cybertruck production (TSLA, truthScore: 0.78, positive)
- **art_003** - Apple EU antitrust (AAPL, truthScore: 0.85, negative)

3 sources: Financial Times, TechCrunch, Reuters  
2 stocks: AAPL ($178.45, +2.34%), TSLA ($242.18, -1.12%)  
3 forecasts with AI reasoning

All images use `https://picsum.photos/seed/{name}/800/600`

---

## Next Steps

1. **Test locally** - Run `npm run dev` and test with scripts
2. **Deploy** - Use `./deploy.sh biaz.hurated.com`
3. **Integrate client** - Point mobile app to `https://api.news.biaz.hurated.com/v1`
4. **Replace mocks** - Implement real AI claim extraction and verification

---

## File Structure

```
BIAZ-Finance/
├── src/
│   └── index.ts          # Express API server
├── tests/
│   ├── articles.sh       # Test articles endpoints
│   ├── sources.sh        # Test sources endpoints
│   ├── stocks.sh         # Test stocks endpoints
│   └── forecasts.sh      # Test forecasts endpoints
├── mock-data.json        # All mock data
├── package.json          # Node dependencies
├── tsconfig.json         # TypeScript config
├── Dockerfile            # Container image
├── compose.yml           # Docker Compose setup
├── deploy.sh             # Deployment script
├── .env                  # Real credentials (not committed)
├── .env.example          # Template
├── APIDOCS.md            # API documentation
├── QUICKSTART.md         # This file
└── README.md             # Project overview
```
