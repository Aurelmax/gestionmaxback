import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Backend API-only configuration
  experimental: {
    reactCompiler: false,
    serverComponentsExternalPackages: ['@payloadcms/next'],
  },

  // Disable image optimization (not needed for API-only)
  images: {
    unoptimized: true,
  },

  // Optimize for production
  compress: true,
  poweredByHeader: false,

  // Ignore errors during build (Payload types are generated)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  },
}

export default withPayload(nextConfig)
