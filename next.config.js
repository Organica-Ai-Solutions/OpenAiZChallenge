/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  },
  images: {
    domains: [
      'upload.wikimedia.org',
      'commons.wikimedia.org',
      'www.famsi.org',
      'famsi.org',
      'loc.gov',
      'www.loc.gov',
      'dl.wdl.org',
      'www.wdl.org',
      'inah.gob.mx',
      'www.inah.gob.mx',
      'via.placeholder.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.famsi.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.loc.gov',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.wdl.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.inah.gob.mx',
        port: '',
        pathname: '/**',
      }
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  }
}

module.exports = nextConfig 