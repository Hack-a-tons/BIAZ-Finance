# BIAZ Finance — TruthScore API

Dockerized Node.js backend powering real-time **truth-scored, impact-explained financial news**  
for the BIAZ Finance mobile client (screenshot below).

![BIAZ Finance mobile client](https://github.com/Hack-a-tons/BIAZ-Finance/blob/main/images/screenshot.jpg?raw=true)

Built at [**De-Vibed Hackathon @ AngelList SF**](https://luma.com/dj3k3tri) — where AI is allowed, but sloppy / vibes-driven code is not.

---

## 1. About the Project & Hackathon Context

**Goal**  
Deliver the world’s first “truth-scored finance news feed” — real headlines go in,  
**scored + explained news with AI impact forecast** comes out.

**Key Capabilities**  
- Ingest **real finance headlines**, not stubs.  
- AI extracts **factual claims** → verifies with **official & market data**.  
- Returns a **truth score**, **impact sentiment** (positive/neutral/negative), **explanation with evidence links**.  
- Works vertically end-to-end for at least one stock (AAPL / TSLA) in the hackathon demo window.

**Hackathon Rule Alignment**  
- Not a toy mock.  
- Clean interfaces.  
- Dev-vibe resistant — built so surprise feature twists can be added mid-event.

---

## 2. API (for the Mobile Client)

**Base URL** — always from `.env`:  
`https://api.news.biaz.hurated.com/v1`

### Core Endpoints

| Area | Method + Path | Purpose |
|------|----------------|---------|
| Articles | `GET /articles` | Paginated, filter by `symbol`, `from`, `source`, etc. |
|          | `GET /articles/:id` | Full article → claims, truth score, forecast |
|          | `POST /articles/ingest` | Fetch + extract + verify + score |
|          | `POST /articles/:id/score` | Recompute truth score manually |
| Sources  | `GET /sources` / `GET /sources/:id` | Registry of source credibility |
|          | `POST /sources` / `DELETE /sources/:id` | Manage custom sources |
| Stocks   | `GET /stocks` | Search / browse tickers referenced by articles |
| Forecast | `GET /forecasts/:id` | Retrieve AI forecast |
|          | `POST /forecasts` | Generate new forecast for article+symbol |

All parameters, ports, database URLs, and AI credentials must be provided **only via `.env`**  
— **no hardcoded values in code or in Compose.**

---

## 3. AI Services

This backend supports **two interchangeable AI engines**, both configured in `.env`:

- **Azure OpenAI**
- **Google Gemini**

> **At least one must be non-null in `.env`.**  
> If both are configured, Azure OpenAI is default, Gemini is fallback or A/B testing candidate.

`.env.example` will include **both** credential blocks with comments, but default to `""`.

---

## 4. Implementation Status

**Current Phase:** Mockup API Complete ✅

The mockup API is deployed and running at `https://api.news.biaz.hurated.com/v1` with all endpoints returning realistic mock data. Client integration has started.

**Next Steps:** See [TODO.md](TODO.md) for detailed implementation plan.

---

## 5. TODO — Build Rules & Execution Plan

### Mandatory Rules

- ✅ Backend runs on **Node.js**, ideally TypeScript.
- ✅ Fully Dockerized with `compose.yml`; start with:  
  `docker compose build && docker compose up -d`
- ✅ `.env` is **not committed** — all values come from it.  
- ✅ `.env.example` *is* committed → shows **ports + Azure + Gemini placeholders**.
- ✅ No hardcoded ports, keys, or hostnames anywhere.
- ✅ Every endpoint must have a test script in `./test/*.sh`:
  - starts with `#!/usr/bin/env bash`
  - supports `-h` / `--help`
  - supports `-v` / `--verbose` (echo curl + pretty print JSON in gray)

### Step-to-Step Plan

1. `cp .env.example .env` → fill real ports + Azure OpenAI AND/OR Gemini credentials  
2. Implement `/articles/ingest` fully first (whole pipeline)  
3. Implement `/articles/:id` + `/articles` listing  
4. Implement `/forecasts` using whichever AI key is set  
5. Add all test scripts with help + verbose flags  
6. Connect client (already built) to `GET /articles` & `GET /articles/:id`  
7. Demo end-to-end on live ticker (AAPL recommended)

---

## 6. Quickstart

```bash
cp .env.example .env   # fill at least one AI provider
docker compose build
docker compose up -d

# Test (verbose)
API_PORT=8080 ./test/articles_list.sh -v
```
