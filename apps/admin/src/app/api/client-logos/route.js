import pool from '../../../lib/db.js'
import { tableExists } from '../_utils/crud.js'

export async function GET() {
  try {
    if (await tableExists('client_logos')) {
      const [rows] = await pool.execute('SELECT image, alt_text FROM client_logos ORDER BY sort_order')
      return Response.json(rows)
    }

    if (await tableExists('partners')) {
      const [rows] = await pool.execute(
        'SELECT image, name AS alt_text FROM partners ORDER BY order_index, id ASC',
      )
      return Response.json(rows)
    }

    return Response.json([])
  } catch (error) {
    console.error(error)
    return Response.json([])
  }
}
