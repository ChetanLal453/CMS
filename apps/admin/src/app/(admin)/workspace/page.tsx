import { redirect } from 'next/navigation'
import pool from '@/lib/db'

export default async function WorkspaceIndexPage() {
  try {
    const [rows]: any = await pool.query('SELECT slug FROM sites ORDER BY id ASC LIMIT 1')
    if (rows && rows.length > 0 && rows[0]?.slug) {
      redirect(`/workspace/${rows[0].slug}`)
    }
  } catch {
    // Graceful fallback if database is unseeded or during static build
  }

  redirect('/workspace/curvemetrics')
}
