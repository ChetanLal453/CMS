import { unlink } from 'fs/promises'
import { basename, join } from 'path'
import pool from '../../../../lib/db.js'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { missingTableResponse, tableExists } from '../../_utils/crud.js'

export async function DELETE(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('media_library'))) {
      return missingTableResponse('media_library')
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ success: false, error: 'Media ID is required' }, { status: 400 })
    }

    const [rows] = await pool.execute(
      'SELECT COALESCE(filename, name) AS filename, url FROM media_library WHERE id = ?',
      [id],
    )

    if (rows.length === 0) {
      return Response.json({ success: false, error: 'Media not found' }, { status: 404 })
    }

    const media = rows[0]
    const storedFilename = media.filename || basename(media.url || '')

    if (storedFilename) {
      try {
        const filePath = join(process.cwd(), 'public', 'uploads', storedFilename)
        await unlink(filePath)
      } catch (fileError) {
        console.warn('Could not delete file from disk:', fileError)
      }
    }

    await pool.execute('DELETE FROM media_library WHERE id = ?', [id])

    return Response.json({ success: true, message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media:', error)
    return Response.json({ success: false, error: 'Failed to delete media' }, { status: 500 })
  }
}
