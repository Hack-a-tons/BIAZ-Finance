import { query } from '../db';

export async function matchSource(domain: string): Promise<string> {
  try {
    // Try to find existing source by domain
    const result = await query(
      'SELECT id FROM sources WHERE domain = $1',
      [domain]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create new custom source
    const sourceId = `src_${Date.now()}`;
    await query(
      `INSERT INTO sources (id, name, domain, credibility_score, category, verified_publisher)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sourceId, domain, domain, 0.5, 'custom', false]
    );

    console.log(`Created new source: ${sourceId} for ${domain}`);
    return sourceId;
  } catch (error) {
    console.error('Source matching error:', error);
    throw error;
  }
}
