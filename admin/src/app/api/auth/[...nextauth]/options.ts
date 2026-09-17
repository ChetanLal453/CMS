import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { randomBytes } from 'crypto'

function requireEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required for secure authentication.`)
  }

  return value
}

const nextAuthSecret = requireEnv('NEXTAUTH_SECRET')
const adminEmail = requireEnv('ADMIN_EMAIL').toLowerCase()
const adminPassword = requireEnv('ADMIN_PASSWORD')
const adminName = process.env.ADMIN_NAME?.trim() || 'Admin User'

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email:',
          type: 'text',
          placeholder: 'Enter your username',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password || ''

        // Security: credentials are validated only against server-side environment variables.
        if (email === adminEmail && password === adminPassword) {
          return {
            id: 'admin',
            email: adminEmail,
            name: adminName,
            role: 'admin',
          }
        }

        throw new Error('Email or Password is not valid')
      },
    }),
  ],
  secret: nextAuthSecret,
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'admin'
      }

      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        email: session.user?.email || adminEmail,
        name: session.user?.name || adminName,
        role: String(token.role || 'admin'),
      }

      return session
    },
  },
  session: {
    maxAge: 24 * 60 * 60,
    generateSessionToken: () => {
      return randomBytes(32).toString('hex')
    },
  },
}
