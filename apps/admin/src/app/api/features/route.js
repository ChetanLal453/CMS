import pool from '../../../lib/db.js'
import { tableExists } from '../_utils/crud.js'

export async function GET() {
  try {
    if (await tableExists('features')) {
      const [rows] = await pool.execute('SELECT title, description, icon, image, url FROM features ORDER BY order_index')
      return Response.json(rows)
    }

    if (await tableExists('services')) {
      const [rows] = await pool.execute(
        'SELECT title, description, icon, image, url FROM services WHERE is_active = 1 ORDER BY order_index, id ASC',
      )
      return Response.json(rows)
    }

    return Response.json([])
  } catch (error) {
    console.error(error)
    return Response.json([])
  }
}
