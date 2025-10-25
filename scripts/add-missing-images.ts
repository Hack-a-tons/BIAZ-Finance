import { query } from '../src/db';
import { generateImage } from '../src/ai/generate-image';

async function addMissingImages() {
  try {
    // Find articles without images
    const result = await query(
      `SELECT a.id, a.title, s.symbol 
       FROM articles a 
       LEFT JOIN article_symbols s ON a.id = s.article_id 
       WHERE a.image_url IS NULL OR a.image_url = ''
       ORDER BY a.published_at DESC
       LIMIT 10`
    );

    console.log(`Found ${result.rows.length} articles without images`);

    for (const row of result.rows) {
      console.log(`\nProcessing: ${row.title}`);
      console.log(`Symbol: ${row.symbol}`);
      
      if (!row.symbol) {
        console.log('Skipping: no symbol');
        continue;
      }

      const imageUrl = await generateImage(row.title, row.symbol);
      
      if (imageUrl) {
        await query(
          'UPDATE articles SET image_url = $1 WHERE id = $2',
          [imageUrl, row.id]
        );
        console.log(`✓ Added image: ${imageUrl}`);
      } else {
        console.log('✗ Failed to generate image');
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

addMissingImages();
