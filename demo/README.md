# BIAZ Finance - Article Analysis Demo

Single-page demo for testing the BIAZ Finance API article analysis capabilities.

## Features

- Paste any article text
- Get real-time AI analysis:
  - Truth score (0-1)
  - Stock symbols detected with current prices
  - Extracted claims with verification status
  - Evidence links for each claim
  - Impact forecasts for affected stocks
  - Full API response (JSON)

## Usage

1. Paste article text into the textarea
2. Click "Analyze Article"
3. Wait 30-60 seconds for AI processing
4. View comprehensive analysis results

## Deployment

Runs on port 22000 (configurable via WEB_PORT in .env)

```bash
docker compose build web
docker compose up -d web
```

Access at: https://news.biaz.hurated.com
