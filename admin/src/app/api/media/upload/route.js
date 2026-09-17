import { writeFile, mkdir } from 'fs/promises'
import { extname, join } from 'path'
import pool from '../../../../lib/db.js'
import { randomUUID } from 'crypto'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { getExistingColumns, missingTableResponse, tableExists } from '../../_utils/crud.js'

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

function hasAllowedImageExtension(filename) {
  return ALLOWED_IMAGE_EXTENSIONS.has(extname(filename || '').toLowerCase())
}

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('media_library'))) {
      return missingTableResponse('media_library')
    }

    const formData = await request.formData()
    const providedFiles = formData.getAll('files')
    const singleImage = formData.get('image')
    const files = providedFiles.length ? providedFiles : singleImage ? [singleImage] : []

    if (!files.length) {
      return Response.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const uploaded = []
    const tableColumns = new Set(await getExistingColumns('media_library'))

    if (!tableColumns.size) {
      return missingTableResponse('media_library')
    }

    for (const file of files) {
      if (!(file instanceof File)) {
        continue
      }

      const extension = extname(file.name || '').toLowerCase()
      const normalizedMimeType = String(file.type || '').toLowerCase()

      // Security: only allow a tight set of non-scriptable image uploads.
      if (!ALLOWED_IMAGE_MIME_TYPES.has(normalizedMimeType) || !hasAllowedImageExtension(file.name)) {
        return Response.json({ success: false, error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 })
      }

      // Security: enforce a server-side upload limit before writing to disk.
      if (Number(file.size || 0) > MAX_UPLOAD_SIZE_BYTES) {
        return Response.json({ success: false, error: 'File size exceeds the 10MB upload limit' }, { status: 400 })
      }

      const mediaId = randomUUID()
      const uniqueName = `${mediaId}${extension}`
      const filePath = join(uploadDir, uniqueName)
      const fileUrl = `/uploads/${uniqueName}`
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await writeFile(filePath, buffer)

      const insertableValues = {
        name: uniqueName,
        original_name: file.name,
        filename: uniqueName,
        original_filename: file.name,
        url: fileUrl,
        type: normalizedMimeType,
        size: Number(file.size || 0),
        alt: '',
        tags: JSON.stringify([]),
      }

      const valueColumns = Object.keys(insertableValues).filter((column) => tableColumns.has(column))
      const valuePlaceholders = valueColumns.map(() => '?')
      const valueParams = valueColumns.map((column) => insertableValues[column])

      const nowColumns = []
      if (tableColumns.has('uploaded_at')) nowColumns.push('uploaded_at')
      if (tableColumns.has('updated_at')) nowColumns.push('updated_at')
      if (tableColumns.has('created_at')) nowColumns.push('created_at')

      const allColumns = [...valueColumns, ...nowColumns]
      const allPlaceholders = [...valuePlaceholders, ...nowColumns.map(() => 'NOW()')]

      if (!allColumns.length) {
        throw new Error('media_library table has no writable columns for upload')
      }

      let persistedId = mediaId

      if (tableColumns.has('id')) {
        try {
          const columnsWithId = ['id', ...allColumns]
          const placeholdersWithId = ['?', ...allPlaceholders]
          const paramsWithId = [mediaId, ...valueParams]
          const [insertResult] = await pool.execute(
            `INSERT INTO media_library (${columnsWithId.join(', ')}) VALUES (${placeholdersWithId.join(', ')})`,
            paramsWithId,
          )
          if (insertResult?.insertId) {
            persistedId = insertResult.insertId
          }
        } catch {
          const [insertResult] = await pool.execute(
            `INSERT INTO media_library (${allColumns.join(', ')}) VALUES (${allPlaceholders.join(', ')})`,
            valueParams,
          )
          if (insertResult?.insertId) {
            persistedId = insertResult.insertId
          }
        }
      } else {
        await pool.execute(
          `INSERT INTO media_library (${allColumns.join(', ')}) VALUES (${allPlaceholders.join(', ')})`,
          valueParams,
        )
      }

      uploaded.push({
        id: persistedId,
        filename: uniqueName,
        original_filename: file.name,
        url: fileUrl,
        type: normalizedMimeType,
        size: Number(file.size || 0),
        alt: '',
        tags: [],
      })
    }

    if (!uploaded.length) {
      return Response.json({ success: false, error: 'No valid files provided' }, { status: 400 })
    }

    return Response.json({
      success: true,
      uploaded,
      media: uploaded,
      imageUrl: uploaded[0].url,
      file: uploaded[0],
      message: `${uploaded.length} file(s) uploaded successfully`,
    })
  } catch (error) {
    console.error('Error uploading media:', error)
    return Response.json({ success: false, error: 'Failed to upload media' }, { status: 500 })
  }
}
