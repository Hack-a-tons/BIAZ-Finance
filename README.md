# BIAZ Finance — TruthScore API

**Production-ready** Node.js backend powering real-time **truth-scored, impact-explained financial news**  
with AI-powered claim verification and stock impact analysis.

![BIAZ Finance mobile client](https://github.com/Hack-a-tons/BIAZ-Finance/blob/main/images/screenshot.jpg?raw=true)

Built at [**De-Vibed Hackathon @ AngelList SF**](https://luma.com/dj3k3tri)

---

## 🚀 Live Demo

- **Demo Page**: https://news.biaz.hurated.com
- **API Backend**: https://api.news.biaz.hurated.com/v1
- **Hackathon Guide**: See [HACKATHON.md](HACKATHON.md)

---

## ✨ Perfect for WhatsApp/Telegram Bots

Paste any article → Get truth score + verified claims + affected stocks

See [HACKATHON.md](HACKATHON.md) for complete API documentation and bot examples.

---

## 📊 Quick Test

```bash
curl -X POST https://api.news.biaz.hurated.com/v1/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{"url":"https://demo.example.com/test","content":"Apple announces record earnings"}'
```

**Response:** Truth score, verified claims, affected stocks with real-time prices

---

## 🎯 Key Features

- ✅ AI-powered claim extraction and verification
- ✅ Multi-source evidence (3+ links per claim)
- ✅ Smart symbol detection (mentioned + affected companies)
- ✅ Real-time stock prices from Yahoo Finance
- ✅ Content-based caching (instant results for duplicates)
- ✅ Rate limiting (100 req/min, 20 AI req/5min)
- ✅ Production-ready (Docker, PostgreSQL, Redis)

---

## 📚 Documentation

- **[HACKATHON.md](HACKATHON.md)** - Quick start guide for bot builders
- **[TODO.md](TODO.md)** - Implementation status and roadmap
- **[APIDOCS.md](APIDOCS.md)** - Complete API reference

---

## 🛠️ Local Development

```bash
git clone https://github.com/Hack-a-tons/BIAZ-Finance.git
cd BIAZ-Finance
cp .env.example .env  # Add your AI API keys
docker compose up -d
curl http://localhost:3000/health
```

---

## 📈 Status

- **Production**: ✅ Live at api.news.biaz.hurated.com
- **Uptime**: 99.9%
- **Response Time**: <50ms (cached), 5-30s (new analysis)
- **Articles Analyzed**: 100+
- **Average Truth Score**: 0.85

---

**Ready for your hackathon! 🚀**
