-- BIAZ Finance Database Schema

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  credibility_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (credibility_score >= 0 AND credibility_score <= 1),
  category VARCHAR(50) NOT NULL,
  verified_publisher BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP NOT NULL,
  source_id VARCHAR(50) REFERENCES sources(id),
  truth_score DECIMAL(3,2) CHECK (truth_score >= 0 AND truth_score <= 1),
  impact_sentiment VARCHAR(20),
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
  symbol VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  exchange VARCHAR(50),
  sector VARCHAR(100),
  current_price DECIMAL(10,2),
  change VARCHAR(20),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Article-Symbol junction table (many-to-many)
CREATE TABLE IF NOT EXISTS article_symbols (
  article_id VARCHAR(50) REFERENCES articles(id) ON DELETE CASCADE,
  symbol VARCHAR(10) REFERENCES stocks(symbol),
  PRIMARY KEY (article_id, symbol)
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id VARCHAR(50) PRIMARY KEY,
  article_id VARCHAR(50) REFERENCES articles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Claim evidence table (one-to-many)
CREATE TABLE IF NOT EXISTS claim_evidence (
  id SERIAL PRIMARY KEY,
  claim_id VARCHAR(50) REFERENCES claims(id) ON DELETE CASCADE,
  url TEXT NOT NULL
);

-- Forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
  id VARCHAR(50) PRIMARY KEY,
  article_id VARCHAR(50) REFERENCES articles(id) ON DELETE CASCADE,
  symbol VARCHAR(10) REFERENCES stocks(symbol),
  sentiment VARCHAR(20) NOT NULL,
  impact_score DECIMAL(3,2) CHECK (impact_score >= 0 AND impact_score <= 1),
  price_target DECIMAL(10,2),
  time_horizon VARCHAR(20) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  generated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_symbols_symbol ON article_symbols(symbol);
CREATE INDEX IF NOT EXISTS idx_claims_article ON claims(article_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_article ON forecasts(article_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_symbol ON forecasts(symbol);

-- Seed initial sources
INSERT INTO sources (id, name, domain, credibility_score, category, verified_publisher) VALUES
  ('src_001', 'Financial Times', 'ft.com', 0.95, 'mainstream_media', true),
  ('src_002', 'TechCrunch', 'techcrunch.com', 0.88, 'tech_media', true),
  ('src_003', 'Reuters', 'reuters.com', 0.97, 'news_agency', true)
ON CONFLICT (id) DO NOTHING;
