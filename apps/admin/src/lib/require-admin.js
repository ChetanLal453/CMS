import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { options } from '@/app/api/auth/[...nextauth]/options'

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export async function requireAdmin() {
  // Security: block unauthenticated requests before any route touches the database.
  const session = await getServerSession(options)

  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  const sessionEmail = normalizeEmail(session.user.email)
  const configuredAdminEmail = normalizeEmail(process.env.ADMIN_EMAIL)
  const sessionRole = String(session.user.role || '').trim().toLowerCase()

  // Security: require an explicit admin identity from the server-side session.
  if (sessionRole !== 'admin' && (!configuredAdminEmail || sessionEmail !== configuredAdminEmail)) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
  }

  return null
}
