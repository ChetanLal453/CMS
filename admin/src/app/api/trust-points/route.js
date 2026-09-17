import pool from '../../../lib/db.js'
import { tableExists } from '../_utils/crud.js'

export async function GET() {
  try {
    if (await tableExists('trust_points')) {
      const [rows] = await pool.execute('SELECT main, sub FROM trust_points ORDER BY sort_order')
      return Response.json(rows)
    }

    if (await tableExists('stats')) {
      const [rows] = await pool.execute(
        'SELECT label AS main, value AS sub FROM stats ORDER BY order_index, id ASC',
      )
      return Response.json(rows)
    }

    return Response.json([])
  } catch (error) {
    console.error(error)
    return Response.json([])
  }
}
