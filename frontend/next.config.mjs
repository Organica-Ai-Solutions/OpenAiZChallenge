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
  env: {
    NEXT_PUBLIC_API_URL: process.env.BACKEND_PORT 
      ? `http://localhost:${process.env.BACKEND_PORT}` 
      : 'http://localhost:8000',
  },
}

export default nextConfig
