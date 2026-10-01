import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
})

export const config = {
  matcher: [
    '/page-editor',
    '/admin/page-editor',
    '/dashboard/:path*',
    '/content/:path*',
    '/layout/:path*',
    '/media/:path*',
    '/settings/:path*',
    '/leads/:path*',
    '/users/:path*',
    '/information/:path*',
    '/apps/:path*',
    '/charts/:path*',
    '/extended/:path*',
    '/forms/:path*',
    '/icons/:path*',
    '/maps/:path*',
    '/pages/:path*',
    '/tables/:path*',
    '/ui/:path*',
    '/preview/:path*',
  ],
}
