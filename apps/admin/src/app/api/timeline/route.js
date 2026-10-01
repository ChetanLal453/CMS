import pool from '../../../lib/db.js';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT year, title, description FROM timeline ORDER BY year');
    return Response.json(rows);
  } catch (error) {
    console.error(error);
    return Response.json([]);
  }
}
