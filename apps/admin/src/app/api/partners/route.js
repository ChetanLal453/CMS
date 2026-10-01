import pool from '../../../lib/db.js'

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT name, image, image AS logo, url FROM partners ORDER BY order_index ASC, id ASC',
    )
    return Response.json(rows)
  } catch (error) {
    console.error(error)
    return Response.json([], { status: 500 })
  }
}
