/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    NEXT_PUBLIC_SKIP_PREFLIGHT_CHECK: 'true',
  },
}

export default nextConfig
