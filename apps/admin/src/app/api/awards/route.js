import pool from '../../../lib/db.js';

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT title, description, image, year FROM awards ORDER BY year DESC');
    return Response.json(rows);
  } catch (error) {
    console.error(error);
    return Response.json([]);
  }
}
