import { createRequire } from 'module'

const require = createRequire(import.meta.url)

import fs from 'fs'
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'react$': require.resolve('react'),
        'react-dom$': require.resolve('react-dom'),
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      }
    }

    config.plugins = config.plugins || []
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.done.tap('EnsurePagesManifestPlugin', () => {
          try {
            const manifestPath = path.join(process.cwd(), '.next', 'server', 'pages-manifest.json')
            let current = {}
            if (fs.existsSync(manifestPath)) {
              current = JSON.parse(fs.readFileSync(manifestPath, 'utf8') || '{}')
            }
            current['/_document'] = current['/_document'] || 'pages/_document.js'
            current['/_app'] = current['/_app'] || 'pages/_app.js'
            current['/_error'] = current['/_error'] || 'pages/_error.js'
            fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
            fs.writeFileSync(manifestPath, JSON.stringify(current, null, 2))
          } catch {
            // ignore
          }
        })
      },
    })

    return config
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/page-editor',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
