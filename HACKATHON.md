# BIAZ Finance API - Hackathon Quick Start

**Live API:** `https://api.news.biaz.hurated.com/v1`  
**Demo Page:** `https://news.biaz.hurated.com`

Perfect for building WhatsApp bots, Telegram bots, or any fact-checking application!

---

## 🚀 Quick Start: Analyze Any Article

### Paste Article Text (Recommended for WhatsApp/Telegram)

```bash
curl -X POST https://api.news.biaz.hurated.com/v1/articles/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://demo.example.com/article",
    "content": "Your article text here..."
  }'
```

**What you get back:**
- ✅ **Truth Score** (0.0-1.0) - How factual is this article?
- ✅ **Claims Extracted** - Individual factual statements
- ✅ **Verification Status** - Each claim verified with evidence links
- ✅ **Stock Symbols** - Companies mentioned or affected
- ✅ **Stock Prices** - Real-time prices and changes
- ✅ **Impact Analysis** - How this news affects markets

### Response Example

```json
{
  "id": "art_1761607155795",
  "title": "Hurricane Melissa Intensifies to Category 5",
  "truthScore": 0.97,
  "explanation": "High confidence: 35 of 35 claims verified with strong evidence.",
  "impactSentiment": "negative",
  
  "symbolsMentioned": [],
  "symbolsAffected": [
    {
      "symbol": "ALL",
      "name": "The Allstate Corporation",
      "price": 193.20,
      "change": 0.01,
      "link": "https://finance.yahoo.com/quote/ALL"
    },
    {
      "symbol": "TRV",
      "name": "The Travelers Companies, Inc.",
      "price": 245.67,
      "change": -0.15,
      "link": "https://finance.yahoo.com/quote/TRV"
    }
  ],
  
  "claims": [
    {
      "text": "Hurricane Melissa has intensified to Category 5 status",
      "verified": true,
      "confidence": 0.95,
      "evidenceLinks": [
        "https://www.nhc.noaa.gov/...",
        "https://weather.com/...",
        "https://www.cnn.com/..."
      ]
    }
  ]
}
```

---

## 🤖 Perfect for Bots

### WhatsApp Bot Example

```javascript
// When user sends article text
async function analyzeArticle(articleText) {
  const response = await fetch('https://api.news.biaz.hurated.com/v1/articles/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://demo.example.com/article',
      content: articleText
    })
  });
  
  const data = await response.json();
  
  // Send back to user
  return `
📊 Truth Score: ${(data.truthScore * 100).toFixed(0)}%
${data.explanation}

📈 Affected Companies:
${data.symbolsAffected.map(s => 
  `${s.symbol}: $${s.price} (${s.change > 0 ? '+' : ''}${s.change}%)`
).join('\n')}

✓ ${data.claims.filter(c => c.verified).length} claims verified
✗ ${data.claims.filter(c => !c.verified).length} claims unverified
  `;
}
```

### Telegram Bot Example

```python
import requests

def analyze_article(article_text):
    response = requests.post(
        'https://api.news.biaz.hurated.com/v1/articles/ingest',
        json={
            'url': 'https://demo.example.com/article',
            'content': article_text
        }
    )
    data = response.json()
    
    message = f"""
📊 Truth Score: {data['truthScore'] * 100:.0f}%
{data['explanation']}

📈 Affected Stocks:
"""
    for stock in data['symbolsAffected']:
        change_emoji = '📈' if stock['change'] > 0 else '📉'
        message += f"{change_emoji} {stock['symbol']}: ${stock['price']}\n"
    
    return message
```

---

## 🎯 Key Features

### 1. Smart Symbol Detection

The API finds two types of symbols:

**Mentioned** - Companies explicitly named in the article  
**Affected** - Companies that would be impacted by the events

Example: An article about "Hurricane Melissa" finds:
- Insurance companies: ALL, TRV, AIG
- Hotels/Airlines: MAR, UAL, DAL
- Home improvement: HD, LOW

### 2. Claim Verification

Each factual statement is:
- Extracted automatically
- Verified against multiple sources
- Rated with confidence score
- Backed by evidence links (minimum 3 per claim)

### 3. Caching & Performance

- Same article text = instant cached results
- Content-based hashing (whitespace-insensitive)
- No duplicate analysis charges

### 4. Rate Limits

- **General:** 100 requests/minute per IP
- **AI Analysis:** 20 requests/5 minutes per IP
- Perfect for hackathon demos!

---

## 📚 Additional Endpoints

### Get Article by ID

```bash
curl https://api.news.biaz.hurated.com/v1/articles/{article_id}
```

### List Recent Articles

```bash
curl https://api.news.biaz.hurated.com/v1/articles?limit=10
```

### Search by Symbol

```bash
curl https://api.news.biaz.hurated.com/v1/articles?symbol=AAPL
```

### Get Stock Info

```bash
curl https://api.news.biaz.hurated.com/v1/stocks?search=AAPL
```

---

## 🔧 Error Handling

### 429 - Rate Limit

```json
{
  "error": "Too many requests, please try again later."
}
```

**Solution:** Wait for the time specified in `RateLimit-Reset` header

### 500 - Analysis Failed

```json
{
  "error": "No stock symbols found in article"
}
```

**Solution:** Article might not be finance-related. The API focuses on financial news.

---

## 💡 Use Cases

### ✅ WhatsApp Fact-Checker Bot
Paste article → Get truth score + verified claims

### ✅ Telegram Investment Bot
Share news → Get affected stocks + price impact

### ✅ Discord Market Alert
Monitor news → Alert on high-impact verified stories

### ✅ Slack Integration
Team shares article → Auto-analyze credibility

### ✅ Chrome Extension
Highlight text → Right-click → Analyze

---

## 🎨 Demo Page

Try it live: **https://news.biaz.hurated.com**

Paste any financial article and see:
- Truth score calculation
- Claim-by-claim verification
- Stock impact analysis
- Real-time prices

---

## 🚨 Important Notes

### Content Requirements
- Works best with financial/business news
- Minimum ~100 words for meaningful analysis
- English language only

### What Gets Analyzed
- Factual claims (not opinions)
- Company mentions and impacts
- Market-moving events
- Verifiable statements

### What Doesn't Work
- Opinion pieces (no factual claims)
- Very short snippets
- Non-English content
- Non-financial topics (may return no symbols)

---

## 🏆 Hackathon Tips

### 1. Cache Results
Same article = same hash = instant response. Show "Analyzing..." only on first request.

### 2. Handle Timeouts
Analysis takes 5-30 seconds. Use async/await and show progress.

### 3. Format for Mobile
Truth score + top 3 stocks + claim count = perfect WhatsApp message

### 4. Error Messages
"This doesn't look like financial news" is better than showing raw errors.

### 5. Demo Data
Use the Hurricane Melissa example from the demo page for testing.

---

## 📞 Support

- **Demo Page:** https://news.biaz.hurated.com
- **GitHub:** https://github.com/Hack-a-tons/BIAZ-Finance
- **Issues:** Create a GitHub issue

---

## 🎉 Built For Hackathons

This API was built at the De-Vibed Hackathon and is optimized for rapid prototyping:

- ✅ No API keys required
- ✅ Generous rate limits
- ✅ CORS enabled
- ✅ Detailed error messages
- ✅ Fast response times
- ✅ Real-time stock data
- ✅ Production-ready infrastructure

**Go build something awesome! 🚀**
