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
    // Hard-coded for testing - REMOVE after maps work
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'AIzaSyCCMYQ_eQdaKPV30JGFEv_556O8N-ZzV9E',
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: 'AIzaSyCCMYQ_eQdaKPV30JGFEv_556O8N-ZzV9E',
  },
  experimental: {
    optimizeCss: false,
  },
}

export default nextConfig
