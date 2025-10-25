import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
dotenv.config();

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function main() {
  console.log('Searching for news-related actors...\n');
  
  const actors = [
    'apify/google-news-scraper',
    'apify/rss-feed-scraper', 
    'lukaskrivka/rss-actor',
    'dtrungtin/rss-feed-reader',
    'misceres/google-news-scraper',
  ];
  
  for (const actorId of actors) {
    try {
      const actor = await client.actor(actorId).get();
      console.log(`✓ ${actorId}`);
      console.log(`  Runs: ${actor?.stats?.totalRuns || 0}`);
      console.log(`  Users: ${actor?.stats?.totalUsers || 0}`);
      console.log(`  Rating: ${actor?.stats?.avgRating || 'N/A'}`);
      console.log('');
    } catch (e: any) {
      console.log(`✗ ${actorId} - Not found`);
      console.log('');
    }
  }
}

main().catch(console.error);
