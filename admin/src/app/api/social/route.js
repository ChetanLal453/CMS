import pool from '../../../lib/db.js';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT platform, url FROM social ORDER BY sort_order');
    return Response.json(rows);
  } catch (error) {
    console.error(error);
    return Response.json([]);
  }
}
