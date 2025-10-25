-- Add forecast_summary column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS forecast_summary TEXT;
